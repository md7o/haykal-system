import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserService } from 'src/user/user.service';
import { UserRole } from 'src/enums/user-role';
import { User } from 'src/user/entities/user.entity';
import { PasswordReset } from 'src/user/entities/password-reset.entity';

import { RefreshTokenService } from './refresh-token.service';
import { ResetPasswordService } from './rest-password.service';
import { PendingRegistrationService } from './pending-registration.service';
import { VerificationService } from './verification.service';

import type {
  SignInDto,
  SignUpDto,
  SignInResponse,
  SignUpResponse,
  UserBase,
  RequestWithDevice,
} from '../interfaces/auth-types';
import e from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(PasswordReset)
    private readonly passwordResetRepo: Repository<PasswordReset>,
    private readonly userService: UserService,
    private readonly resetPasswordService: ResetPasswordService,
    private readonly pendingService: PendingRegistrationService,
    private readonly verificationService: VerificationService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  // -------------------------
  // Validate user credentials
  // -------------------------
  async validateUser(email: string, password: string): Promise<UserBase | null> {
    const user = await this.userService.findByEmail(email);
    if (!user) return null;

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return null;

    return {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
  }

  // -------------------------
  // Generate JWTs for user
  // -------------------------
  private generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload);

    const decoded = this.jwtService.decode(accessToken) as {
      exp?: number;
    } | null;
    const accessTokenExpiry = decoded?.exp ? decoded.exp * 1000 : Date.now() + 15 * 60 * 1000; //15m

    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken, accessTokenExpiry };
  }

  // -------------------------
  // Request Signup
  // -------------------------
  async requestSignup(input: SignUpDto): Promise<{ message: string }> {
    const existingUser = await this.userService.findByUsernameOrEmail(input.username, input.email);
    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    // Remove expired pending registrations (older than 10 minutes)
    const expirationDate = new Date(Date.now() - 10);
    await this.pendingService.deleteExpiredPending(expirationDate);

    // Rate limit: allow only one OTP request per 1:30 mins (90 seconds) per email/username
    const lastPending = await this.pendingService.findLatestPending(input.email, input.username);
    if (lastPending) {
      const now = Date.now();
      const lastCreated = new Date(lastPending.createdAt).getTime();
      if (now - lastCreated < 90 * 1000) {
        throw new ConflictException(
          'You can request a new code only every 1 minute and 30 seconds. Please wait and try again.',
        );
      }
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await this.pendingService.createPendingRegistration({
      email: input.email,
      username: input.username,
      password: hashedPassword,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await this.verificationService.sendOtpVerification(input.email, code);

    return { message: 'Verification code sent to your email' };
  }

  // -------------------------
  // Verify Signup
  // -------------------------
  async verifySignup(email: string, code: string): Promise<SignUpResponse> {
    const pending = await this.pendingService.findValidCode(email, code);

    if (!pending) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    const newUser = await this.userService.create({
      email: pending.email,
      username: pending.username,
      password: pending.password,
      role: UserRole.User,
    });

    await this.pendingService.deletePending(pending.id);

    const tokens = this.generateTokens(newUser);

    return {
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
      ...tokens,
    };
  }

  // -------------------------
  // Signin
  // -------------------------
  async signIn(input: SignInDto, req: RequestWithDevice): Promise<SignInResponse> {
    const user = await this.validateUser(input.email, input.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const foundUser = await this.userService.findOneById(user.userId);
    if (!foundUser) throw new UnauthorizedException('User not found');

    await this.refreshTokenService.revokeTokens(foundUser.id);

    const { accessToken, refreshToken, accessTokenExpiry } = this.generateTokens(foundUser);

    const deviceInfo = req.deviceInfo;

    await this.refreshTokenService.saveToken({
      userId: foundUser.id,
      token: refreshToken,
      deviceInfo: JSON.stringify(deviceInfo),
      accessTokenExpiresAt: accessTokenExpiry,
    });

    return {
      userId: user.userId,
      email: user.email,
      username: user.username,
      role: user.role,
      accessToken,
      accessTokenExpiry,
      refreshToken,
    };
  }

  // -------------------------
  // refreshTokens
  // -------------------------
  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<{ sub: string }>(refreshToken);

      const storedToken = await this.refreshTokenService.findToken(payload.sub, refreshToken);
      if (!storedToken) throw new UnauthorizedException('Invalid refresh token');

      const user = await this.userService.findOneById(payload.sub);
      if (!user) throw new UnauthorizedException('User not found');

      // Rotate only after access token has expired
      const now = Date.now();
      const accessExpiryMs = storedToken.accessTokenExpiresAt ? Number(storedToken.accessTokenExpiresAt) : 0;

      if (accessExpiryMs && now < accessExpiryMs) {
        // Access token not yet expired: deny rotation until it expires
        throw new UnauthorizedException('Access token not yet expired');
      }

      // Generate new tokens and rotate refresh token
      const { accessToken, refreshToken: newRefresh, accessTokenExpiry } = this.generateTokens(user);

      // Delete old refresh token (rotation)
      await this.refreshTokenService.deleteRefreshToken(payload.sub, refreshToken);

      await this.refreshTokenService.createRefreshToken(
        user.id,
        newRefresh,
        'device-info-if-needed',
        3,
        accessTokenExpiry,
      );

      return { accessToken, refreshToken: newRefresh, accessTokenExpiry };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // -------------------------
  // Logout
  // -------------------------
  async logout(userId: string) {
    await this.refreshTokenService.revokeTokens(userId);
    return { message: 'Logout successful' };
  }

  // -------------------------
  // Get current user info
  // -------------------------
  async me(userId: string): Promise<UserBase> {
    const user = await this.userService.findOneById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    return {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
  }

  // -------------------------
  // Send Reset Code
  // -------------------------
  async sendResetCode(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) return { message: 'If this email exists, a code was sent' };

    // Delete any existing reset codes for this user
    await this.passwordResetRepo.delete({ userId: user.id });

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const hashedCode = await bcrypt.hash(code, 10);

    const resetEntry = this.passwordResetRepo.create({
      userId: user.id,
      codeHash: hashedCode,
      expiresAt: new Date(Date.now() + 1000 * 60 * 10), // 10 mins
    });

    await this.passwordResetRepo.save(resetEntry);

    await this.resetPasswordService.sendOtpEmail(user.email, code);

    return { message: 'Reset code sent to email' };
  }

  // -------------------------
  // Reset Password Code
  // -------------------------
  async resetPasswordWithCode(email: string, code: string, newPassword: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Invalid request');
    }

    const reset = await this.passwordResetRepo.findOne({
      where: { userId: user.id },
    });
    if (!reset) {
      throw new BadRequestException('Invalid or expired code');
    }
    if (reset.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired code');
    }

    const isMatch = await bcrypt.compare(code, reset.codeHash);
    if (!isMatch) {
      throw new BadRequestException('Invalid code');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userService.save(user);

    await this.passwordResetRepo.delete({ id: reset.id });

    return { message: 'Password reset successful' };
  }
}
