import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const createTypeOrmOptions = (configService: ConfigService): TypeOrmModuleOptions => {
  const host = configService.get<string>('DB_HOST');
  const port = Number(configService.get<number | string>('DB_PORT') ?? 5432);
  const username = configService.get<string>('DB_USERNAME');
  const password = configService.get<string>('DB_PASSWORD');
  const database = configService.get<string>('DB_NAME');

  return {
    type: 'postgres',
    host,
    port,
    username,
    password,
    database,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: configService.get<string>('NODE_ENV') !== 'production',
  } as TypeOrmModuleOptions;
};
