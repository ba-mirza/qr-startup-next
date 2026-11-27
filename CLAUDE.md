# CLAUDE.md

Инструкции для Claude Code и для разработчика. Сначала прочитай [README.md](./README.md).

## Проект

KasipQR — мультитенантная SaaS для бизнеса в Казахстане. Философия: **QR in everywhere**.
Любой бизнес регистрируется, создаёт организацию (ТОО по БИН или ИП по ИИН) и подключает
нужные модули. Неподключённые модули видны в кабинете, но закрыты.

- **Ядро:** организации, участники с ролями (`owner`, `cashier`), точки, QR-коды, каталог
  модулей, подключение модулей. Позже: подписки и платежи (Freedom Pay).
- **Модули:** посещаемость (в работе, пробный период 14 дней), фидбэк, меню, бонусы (последним).

Архитектурная схема и решения — доска в Figma (ссылку даёт владелец репо).

## Команды

```bash
pnpm dev      # дев-сервер, http://localhost:3000
pnpm lint     # ESLint + React Compiler — без ошибок и предупреждений
pnpm build    # сборка + проверка типов — должна проходить
```

Перед тем как сказать «готово», всегда запускай `pnpm lint` и `pnpm build`. Тестов в проекте
нет, не выдумывай команды их запуска.

## Стек

Next.js 16 (App Router, `src/proxy.ts` вместо middleware, React Compiler), React 19,
TypeScript strict, Supabase (Postgres, Auth, RLS), TanStack Query, Mantine 9 + Sass Modules,
next-intl, react-hook-form + Zod 4, zustand, `lucide-react`, `qrcode.react`. Пакеты — **pnpm**.
Tailwind и shadcn в проекте не используются.

## Структура (FSD)

Алиас `@/*` → `src/*`. Слои снизу вверх, импорт только из нижних слоёв:

- `src/shared` — `api/supabase` (клиенты и типы БД), `config`, `lib`, `ui` (тема, `Logo`,
  `LinkButton`, `ModuleIcon`), `styles` (Sass-переменные и миксины).
- `src/entities/<name>` — доменные типы и запросы сущности: `organization`, `module`, `session`.
- `src/features/<name>` — пользовательское действие: `auth`, `create-organization`,
  `connect-module`. Внутри `api/`, `model/`, `ui/`.
- `src/widgets/<Name>` — крупный блок экрана: `SiteHeader`, `Landing`, `DashboardShell`.
- `src/modules/<module>` — код модуля со своими `api`, `model`, `ui` и `index.ts` с описанием
  модуля. Импортирует модули только `src/app` (через реестр `src/modules/index.ts`); `shared`,
  `entities`, `features`, `widgets` о модулях не знают. Модули не импортируют друг друга.
- `src/app` — маршруты. Все страницы под `src/app/[locale]/`, кроме `app/auth/callback` и
  будущих `/api/*`.
- `src/i18n` — роутинг, навигация, загрузка сообщений. `messages/<locale>/core.json` — тексты
  ядра, `messages/<locale>/<module>.json` — тексты модуля.

Компонент — папка `<Name>/` с `<Name>.tsx`, `<Name>.module.sass` и `index.ts`
(`export { default } from "./Name"`). Компоненты — `default export`, функции и компоненты —
стрелочные. Каждый слой отдаёт публичное API через `index.ts`; мимо него внутрь чужого
слоя не импортируем.

## Данные и Supabase

Клиенты (`src/shared/api/supabase`):

- `client.ts` → `getSupabase()` — только в браузере (`"use client"`).
- `server.ts` → `createServerSupabase()` — RSC, route handlers, server actions (`server-only`).
- `proxy.ts` → `refreshSession()` — только для `src/proxy.ts`.

Слой запросов сущности, как в new_marwin_front:

- `<entity>.ts` — объект `<entity>Api` с функциями, которые **принимают клиент параметром**
  (`(client: Supabase, ...)`) и переводят строки БД (snake_case) в доменные типы
  (camelCase). Один код работает и на сервере, и в браузере.
- `<entity>.keys.ts` — фабрика ключей: `["organizations", "slug", slug]`.
- `<entity>.queries.ts` — `"use client"`, хуки `useQuery`/`useMutation`. После мутации
  инвалидировать все затронутые ключи.
- Тайминги кэша — только из `shared/config/query-cache.ts`, не хардкодить `staleTime`.
- SSR: `getServerQueryClient()` + `fetchQuery`/`prefetchQuery` с **теми же ключами** +
  `HydrationBoundary`. Эталон — `app/[locale]/dashboard/[orgSlug]/layout.tsx`.

Где писать данные:

- Простая запись в одну таблицу — из браузера напрямую, права проверяет RLS.
- Многошаговая запись или бизнес-правило — RPC-функция Postgres (`create_organization`,
  `start_module_trial`).
