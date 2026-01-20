import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { LocalStrategy } from './strategies/local.strategy';
import { RefreshTokenService } from './services/refresh-token.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt-strategy';
import { ResetPasswordService } from './services/rest-password.service';
import { VerificationService } from './services/verification.service';
import { PendingRegistrationService } from './services/pending-registration.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    ResetPasswordService,
    VerificationService,
    PendingRegistrationService,
    LocalStrategy,
    RefreshTokenService,
    JwtStrategy,
  ],
  imports: [
    UserModule,
    ConfigModule.forRoot(),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
  ],
})
export class AuthModule {}
