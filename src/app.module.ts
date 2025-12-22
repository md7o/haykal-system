import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { LoggerModule } from 'nestjs-pino';
import { RequestCountService } from './common/request-counter/services/request-count.service';
import { RequestCountMiddleware } from './common/request-counter/middleware/request-count.middleware';
import { MetricsController } from './common/request-counter/controllers/metrics.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },
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
  ],
  controllers: [MetricsController],
  providers: [RequestCountService, RequestCountMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // apply only to login route
    consumer.apply(DeviceInfoMiddleware).forRoutes('auth/signin');

    // Count every incoming HTTP request and expose the count via a header
    consumer.apply(RequestCountMiddleware).forRoutes('*');
  }
}