- Server actions и route handlers — только там, где нужен сервер: вебхуки оплаты, секреты,
  вход кассира по ссылке и PIN.

Ошибки: API бросает класс ошибки с `key` (`CreateOrganizationError`, `AuthRequestError`).
RPC поднимает исключение со snake_case-кодом (`raise exception 'tax_id_taken'`), API
переводит код в ключ, UI показывает `t(\`errors.${key}\`)`. Сырой текст ошибки Supabase
пользователю не показываем.

## Безопасность — обязательно

1. **RLS — главная защита.** Каждая новая таблица: `enable row level security` и политики в
   той же миграции. Политики строятся на `public.is_org_member(org, roles)` и
   `public.has_module(org, module)`, не на переданных с клиента id.
2. **Таблицы модуля** доступны только при подключённом модуле: в политиках
   `has_module(organization_id, '<module>')`. Экран «Подключить» в UI (`ModuleLocked`) — это
   UX, не защита.
3. **Роли.** Владелец управляет организацией. Кассир работает только на своей точке и только
   в своём экране модуля.
4. **Анонимы** (скан QR сотрудником, отзыв, меню) — только через RPC: `security definer`,
   `set search_path = ''`, валидация входа внутри, `grant execute ... to anon`. Прямой доступ
   анонимов к таблицам запрещён.
5. **Функции:** у каждой новой `revoke execute ... from public, anon` и явный `grant` нужным
   ролям (по умолчанию Postgres выдаёт execute всем).
6. `service_role` / secret-ключ в приложении не использовать. Секреты не коммитить: `.env*` в
   `.gitignore`, пример — `.env.example`.
7. Редиректы по `?next=` — только на внутренние пути (см. `app/auth/callback/route.ts`).

## База данных

- Схема меняется **только миграцией**: новый файл `supabase/migrations/<YYYYMMDDHHMMSS>_<name>.sql`.
  Supabase CLI не используется: владелец применяет файл в Supabase → SQL Editor.
- Миграцию перед коммитом прогнать на пустой базе (локальный Postgres с заглушкой схемы
  `auth` подходит).
- Смерженные миграции не редактировать, только новые поверх.
- Типы БД пишутся вручную в формате `supabase gen types`: ядро — `src/shared/api/supabase/schema/core.ts`,
  модуль — `schema/<module>.ts`. `database.types.ts` только собирает их. Меняешь схему —
  обнови свой файл схемы в том же PR.
- Имена: `snake_case`, таблицы во множественном числе, у каждой `created_at timestamptz`.
- Таблицы модулей с префиксом: `attendance_*`, `feedback_*`, `menu_*`, `bonus_*`.
- Поля, нужные только модулю, — в таблице профиля модуля (`attendance_settings` и т.п.), а не
  в `organizations`.
- Время — `timestamptz`. Границы дня — в часовом поясе организации (`organizations.timezone`,
  по умолчанию `Asia/Almaty`) на стороне Postgres.
- Сущности с историей (точки, сотрудники, QR) не удаляются, а получают `is_active = false`.
- Ограничения — в БД (`check`, `unique`, FK с осознанным `on delete`), а не только в Zod.

## UI и стили

- Компоненты Mantine. Кастомизация — Sass Modules (`*.module.sass`, отступный синтаксис),
  классы по БЭМ: `.block`, `&__element`, `&--modifier`.
- Цвета, отступы, радиусы — переменные Mantine: `var(--mantine-color-brand-6)`,
  `var(--mantine-color-gray-2)`. Hex в компонентах не пишем, палитра — в
  `shared/ui/theme/theme.ts`. Фирменный цвет — `brand` (красный, основной оттенок 6 = `#dc2626`).
- Общие Sass-переменные и миксины: `@use "@/shared/styles/mixins" as *` (`from`, `until`,
  `hover`, `dark`). Брейкпоинты как в Mantine.
- Из RSC нельзя передать `Link` в проп `component` компонента Mantine: используй
  `LinkButton` или клиентский компонент.
- Мобильная ширина 360px обязательна. Основные действия — в зоне большого пальца.

## Тексты и i18n

- `next-intl`, локали `ru | kk | en`, по умолчанию `ru` без префикса, язык браузера не
  определяется.
- Строки только в `messages/<locale>/*.json`, в коде — `useTranslations` / `getTranslations`.
  Тексты модуля лежат под его ключом: `useTranslations("menu.home")`.
- **Пока заполняем только `messages/ru/`.** Переводы `kk` и `en` — одним проходом перед
  запуском; недостающие ключи и файлы берутся из `ru` (`src/i18n/request.ts`).
- Навигация — только `Link`, `redirect`, `useRouter`, `usePathname` из `@/i18n/navigation`.
- В серверных страницах: `toLocale(params.locale)` и `setRequestLocale(locale)` до рендера.
- Сообщения Zod — ключи переводов (`"emailInvalid"`), перевод в UI.

