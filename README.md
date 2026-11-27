# KasipQR

> **QR in everywhere.**

SaaS для бизнеса в Казахстане, где QR-код служит точкой входа: сотрудник отмечает приход и уход, клиент оставляет отзыв, гость открывает меню. Платформа делится на **ядро** (организации, точки, QR, биллинг) и **модули**, которые организация подключает под свои задачи.

Сейчас готов модуль посещаемости, остальные модули в планах.

## Стек

- **Next.js 16** (App Router, Server Actions) + React 19 + TypeScript
- **Supabase**: Postgres, Auth (email + пароль), RLS, Realtime
- **TanStack Query** для данных на клиенте
- **shadcn/ui** (Radix) + Tailwind CSS 4, иконки `lucide-react`
- **react-hook-form** + **Zod** для форм и валидации
- `qrcode.react` для генерации QR
- Менеджер пакетов: **pnpm**

## Быстрый старт

```bash
pnpm install
cp .env.example .env.local   # заполнить ключи Supabase
pnpm dev                     # http://localhost:3000

```

Перед пушем:

```bash
pnpm lint
pnpm build

```

### Переменные окружения


| Переменная                      | Где взять                                                  |
| ------------------------------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase → Project Settings → API                          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API (anon / publishable key) |


`service_role` ключ в проект **не добавляем**: всё работает через anon-ключ и RLS.

### База данных

> ⚠️ Схема пока живёт только в Supabase Dashboard, миграций в репо нет. Первая задача — выгрузить её в `supabase/migrations/` (см. «Ближайшие задачи»). До этого доступ к dev-проекту Supabase выдаёт владелец репо.

После того как появятся миграции:

```bash
supabase start               # локальный Supabase в Docker
supabase db reset            # накатить все миграции с нуля
supabase gen types typescript --local > types/database.ts

```

## Структура

```
app/
  (auth)/            вход, регистрация, server actions авторизации
  auth/callback/     колбэк Supabase Auth
  dashboard/         кабинет: список организаций, создание, /[orgSlug]
    actions.ts       все server actions кабинета
  menu/              прототип QR-меню (на моках)
components/
  ui/                shadcn-компоненты, руками не править
  features/          фичи по доменам: auth, organization, settings, employees, logs
  landing/           лендинг
hooks/               хуки TanStack Query поверх server actions (use-*.ts)
lib/
  supabase/          клиенты: client.ts (браузер), server.ts (RSC/actions), middleware.ts
  validations/       Zod-схемы
  auth/              хелперы авторизации
types/               доменные типы
middleware.ts        обновление сессии и защита /dashboard

```

## Доменная модель (текущая)

```
auth.users ─1:1─ organizations (user_id, bin, slug, settings jsonb)
                    │
                    └─1:N─ office_points (qr_token, is_main, geo_location)
                              │
                              ├─1:N─ registration_qr_codes (token, expires_at)
                              ├─1:N─ pending_employees (заявки на модерацию)
                              └─1:N─ check_logs (check_in / check_out)
organizations ─1:N─ employees (device_fingerprint, is_active)

```

- Один пользователь — одна организация (ТОО).
- У организации всегда есть главная точка (`is_main`), её нельзя удалить.
- Несколько точек — платная функция.
- Сотрудник попадает в организацию так: сканирует registration-QR, создаётся заявка в `pending_employees`, владелец её одобряет, и только после этого сотрудник появляется в `employees`.

## Что готово

- Регистрация и вход по email (Google OAuth убран)
- Создание организации с проверкой формата БИН и автосозданием главной точки
- Точки: создание, удаление, перевыпуск QR
- Registration-QR с ограниченным сроком действия
- Сотрудники: модерация заявок, активация и деактивация, удаление
- Журнал отметок с фильтрами, пагинацией и realtime-обновлением
- Настройки организации: геолокация и радиус, автозакрытие дня

## Чего пока нет

- Страниц для сотрудника: регистрации по QR и самой отметки прихода и ухода
- Миграций БД и `.env.example`
- Модульности: нет `org_modules`, а `office_points` завязаны на посещаемость
- Тестов

## Куда идём: модули


| Модуль       | Суть                                               | Статус                    |
| ------------ | -------------------------------------------------- | ------------------------- |
| Посещаемость | Отметка сотрудников по QR точки                    | в работе                  |
| Фидбэк       | Анонимный опрос по QR точки + статистика по точкам | прототип в `mrw-feedback` |
| Меню         | QR-меню и вызов официанта для кафе                 | прототип UI на моках      |
| Доступ       | Шлагбаумы и турникеты                              | отложено                  |


Принципы:

- Ядро ничего не знает о модулях. Модуль зависит от ядра, но не наоборот.
- Таблицы модуля имеют префикс (`attendance_`, `feedback_`, `menu_`) и свою миграцию.
- Публичные действия анонимов (скан, ответ на опрос) проходят только через RPC-функции Postgres, прямого доступа к таблицам у них нет.

## Работа в команде

- Ветки: `feat/…`, `fix/…`, `refactor/…`, `chore/…` от `main`
- Один PR — одна задача. Ревью обязательно, правила в [REVIEW.md](http://REVIEW.md)
- Соглашения по коду и правила для Claude Code описаны в [CLAUDE.md](http://CLAUDE.md)
