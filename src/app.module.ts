import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { createTypeOrmOptions } from './config/database.config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { DeviceInfoMiddleware } from './auth/middleware/device-info.middleware';
import { PortfolioModule } from './portfolio-builder-tool/portfolio/portfolio.module';
import { PagesModule } from './portfolio-builder-tool/pages/pages.module';
import { SectionsModule } from './portfolio-builder-tool/sections/sections.module';
import { AssetsModule } from './portfolio-builder-tool/assets/assets.module';
import { CommunityModule } from './community/community.module';
import { LoggerModule } from 'nestjs-pino';
import { RequestCountService } from './common/request-counter/services/request-count.service';
import { RequestCountMiddleware } from './common/request-counter/middleware/request-count.middleware';
import { MetricsController } from './common/request-counter/controllers/metrics.controller';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // 1 minute
          limit: 30,
        },
      ],
    }),
    ScheduleModule.forRoot(),
    LoggerModule.forRoot({
      pinoHttp: {
        // 1. Set the log level (debug, info, warn, error)
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',

        // 2. Format logs to be human-readable in development
        transport:
          process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty', options: { colorize: true } } : undefined,

        // 3. Redact sensitive information from logs
        // redact: ['req.headers.authorization', 'req.body.password'],
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: createTypeOrmOptions,
    }),
    UserModule,
    AuthModule,
    PortfolioModule,
    PagesModule,
    SectionsModule,
    AssetsModule,
    CommunityModule,
  ],
  controllers: [MetricsController],
  providers: [
    RequestCountService,
    RequestCountMiddleware,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // apply only to login route
    consumer.apply(DeviceInfoMiddleware).forRoutes('auth/signin');

    // Count every incoming HTTP request and expose the count via a header
    consumer.apply(RequestCountMiddleware).forRoutes('*');
  }
}
