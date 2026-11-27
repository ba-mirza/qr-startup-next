# KasipQR

> **QR in everywhere.**

SaaS для бизнеса в Казахстане, где QR-код служит точкой входа: сотрудник отмечает приход и
уход, гость оставляет отзыв или открывает меню, касса начисляет бонусы покупателю. Любой
бизнес регистрируется сам, создаёт организацию и подключает только нужные **модули**.

## Стек

- **Next.js 16** (App Router, React Compiler) + React 19 + TypeScript strict
- **Supabase**: Postgres, Auth (email + пароль), RLS, RPC-функции
- **TanStack Query** для данных, **zustand** для состояния интерфейса
- **Mantine 9** + **Sass Modules** (БЭМ), иконки `lucide-react`
- **next-intl**: `ru` (по умолчанию), `kk`, `en`
- **react-hook-form** + **Zod 4**
- Менеджер пакетов: **pnpm**

## Быстрый старт

```bash
pnpm install
cp .env.example .env.local   # ключи Supabase
pnpm dev                     # http://localhost:3000
```

Перед пушем: `pnpm lint && pnpm build` и прогон по [REVIEW.md](./REVIEW.md).

### Переменные окружения

| Переменная                             | Где взять                                    |
| -------------------------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase → Project Settings → API            |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API (publishable / anon) |

Ключ `secret` / `service_role` в проект **не добавляем**: всё работает через publishable-ключ и RLS.

### База данных

Supabase CLI не используется. Миграции лежат в `supabase/migrations/` и применяются по порядку
в Supabase → SQL Editor на пустом проекте.

В Supabase → Authentication → URL Configuration:

- Site URL: `http://localhost:3000` (на проде — домен);
- Redirect URLs: `http://localhost:3000/auth/callback`.

## Структура

```
src/
  app/
    [locale]/          лендинг, (focus)/ — вход, регистрация, онбординг; dashboard/; q/[token] — вход по QR
    auth/callback/     обмен кода подтверждения email на сессию
    providers.tsx      Mantine, TanStack Query
  proxy.ts             язык, обновление сессии, защита /dashboard и /onboarding
  i18n/                роутинг, навигация, загрузка сообщений
  shared/              api/supabase, config, lib, ui (тема, общие компоненты), styles
  entities/            organization, module, session
  features/            auth, create-organization, connect-module
  widgets/             SiteHeader, SiteFooter, Landing, DashboardShell, DashboardOverview, ModuleLocked
  modules/             модули: attendance, feedback, menu + реестр index.ts
messages/<locale>/     тексты: core.json + <module>.json (заполняется только ru)
supabase/migrations/   SQL-миграции
```

Правила кода — в [CLAUDE.md](./CLAUDE.md).

## Доменная модель (ядро)

```
auth.users ─< org_members >─ organizations (tax_id + tax_id_type, slug, timezone)
               role: owner | cashier          │
               point_id (кассир)              ├─< points (is_main, is_active, координаты)
                                              ├─< qr_codes (module, purpose, token)
                                              └─< org_modules >─ modules (каталог)
                                                    status, active_until, trial_used
```

- Организация — ТОО по БИН или ИП по ИИН. Номер уникален и проверяется по контрольной цифре.
- `create_organization` одной транзакцией создаёт организацию, главную точку и владельца.
- У пользователя может быть несколько организаций, у организации — несколько участников.
- Модуль доступен, если в `org_modules` статус `active` и не истёк `active_until`.
- Пробный период (`start_module_trial`) выдаётся один раз на организацию, а значит на БИН/ИИН.

## Что готово

- Лендинг: модули, как это работает, тарифы, о продукте
- Регистрация и вход по email, подтверждение почты
- Онбординг: создание организации
- Кабинет: боковое меню по подключённым модулям, обзор, каталог модулей, пробный период
  посещаемости, экран «Подключить» для закрытых модулей

## Модули

Как устроен модуль и где его файлы — [CLAUDE.md, «Как сделать модуль»](./CLAUDE.md#как-сделать-модуль).

| Модуль       | Суть                                                         | Статус        |
| ------------ | ------------------------------------------------------------ | ------------- |
| Посещаемость | Отметка сотрудников по QR точки, журнал, геолокация          | следующий     |
| Фидбэк       | Анонимный отзыв по QR, статистика по точкам                  | в планах      |
| Меню         | QR-меню и вызов официанта                                    | в планах      |
| Бонусы       | Касса по номеру телефона начисляет бонусы, списание по SMS-коду | последним  |

Дальше по ядру: подписки и оплата через Freedom Pay, вход кассира по ссылке и PIN.

## Работа в команде

- Ветки `feat/…`, `fix/…`, `refactor/…`, `chore/…` от `main`.
- Один PR — одна задача. Ревью обязательно, правила — в [REVIEW.md](./REVIEW.md).
