import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { PassportLocalGuard } from './guards/passport-local.guard';
import { JwtAuthGuard } from './guards/auth.guard';
import type {
  RequestWithDevice,
  SignUpDto,
  SignInDto,
} from './interfaces/auth-types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Request() req: { user: { userId: string } }) {
    return this.authService.me(req.user.userId);
  }

  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
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
  signIn(@Req() req: RequestWithDevice, @Body() input: SignInDto) {
    return this.authService.signIn(input, req);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Body('userId') userId: string) {
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
    if (password !== confirmPassword)
      throw new UnauthorizedException('Passwords do not match');
    return this.authService.resetPasswordWithCode(email, code, password);
  }
}
