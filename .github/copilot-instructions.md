## Haykal System — AI helper instructions

This project is a NestJS (TypeScript) HTTP API. The goal of these notes is to help an AI coding agent be productive immediately.

- **Bootstrapping:** App entry is [src/main.ts](src/main.ts#L1). Global pipes, filters, CORS, Swagger and logger are configured there.
- **Root module:** [src/app.module.ts](src/app.module.ts#L1) imports feature modules and configures middleware (see `configure()` for middleware application patterns).

- **Major modules:** `auth`, `user`, `community`, and `portfolio-builder-tool` are feature areas under `src/`. Each module follows this layout:
  - controllers: `*.controller.ts` (e.g. [src/auth/auth.controller.ts](src/auth/auth.controller.ts#L1))
  - services: `*.service.ts`
  - dto/: request/response DTOs
  - entities/: TypeORM entities

- **ORM & Config:** TypeORM is configured via [src/config/database.config.ts](src/config/database.config.ts). Environment-driven configuration is used through `@nestjs/config` and `ConfigModule.forRoot()`.

- **Auth patterns:** JWT and Passport are used. See [src/auth/auth.module.ts](src/auth/auth.module.ts#L1) for JwtModule registration and strategies in `src/auth/strategies/`.

- **Middleware / Guards / Filters:** Middleware is applied in `AppModule.configure()` (e.g. `DeviceInfoMiddleware`, request counter). Global guards like Throttler are provided via `APP_GUARD`. Exception filter lives in [src/common/filter/http-exception.filter.ts](src/common/filter/http-exception.filter.ts#L1).

- **Logging & Observability:** Uses `nestjs-pino` with `pino-pretty` in development (configured in `AppModule`). Request counter exposes a metrics controller at `common/request-counter`.

- **Scheduling:** Background jobs use `@nestjs/schedule` (ScheduleModule is registered in modules like `AuthModule` for periodic cleanup tasks).

- **Validation & security:** Global `ValidationPipe` configured with `whitelist`, `transform`, and `forbidNonWhitelisted` in `main.ts`. Watch for DTO strictness when changing APIs.

- **Scripts / workflow:** Use the `package.json` scripts:
  - `npm run start` / `npm run start:dev` — run server
  - `npm run build` — compile to `dist/`
  - `npm run test` / `npm run test:e2e` — unit and e2e tests

- **Project conventions (follow these exactly):**
  - Files: controllers end with `.controller.ts`, services `.service.ts`, entities under `entities/`, DTOs under `dto/`.
  - TypeORM entities are registered via `TypeOrmModule.forFeature([...])` inside the module that uses them.
  - Add new global middleware in `AppModule.configure()` using `consumer.apply(...).forRoutes(...)`.

- **Integration notes / external deps:**
  - Database: Postgres via `pg` + `typeorm` (see DB config file).
  - Redis: `ioredis` is present for caching/locks — search `redis` provider under `src/common/redis/`.
  - Emails: `nodemailer` / `@getbrevo/brevo` are available for transactional emails.

- **When editing code, prefer:**
  - Updating DTOs + validation rules before changing controllers.
  - Updating TypeORM entities and running migrations (if applicable) when changing schema.

- **Useful example locations:**
  - App bootstrap: [src/main.ts](src/main.ts#L1)
  - Module pattern: [src/auth/auth.module.ts](src/auth/auth.module.ts#L1)
  - Global filter: [src/common/filter/http-exception.filter.ts](src/common/filter/http-exception.filter.ts#L1)

If anything here is unclear or you want more detail (for example, common code patterns inside `community/` or database connection settings), tell me which area and I'll expand the instructions or merge in existing guidance.
