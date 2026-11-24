# [CLAUDE.md](http://CLAUDE.md)

Инструкции для Claude Code и для разработчика. Сначала прочитай [README.md](http://README.md).

## Проект

KasipQR — мультитенантная SaaS на QR-кодах для Казахстана. Ядро: организации, точки, QR. Модули: посещаемость (есть), фидбэк, меню (в планах). Next.js 16 App Router + Supabase (Postgres, Auth, RLS, Realtime) + TanStack Query + shadcn/ui + Tailwind 4 + Zod. Пакетный менеджер — **pnpm**.

## Команды

```bash
pnpm dev      # дев-сервер
pnpm lint     # ESLint — должен проходить без ошибок
pnpm build    # сборка + проверка типов — должна проходить

```

Перед тем как сказать «готово», всегда запускай `pnpm lint` и `pnpm build`.

## Архитектура и где что лежит

- Серверная логика — **Server Actions** в `app/**/actions.ts` (`"use server"`).
- Клиентские данные — хуки в `hooks/use-*.ts`: `useQuery` / `useMutation` поверх server actions.
- Компоненты фич — `components/features/<домен>/`, с реэкспортом через `index.ts`.
- `components/ui/` — сгенерированный shadcn. Не править руками; новые компоненты добавлять через `pnpm dlx shadcn@latest add <name>`.
- Zod-схемы — `lib/validations/<домен>.ts`, типы выводить через `z.infer`.
- Доменные типы — `types/<сущность>.ts`.
- Supabase-клиенты:
  - `lib/supabase/server.ts` — в server actions, RSC, route handlers;
  - `lib/supabase/client.ts` — только в клиентских компонентах (realtime и т.п.);
  - `lib/supabase/middleware.ts` — только для `middleware.ts`.

## Соглашения по коду

- TypeScript strict, никаких `any`. `as` только при приведении ответа Supabase к доменному типу; после генерации `types/database.ts` использовать типизированный клиент.
- Функции и компоненты — стрелочные: `export const foo = async () => {}`.
- Server action возвращает `{ data, error }` или `{ success, error }`, где `error` — строка на русском для пользователя. Не бросает исключения наружу.
- Хук разворачивает этот результат: `if (result.error) throw new Error(result.error)`.
- Ключи запросов: `[сущность, organizationId, ...фильтры]`. После мутации инвалидировать все затронутые ключи.
- Тексты интерфейса — на русском (в планах RU/KZ/EN, поэтому не размазывать строки по логике).
- Формы: `react-hook-form` + `zodResolver` + shadcn `Form`. Одна и та же Zod-схема валидирует и на клиенте, и в server action.
- Стили — Tailwind-классы, условные классы через `cn()` из `lib/utils.ts`.
- UX для мобильных: основные действия в зоне большого пальца (снизу), поповеры открываются вверх. Стандартные паттерны shadcn лучше самописных гибридов.
- Не оставлять `console.log`, закомментированный код и TODO без задачи.

## Безопасность и данные — обязательно

1. **RLS — главная защита.** Каждая новая таблица: `enable row level security` + политики в той же миграции. Без политик таблица не мержится.
2. **Проверка владельца в каждом server action**, который читает или меняет данные организации: `auth.getUser()`, затем убедиться, что сущность принадлежит организации пользователя. Не полагаться на id, пришедший с клиента.
3. **Анонимные действия** (скан QR сотрудником, ответ на опрос, просмотр меню) идут только через RPC-функции Postgres: `security definer`, `set search_path = ''`, валидация входа внутри функции и `grant execute ... to anon`. Прямой `insert`/`select` анонимом в таблицы запрещён.
4. Особенность Supabase: Postgres проверяет FK даже при анонимном insert, поэтому нужна SELECT-политика на родительскую таблицу. Лучше решать через RPC, чем открывать таблицу.
5. `service_role` ключ не использовать в приложении вообще.
6. Секреты не коммитить. `.env*` в `.gitignore`, пример — в `.env.example`.

## База данных

- Любое изменение схемы — **только миграцией** в `supabase/migrations/` (`supabase migration new <name>`). Правки в Dashboard без миграции запрещены.
- Миграции не редактировать после мержа, только новые поверх.
- После изменения схемы перегенерировать `types/database.ts`.
- Имена: `snake_case`, таблицы во множественном числе, у каждой есть `id`, `created_at`.
- Таблицы модулей с префиксом: `attendance_*`, `feedback_*`, `menu_*`.
- Время хранить в `timestamptz`. Границы дня считать в часовом поясе организации (по умолчанию `Asia/Almaty`), а не через `new Date().toISOString()`.
- Многошаговые записи (организация + главная точка и т.п.) делать в одной RPC-функции-транзакции, а не цепочкой запросов с ручным откатом.
- Удаление сущностей с историей (точки, сотрудники) — через `is_active = false`.

## Модульность

- Ядро (`organizations`, точки, QR, auth, биллинг) не импортирует код модулей.
- Код модуля держать вместе: `app/dashboard/[orgSlug]/<module>/`, `components/features/<module>/`, `hooks/use-<module>-*.ts`, миграция `*_<module>_*.sql`.
- Включён ли модуль у организации — проверять на сервере, не только скрывать в UI.

## Известные проблемы (не повторять, а по возможности чинить)

- Часть actions не проверяет принадлежность к организации и держится только на RLS: `toggleEmployeeActive`, `deleteEmployee`, `regenerateOfficePointQR`, `deactivateRegistrationQR`, `getRegistrationQRCodes`, `getTodayStats`, `getEmployeesCount`, `getPendingEmployees`, `getPendingEmployeesCount`, `approvePendingEmployee`, `rejectPendingEmployee`.
- `deleteOfficePoint` выбирает `organizations!inner(user_id)`, но не сравнивает с `user.id`.
- `deleteOfficePoint` и `deleteEmployee` удаляют физически вместо `is_active = false`.
- `getCheckLogs` / `getTodayStats` считают день в UTC.
- `generateSlug` выкидывает кириллицу: из «Кофейня» получается `-abc123`.
- `createOrganization` и `approvePendingEmployee` — по две записи без транзакции.
- `console.error` в actions заявок; ошибки мутаций не показываются в `employees-table.tsx` и `pending-employees.tsx`.
- `app/menu` — прототип на моках.

## Процесс

- Одна задача — одна ветка — один PR. Ветки: `feat/`, `fix/`, `refactor/`, `chore/`.
- Коммиты: `feat: …`, `fix: …`, `refactor: …`, `chore: …`, на английском, в повелительном наклонении.
- Не делать попутных рефакторингов вне задачи: нашёл проблему — опиши в PR или заведи задачу.
- Описание PR должно отвечать на вопросы из [REVIEW.md](http://REVIEW.md).
- Если задача неясна или требует решения по архитектуре (новая таблица, новая зависимость, изменение RLS), сначала спроси, потом пиши код.