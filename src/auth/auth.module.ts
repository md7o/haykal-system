import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { LocalStrategy } from './strategies/local.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from 'src/user/entities/refresh-token.entity';
import { RefreshTokenService } from './services/refresh-token.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt-strategy';
import { PasswordReset } from 'src/user/entities/password-reset.entity';
import { ResetPasswordService } from './services/rest-password.service';
import { VerificationService } from './services/verification.service';
import { PendingRegistrationService } from './services/pending-registration.service';
import { ExpiredEntitiesCleanupService } from './services/expired-entities-cleanup.service';
import { PendingRegistration } from 'src/user/entities/pending_registrations.entity';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    ResetPasswordService,
    VerificationService,
    PendingRegistrationService,
    ExpiredEntitiesCleanupService,
    LocalStrategy,
    RefreshTokenService,
    JwtStrategy,
  ],
  imports: [
    UserModule,
    TypeOrmModule.forFeature([RefreshToken, PasswordReset, PendingRegistration]),
    ConfigModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
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
