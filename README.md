# ExamClass

Монорепозиторий платформы подготовки к профильной математике ЕГЭ.

## Приложения

- `apps/web` — Next.js-фронтенд на порту `3000`.
- `apps/api` — NestJS API на порту `4000`.

## Общие пакеты

- `packages/eslint-config` — ESLint-конфигурация фронтенда.
- `packages/typescript-config` — общая TypeScript-конфигурация.
- `packages/contracts` — зарезервировано под публичные API-контракты.

## Команды

```bash
pnpm install
pnpm dev
pnpm lint
pnpm check-types
pnpm build
```

После `pnpm dev`:

- фронтенд: <http://127.0.0.1:3000>;
- API: <http://127.0.0.1:4000>.

## Локальная база данных

```bash
cp infra/.env.example infra/.env
docker compose --env-file infra/.env -f infra/docker-compose.yml up -d
cp apps/api/.env.example apps/api/.env
pnpm --filter @examclass/api exec prisma migrate dev
```

После изменения Prisma-схемы обновляй клиент:

```bash
pnpm --filter @examclass/api prisma:generate
```

## Регистрация

`POST /auth/register` принимает `email`, `password`, `firstName`, `lastName`.
Новый пользователь всегда создаётся с ролью `STUDENT`. В ответе приходят
профиль пользователя и JWT access token.

## Архитектура

Фронтенд использует Feature-Sliced Design. Маршруты Next.js находятся в
`apps/web/app`, а код экранов и нижележащих слоёв — в `apps/web/src`.

API организуется вертикальными бизнес-модулями в `apps/api/src/modules`.
Общие guards, filters, interceptors и decorators находятся в
`apps/api/src/common`.
