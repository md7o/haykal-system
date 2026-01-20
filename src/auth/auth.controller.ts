import { Controller, Get, Post, Body, UseGuards, Request, Req, UnauthorizedException, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './services/auth.service';
import { PassportLocalGuard } from './guards/passport-local.guard';
import { JwtAuthGuard } from './guards/auth.guard';
import type { RequestWithDevice, SignUpDto, SignInDto } from './interfaces/auth-types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Returns cookie options for refresh token
   */
  private getCookieOptions(): {
    httpOnly: true;
    secure: boolean;
    sameSite: 'lax' | 'none';
    path: string;
    domain?: string;
    maxAge: number;
  } {
    const isProd = process.env.NODE_ENV === 'production';
    // In dev on http://localhost, use SameSite=Lax and Secure=false.
    // In prod over HTTPS and potentially cross-site, use SameSite=None and Secure=true.
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
  }

  @Post('refresh')
  async refresh(
    @Req() req: RequestWithDevice,
    @Body('refreshToken') refreshTokenFromBody: string | undefined,
    @Res() res: Response,
  ) {
    const incomingRefreshToken = req.cookies?.['refreshToken'] || refreshTokenFromBody;
    if (!incomingRefreshToken) throw new UnauthorizedException('No refresh token');

    // 1. Get tokens from the service
    const { accessToken, accessTokenExpiry, refreshToken } = await this.authService.refreshTokens(incomingRefreshToken);

    res.cookie('refreshToken', String(refreshToken), this.getCookieOptions());

    // 2. Return tokens. Frontend can call /auth/me separately to get profile data if needed.
    return res.json({
      accessToken,
      accessTokenExpiry,
      refreshToken,
    });
  }

  @Post('request-signup')
  async requestSignup(@Body() dto: SignUpDto) {
    return this.authService.requestSignup(dto);
  }

  @Post('verify-signup')
  async verifySignup(@Body() body: { email: string; code: string }) {
    return this.authService.verifySignup(body.email, body.code);
  }

  @UseGuards(PassportLocalGuard)
  @Post('signin')
  async signIn(@Req() req: RequestWithDevice, @Body() input: SignInDto, @Res() res: Response) {
    // AuthService.signIn returns SignInResponse with user and token data
    const response = await this.authService.signIn(input, req);
    const { userId, email, username, role, accessToken, accessTokenExpiry, refreshToken } = response;

    res.cookie('refreshToken', String(refreshToken), this.getCookieOptions());
    return res.json({ userId, email, username, role, accessToken, accessTokenExpiry });
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Body('userId') userId: string, @Res({ passthrough: true }) res: Response) {
    // Clear cookie using the same attributes to ensure deletion
    const opts = this.getCookieOptions();
    res.clearCookie('refreshToken', {
      httpOnly: opts.httpOnly,
      secure: opts.secure,
      sameSite: opts.sameSite,
      path: opts.path,
      ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
    });
    return this.authService.logout(userId);
  }

  @Post('forgot-password-code')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.sendResetCode(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body('email') email: string,
    @Body('code') code: string,
    @Body('password') password: string,
    @Body('confirmPassword') confirmPassword: string,
  ) {
    if (password !== confirmPassword) {
      throw new UnauthorizedException('Passwords do not match');
    }
    return this.authService.resetPasswordWithCode(email, code, password);
  }

  // Keep 'me' only for manual profile refreshes, don't call it on app load
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Request() req: { user: { userId: string } }) {
    return this.authService.me(req.user.userId);
  }
}
