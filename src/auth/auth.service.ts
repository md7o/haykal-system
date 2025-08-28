import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import type {
  SignInDto,
  SignUpDto,
  SignInResponse,
  SignUpResponse,
  UserBase,
  RequestWithDevice,
} from './interfaces/auth-types';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from 'src/enums/user-role';
import { RefreshTokenService } from './refresh-token.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  // -------------------------
  // Validate user credentials
  // -------------------------
  async validateUser(
    email: string,
    password: string,
  ): Promise<UserBase | null> {
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
  async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.jwtService.sign({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = this.jwtService.sign(
      { userId: user.id },
      { expiresIn: '7d' },
    );

    await this.refreshTokenService.createRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  // -------------------------
  // Signup
  // -------------------------
  async signUp(input: SignUpDto): Promise<SignUpResponse> {
    try {
      const existingUser = await this.userService.findByUsernameOrEmail(
        input.username,
        input.email,
      );

      if (existingUser) {
        throw new ConflictException('Username or email already exists');
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const newUser = await this.userService.create({
        ...input,
        password: hashedPassword,
        role: UserRole.User,
      });

      const tokens = await this.generateTokens(newUser);

      return {
        userId: newUser.id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        ...tokens,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Registration failed');
    }
  }

  // -------------------------
  // Signin
  // -------------------------
  async signIn(
    input: SignInDto,
    req: RequestWithDevice,
  ): Promise<SignInResponse> {
    const user = await this.validateUser(input.email, input.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const foundUser = await this.userService.findOneById(user.userId);
    if (!foundUser) throw new UnauthorizedException('User not found');

    // revoke old refresh tokens
    await this.refreshTokenService.revokeTokens(foundUser.id);

    const { accessToken, refreshToken } = await this.generateTokens(foundUser);

    const deviceInfo = req.deviceInfo;

    await this.refreshTokenService.saveToken({
      userId: foundUser.id,
      token: refreshToken,
      deviceInfo: JSON.stringify(deviceInfo),
    });

    return {
      userId: user.userId,
      email: user.email,
      username: user.username,
      role: user.role,
      accessToken,
      refreshToken,
    };
  }

  // -------------------------
  // refreshTokens
  // -------------------------
  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<{ userId: string }>(refreshToken);

      const storedToken = await this.refreshTokenService.findToken(
        payload.userId,
        refreshToken,
      );
      if (!storedToken)
        throw new UnauthorizedException('Invalid refresh token');

      const user = await this.userService.findOneById(payload.userId);
      if (!user) throw new UnauthorizedException('User not found');

      // Generate new tokens and rotate refresh token
      const tokens = await this.generateTokens(user);

      // Delete old refresh token (rotation)
      await this.refreshTokenService.deleteRefreshToken(
        payload.userId,
        refreshToken,
      );

      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // -------------------------
  // Logout
  // -------------------------
  async logout(userId: string) {
    await this.refreshTokenService.revokeTokens(userId);
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
}
