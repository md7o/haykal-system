import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportLocalGuard } from './guards/passport-local.guard';
import { JwtAuthGuard } from './guards/auth.guard';
import type { RequestWithDevice } from './interfaces/auth-types';

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

  @Post('signup')
  signUp(@Body() input: { email: string; password: string; username: string }) {
    return this.authService.signUp(input);
  }

  @UseGuards(PassportLocalGuard)
  @Post('signin')
  signIn(
    @Req() req: RequestWithDevice,
    @Body() input: { email: string; password: string },
  ) {
    return this.authService.signIn(input, req);
  }

  @Post('logout')
  logout(@Body('userId') userId: string) {
    return this.authService.logout(userId);
  }
}