## Как сделать модуль

Ядро уже даёт: каталог и подключение (`modules`, `org_modules`), проверку подключения
(`has_module`), точки и QR (`points`, `qr_codes`), маршруты кабинета и публичный вход по QR.
Модуль занимает только свои файлы:

| Что | Где |
| --- | --- |
| Код | `src/modules/<module>/` — `index.ts`, `api/`, `model/`, `ui/` |
| Описание модуля | `src/modules/<module>/index.ts` → `ModuleDefinition` (`src/shared/lib/module-contract.ts`) |
| Тексты | `messages/ru/<module>.json` (`nav.<segment>` — подписи пунктов меню) |
| Миграции | `supabase/migrations/<timestamp>_<module>_<name>.sql`, таблицы `<module>_*` |
| Типы БД | `src/shared/api/supabase/schema/<module>.ts` |

`ModuleDefinition`:

- `nav` — сегменты пунктов меню в кабинете (`["home", "items"]`), `"home"` — главная модуля.
- `pages` — страница на каждый сегмент: `/dashboard/[orgSlug]/<module>/<segment>/...rest`.
  Страница получает `organization` и `rest`. Маршрут уже проверил, что модуль подключён.
- `publicPage` — гостевая страница по QR: `/q/<token>`. `resolve_qr()` уже проверил QR и
  подключение модуля; данные страница получает своей RPC по `token`.

Правила модуля:

- Политики таблиц модуля: `is_org_member(organization_id)` **и** `has_module(organization_id, '<module>')`.
- Анонимы — только через RPC модуля `<module>_*` (скелет в REVIEW.md §11).
- QR модуля: строка в `qr_codes` с `module = '<module>'` и своим `purpose` (`table`, `check_in`).
- Поля организации, нужные модулю, — в его таблице профиля (`menu_venues`), а не в `organizations`.
- Файлы ядра модуль не правит: `src/shared` (кроме своего `schema/<module>.ts`), `src/entities`,
  `src/app`, `messages/ru/core.json`, миграции `*_core*`. Нужно изменение ядра — отдельный PR.

Включить модуль организации при разработке (Supabase → SQL Editor, роль postgres):

```sql
insert into public.org_modules (organization_id, module, status)
select id, 'menu', 'active' from public.organizations where slug = '<slug>'
on conflict (organization_id, module) do update set status = 'active', active_until = null;
```

Выпустить тестовый QR модуля (ссылка — `http://localhost:3000/q/<token>`):

```sql
insert into public.qr_codes (organization_id, point_id, module, purpose)
select o.id, p.id, 'menu', 'table'
from public.organizations o join public.points p on p.organization_id = o.id and p.is_main
where o.slug = '<slug>'
returning token;
```

Новый модуль целиком (как `bonus`): строка в `modules` (миграция), ключ в
`shared/config/site.ts`, файл схемы в `database.types.ts`, файл текстов в `src/i18n/messages.ts`,
запись в реестре `src/modules/index.ts`. Это изменение ядра — отдельным PR.

## Формы

`react-hook-form` + `zodResolver` + поля Mantine (`{...register("x")}`, для составных —
`Controller`). Схема лежит в `model/` фичи, типы — через `z.infer`. Вместо `watch` —
`useWatch` (`watch` несовместим с React Compiler).

## Соглашения по коду

- TypeScript strict, никаких `any`, `@ts-ignore`, `as unknown as`.
- React Compiler включён: `useMemo` / `useCallback` вручную не нужны.
- Не оставлять `console.log`, закомментированный код и TODO без задачи. Комментарий
  объясняет «почему», а не «что».

## Известные проблемы

- `database.types.ts` пишется вручную и может разойтись со схемой: сверяй при каждой миграции.
- `NextIntlClientProvider` отдаёт в браузер все тексты сразу. Пока их мало, это не важно;
  когда разрастутся, передавать клиенту только нужные namespace.
- Ошибки RPC распознаются по тексту исключения (`error.message`). Коды держать в
  snake_case и не менять без правки маппинга в API сущности.

## Процесс

- Владелец модуля работает в своих файлах (раздел «Как сделать модуль»). Изменения ядра —
  отдельные PR, о них договариваемся заранее, чтобы не конфликтовать.
- Одна задача — одна ветка — один PR. Ветки `feat/`, `fix/`, `refactor/`, `chore/`.
- Коммиты на английском, в повелительном наклонении: `feat: …`, `fix: …`, `refactor: …`,
  `chore: …`.
- Перед пушем — прогон по [REVIEW.md](./REVIEW.md).
- Не делать попутных рефакторингов вне задачи: нашёл проблему — опиши в PR.
- Новая таблица, зависимость или изменение RLS — сначала обсудить, потом писать код.
