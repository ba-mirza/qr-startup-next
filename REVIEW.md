# REVIEW.md: как проверять PR в KasipQR

Инструкция для агента и для человека, который **ревьюит** PR в KasipQR. Правила написания кода
описаны в [CLAUDE.md](./CLAUDE.md). Здесь — что именно искать, как ранжировать находки и как
формулировать замечания.

Главная цель ревью — **чтобы PR принял владелец репо** (он ревьюер и мержит в `main`).
Проект мультитенантный: одна ошибка в проверке владельца или в RLS открывает данные одной
организации другой. Поэтому безопасность и БД проверяются первыми. Пока они не пройдены,
остальное не смотрим.

---

## 0. Процедура

1. Прочитай описание PR (шаблон в §12) и **весь дифф**, а не только изменённые строки.
   Смотри и соседние файлы в той же папке: они задают образец для нового кода.
2. Запусти `pnpm install --frozen-lockfile && pnpm lint && pnpm build`. Если `build` падает,
   это блокер. Новые ошибки `lint` — замечание. Тестов в проекте нет: не требуй их и не
   предлагай «добавить тесты».
3. Если в PR есть миграция: `supabase db reset` должен накатиться на чистую базу, а
   `types/database.ts` — быть перегенерирован.
4. Пройди чек-листы §1–8. Каждое замечание оформляй так: `файл:строка`, нарушенное правило
   (ссылка на CLAUDE.md или пункт этого файла) и **образец из репо**, как сделать правильно
   (эталоны в §11). Замечание без образца слабое.
5. Сверься с §10 «Что не считать ошибкой», чтобы не писать замечания по наследию.
6. Оформи итог по форме §13.

Не перепроверяй руками то, что ловят `tsc` (strict) и ESLint: они уже прогнаны.

---

## 1. Блокеры (PR не мержить)

| #    | Что искать | Как искать | Почему блокер |
| ---- | ---------- | ---------- | ------------- |
| 1.1  | Server action меняет или читает данные организации и не проверяет владельца: есть `auth.getUser()`, но нет сверки `organization_id` / `user_id`, а `id` пришёл с клиента | В `actions.ts` найти `.update(`, `.delete(`, `.select(` с `.eq("id", …)` и проверить, есть ли выше запрос с `.eq("user_id", user.id)` | Без этой проверки защищает только RLS. Одна ошибка в политике открывает чужие данные (CLAUDE.md «Безопасность», п. 2) |
| 1.2  | Новая таблица без `enable row level security` и политик в той же миграции | `grep -n "create table" supabase/migrations/*.sql`, рядом должен быть `enable row level security` и `create policy` | Таблица без RLS доступна любому, у кого есть anon-ключ |
| 1.3  | Аноним читает или пишет в таблицу напрямую: политика `to anon` на `insert/select`, `grant … on table … to anon` | `grep -niE "to anon\|grant .* to anon" supabase/migrations` | Анонимы работают только через RPC (CLAUDE.md, п. 3) |
| 1.4  | RPC-функция для анонимов без `security definer`, без `set search_path = ''`, без валидации входа или с `grant execute … to public` | Прочитать каждую `create function` в диффе | Через `search_path` можно подменить объекты, а функция без валидации — это открытый insert |
| 1.5  | `service_role`, secret-ключ, токены или пароли в коде, логах, `.env*` в диффе | `grep -rnE "service_role\|SERVICE_ROLE\|sb_secret\|eyJhbGci" .` и `git diff --name-only main... \| grep env` | CLAUDE.md, п. 5–6 |
| 1.6  | Схема меняется без миграции: код обращается к новой колонке или таблице, а в `supabase/migrations/` ничего не добавлено | Сравнить новые имена в `.from(…)` / `.select(…)` с диффом миграций | Dashboard-правки не воспроизводятся, и dev расходится с prod |
| 1.7  | Отредактирована уже смерженная миграция | `git diff --name-status main... -- supabase/migrations \| grep -v "^A"` | Миграции не редактируются, только новые поверх |
| 1.8  | Публичный эндпоинт (скан, опрос, регистрация по QR) без проверки срока токена, `is_active` точки и без защиты от повторов (лимит по устройству или IP, уникальный индекс) | Прочитать RPC или route целиком | Спам и подделка отметок |
| 1.9  | `any`, `@ts-ignore`, `as unknown as` | `grep -rnE ": any\b\|as any\|@ts-ignore\|as unknown as" app components hooks lib types` | Strict-режим и правило CLAUDE.md |
| 1.10 | Браузерный клиент (`lib/supabase/client`) в server action, RSC или route, либо серверный клиент в `"use client"` | `grep -rn "supabase/client" app/**/actions.ts app/**/route.ts`; `grep -ln "use client" -r components hooks \| xargs grep -l "supabase/server"` | Сессия и cookies ломаются, логика уходит на клиент мимо проверок |
| 1.11 | Ручные правки в `components/ui/` | `git diff --stat main... -- components/ui` (новые файлы через `shadcn add` допустимы) | Сгенерированный код, правки теряются при обновлении |
| 1.12 | Ядро импортирует код модуля (`organizations`, точки, auth → `attendance`/`feedback`/`menu`) | `grep -rnE "features/(attendance\|feedback\|menu)\|use-(attendance\|feedback\|menu)-" app/dashboard/actions.ts components/features/{organization,settings,auth} lib` | Модуль зависит от ядра, но не наоборот (README «Принципы») |

---

## 2. База данных и миграции

- [ ] Одна миграция на задачу, имя через `supabase migration new <name>`; таблицы модуля
      с префиксом `attendance_`, `feedback_`, `menu_`, файл `*_<module>_*.sql`.
- [ ] У каждой таблицы есть `id`, `created_at timestamptz not null default now()`, имена в
      `snake_case`, таблицы во множественном числе.
- [ ] Ограничения на уровне БД, а не только в Zod: `not null`, `check` (формат БИН, радиус),
      `unique` (БИН, `qr_token`, `slug`), у каждого FK осознанный `on delete`.
- [ ] Политики RLS покрывают `select/insert/update/delete` по отдельности. Проверено
      мысленно (или в SQL) для трёх ролей: `anon`, владелец, **чужой** `authenticated`.
- [ ] Политика сверяет организацию через `auth.uid()` (`organizations.user_id = auth.uid()`),
      а не через переданный параметр.
- [ ] Индексы под реальные фильтры и сортировки: `organization_id`, `office_point_id`,
      `checked_at desc`, `status`.
- [ ] Многошаговая запись (организация + главная точка, одобрение заявки = insert в
      `employees` + update `pending_employees`) выполняется одной RPC-функцией. Цепочка
      запросов с ручным откатом `.delete()` — замечание.
- [ ] Сущности с историей (точки, сотрудники) не удаляются физически, а получают
      `is_active = false`. Новый `.delete()` по `employees`/`office_points` — замечание.
- [ ] Время хранится в `timestamptz`. Границы дня считаются в часовом поясе организации
      (`Asia/Almaty` по умолчанию) на стороне Postgres (`at time zone`), а не строками
      `${date}T00:00:00` и не через `toISOString().split("T")`.
- [ ] Для Realtime: таблица добавлена в publication, RLS на ней есть (Realtime отдаёт строки
      по `select`-политике).
- [ ] После миграции перегенерирован `types/database.ts`, а новый код использует
      типизированный клиент, а не `as Тип`.

---

## 3. Server actions (`app/**/actions.ts`)

- [ ] `"use server"` первой строкой, функции стрелочные: `export const x = async () => {}`.
- [ ] Порядок внутри: `createClient()` → `auth.getUser()` → `if (!user) return { …, error:
      "Не авторизован" }` → Zod `safeParse` → проверка владельца → запрос → результат.
- [ ] Проверка владельца выглядит так же, как в `getEmployees` (`app/dashboard/actions.ts:548`):
      сначала выбрать организацию с `.eq("id", organizationId).eq("user_id", user.id)`, а
      дочернюю сущность получать через `!inner` с фильтром по этой организации.
      `select(…organizations!inner(user_id))` без сравнения с `user.id` — **не** проверка
      (так сейчас в `deleteOfficePoint`).
- [ ] Возвращает `{ data, error }` или `{ success, error }`. Наружу не бросает исключений.
      `error` — короткая фраза на русском для пользователя. Сырой `error.message` из
      Supabase пользователю не отдаётся.
- [ ] Коды Postgres разбираются явно (`23505` → «уже существует»), как в `createOrganization`.
- [ ] Вход валидируется **той же** Zod-схемой, что и форма на клиенте. Числа с клиента
      (`expiresInHours`, `limit`, `offset`) ограничены схемой или `Math.min`.
- [ ] Нет `console.log` / `console.error`, нет описательных комментариев («// Create
      employee»). Комментарий «почему» допустим.
- [ ] Новый action для модуля проверяет на сервере, что модуль включён у организации.

---

## 4. Хуки и TanStack Query (`hooks/use-*.ts`)

- [ ] `"use client"`, один файл на домен, функции `useX` стрелочные.
- [ ] Хук разворачивает результат: `if (result.error) throw new Error(result.error)`.
- [ ] Ключ запроса строится как `[сущность, organizationId, ...фильтры]`, а у запросов с
      параметром — `enabled: !!organizationId`.
- [ ] После мутации инвалидируются **все** затронутые ключи: одобрение заявки затрагивает
      `pending-employees`, `pending-employees-count`, `employees`, `employees-count`
      (образец `useApprovePendingEmployee`). Пропущенный ключ — UI показывает устаревшее.
- [ ] Компонент не ходит в Supabase напрямую мимо action и хука. Исключение — realtime-подписка
      в отдельном хуке (`use-realtime-logs.ts`).
- [ ] Realtime: канал отписывается в cleanup, обработчик не зависит от нестабильного колбэка
      (иначе переподписка на каждый рендер), фильтр по организации стоит в подписке
      (`filter:`), если это позволяет схема.

---

## 5. Компоненты и TypeScript

- [ ] Компонент фичи лежит в `components/features/<домен>/`, kebab-case имя файла,
      реэкспорт добавлен в `index.ts`.
- [ ] Стрелочный named-export: `export const Name = ({ … }: NameProps) => {}`, `interface
      NameProps` стоит перед компонентом. `export default` допустим только в `page.tsx` /
      `layout.tsx` / `route.ts`.
- [ ] `"use client"` есть только там, где нужны хуки, обработчики или браузерные API.
- [ ] Доменные типы взяты из `types/<сущность>.ts` или `types/database.ts`, а не объявлены
      заново в компоненте. Типы форм получены через `z.infer`.
- [ ] Нет дублей: функция форматирования даты/времени или обёртка над запросом не
      переписывается второй раз в соседнем компоненте, а выносится.
- [ ] Условные классы собираются через `cn()`, цвета — токенами темы (`text-muted-foreground`,
      `bg-destructive`), а не `text-gray-700` / hex.
- [ ] `{count && <X/>}` на числе → `count > 0 && …` (иначе рендерится `0`).
- [ ] Нет закомментированного кода, `TODO` без задачи, мёртвых пропсов и импортов.

---

## 6. UI/UX

- [ ] Используются компоненты shadcn (`Dialog`, `AlertDialog`, `Sheet`, `Form`, `Table`,
      `Skeleton`), а не самописные аналоги и не нативные `alert()` / `confirm()`.
- [ ] Разрушительное действие (удаление, деактивация, перевыпуск QR) спрашивает
      подтверждение через `AlertDialog` (образец `office-points-list.tsx:165`).
- [ ] У каждого запроса есть три состояния: загрузка (`Skeleton`, образец
      `employees-section.tsx:77`), пусто (текст + действие) и ошибка.
- [ ] Ошибка мутации видна пользователю (образец `add-office-point-dialog.tsx:109`), а не
      проглатывается. Кнопка заблокирована на время `isPending`, поэтому двойной клик не
      создаёт дубль.
- [ ] Мобильная ширина 360px: ничего не вылезает, таблица скроллится или превращается в
      карточки, основные действия внизу, в зоне большого пальца, поповеры открываются вверх.
- [ ] Тексты на русском, без опечаток, не размазаны по логике (в планах RU/KZ/EN): строки
      собраны в константы или JSX, а не склеиваются в обработчиках.
- [ ] Пограничные состояния сценария: истёкший или деактивированный QR, неактивная точка,
      неактивный сотрудник, удалённая организация, потеря сети.

---

## 7. Git-гигиена PR

- [ ] Ветка `feat/…`, `fix/…`, `refactor/…`, `chore/…` от свежего `main`. В `main` напрямую
      не коммитили.
- [ ] Коммиты на английском, в повелительном наклонении, с префиксом `feat:` / `fix:` /
      `refactor:` / `chore:`. Сообщения `fix`, `wip`, `asd` → попросить переименовать
      (при squash-мерже важен прежде всего заголовок PR).
- [ ] PR небольшой: до ~400 строк без учёта сгенерированных файлов (`types/database.ts`,
      `pnpm-lock.yaml`, `components/ui/*`). Больше — разбить.
- [ ] Дифф без постороннего: попутных рефакторингов, форматирования чужих файлов, `.env*`,
      `.next`. `pnpm-lock.yaml` меняется только вместе с `package.json`; `package-lock.json`
      / `yarn.lock` не появляются.
- [ ] Новая зависимость обоснована в описании, аналога в проекте нет (уже есть: `zod`,
      `react-hook-form`, `qrcode.react`, `lucide-react`, `gsap`, TanStack Query, Radix).
- [ ] Если меняется архитектурное правило или закрыта «Известная проблема», то в том же PR
      обновлены `CLAUDE.md` / README.

---

## 8. Сигналы «вернётся на переделку» (сообщать автору явно)

Если в PR есть **два и больше** признака из списка, так и напиши: «в таком виде PR не
примут» — и предложи привести его к эталонам до следующего круга:

1. Мутация без проверки владельца или новая таблица без RLS.
2. Изменение схемы без миграции.
3. Запросы к Supabase из компонента в обход action и хука.
4. Самописные модалка, таблица или форма вместо shadcn + `react-hook-form` + Zod.
5. Многошаговая запись цепочкой запросов вместо RPC.
6. Нет состояний загрузки и ошибки, ошибки мутаций молча проглатываются.
7. Дубль существующей логики или типа рядом с оригиналом.

---

## 9. Публичные (анонимные) сценарии: отдельный проход

Касается страниц сотрудника (регистрация по QR, отметка прихода и ухода), опроса фидбэка и
QR-меню. Проверяется в дополнение к §1:

- [ ] Вход только через одну RPC-функцию, которая сама проверяет токен, `expires_at`,
      `is_active` точки и QR, принадлежность к организации и лимиты.
- [ ] Функция возвращает минимум данных (без `organization_id`, телефонов и других
      сотрудников).
- [ ] Повтор защищён: нельзя отметиться дважды подряд одним типом, нельзя подать вторую
      заявку с того же `device_fingerprint` на ту же точку.
- [ ] Геолокация (если включена в настройках) проверяется в функции по радиусу, а не только
      в браузере.
- [ ] Страница работает без авторизации и не падает, если `middleware.ts` её не пропускает:
      маршрут добавлен в исключения.

---

## 10. Что НЕ считать ошибкой (наследие в `main`)

Не выдавай замечаний за следующее, если PR это не трогает. Если трогает — попроси не чинить
«попутно», а вынести в отдельный PR. Исключение: PR, задача которого и есть починка.

- Мутации и чтения без собственной проверки владельца, держатся только на RLS:
  `toggleEmployeeActive`, `deleteEmployee`, `regenerateOfficePointQR`,
  `deactivateRegistrationQR`, `getRegistrationQRCodes`, `getTodayStats`, `getEmployeesCount`,
  `getPendingEmployees`, `getPendingEmployeesCount`, `approvePendingEmployee`,
  `rejectPendingEmployee`; в `deleteOfficePoint` `user_id` выбирается, но не сравнивается.
- Физическое удаление в `deleteOfficePoint` и `deleteEmployee`.
- День в UTC в `getCheckLogs` и `getTodayStats`.
- Ручной откат в `createOrganization` и две записи без транзакции в `approvePendingEmployee`.
- `generateSlug` выкидывает кириллицу.
- `console.error` и английские описательные комментарии в `app/dashboard/actions.ts`,
  `hooks/use-realtime-logs.ts`, `components/features/logs/logs-section.tsx`.
- `formData.get(…) as string` в actions (до перевода форм на объект + Zod).
- Отдельные корневые ключи `employees-count`, `pending-employees-count`, `today-stats`,
  `check-logs` вместо `[сущность, organizationId, …]`.
- Мутации без вывода ошибки в `employees-table.tsx` и `pending-employees.tsx`.
- Realtime-подписка на всю таблицу `check_logs` с фильтрацией по организации на клиенте.
- `export default function` в `app/layout.tsx`, `(auth)/*`, `app/menu/page.tsx`,
  `auth/callback/route.ts`; `function cn` в `lib/utils.ts` (сгенерирован shadcn).
- `StatCard` внутри `app/dashboard/[orgSlug]/page.tsx` с `text-gray-700`.
- `app/menu` на моках, отсутствие миграций, `types/database.ts`, `.env.example` и тестов.

«Не считать ошибкой» не значит «можно копировать». Новый код, написанный по этим образцам,
получает замечание со ссылкой на правильный эталон из §11.

---

## 11. Эталоны для ссылок в замечаниях

| Тема | Файл |
| ---- | ---- |
| Server action с проверкой владельца | `app/dashboard/actions.ts:548` (`getEmployees`), `:163` (`createOfficePoint`) |
| Разбор кода ошибки Postgres | `app/dashboard/actions.ts:55` (`createOrganization`, `23505`) |
| Хук query + mutation с полной инвалидацией | `hooks/use-employees.ts` (`useApprovePendingEmployee`) |
| Форма: `react-hook-form` + `zodResolver` + shadcn `Form` | `components/features/settings/add-office-point-dialog.tsx` + `lib/validations/office-point.ts` |
| Вывод ошибки мутации и `isPending` | `components/features/settings/add-office-point-dialog.tsx:109` |
| Подтверждение разрушительного действия | `components/features/settings/office-points-list.tsx:165` |
| Skeleton-состояние | `components/features/employees/employees-section.tsx:77` |
| Realtime-подписка с cleanup | `hooks/use-realtime-logs.ts` (кроме фильтра, см. §10) |
| Где какой Supabase-клиент | `lib/supabase/server.ts`, `client.ts`, `middleware.ts` |
| Миграция и RPC | Эталона пока нет. Первая принятая миграция с RLS и RPC станет эталоном, до этого сверяться со скелетом ниже |

Скелет анонимной RPC-функции:

```sql
create or replace function public.attendance_check_in(p_qr_token text, p_device text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_point public.office_points;
begin
  if p_qr_token is null or length(p_device) not between 8 and 256 then
    raise exception 'invalid input';
  end if;

  select * into v_point
  from public.office_points
  where qr_token = p_qr_token and is_active;

  if not found then
    raise exception 'point not found';
  end if;

  -- проверка сотрудника, лимита повторов, геолокации; затем insert
  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.attendance_check_in(text, text) from public;
grant execute on function public.attendance_check_in(text, text) to anon;
```

---

## 12. Описание PR (заполняет автор)

```md
## Задача
Ссылка на задачу или что делаем, одной фразой.

## Что сделано
- …

## БД
Нет изменений / миграция `…`: таблицы, политики RLS, функции, индексы.

## Как проверить
1. …

## Скриншоты
Для UI: desktop + mobile (360px).

## Вопросы / риски
Что спорно, что не сделано и почему.
```

Если поля «БД» нет, а миграция есть, или PR про UI без скриншотов — попроси дополнить до ревью.

---

## 13. Форма ответа

```
## Итог: APPROVE | ПРАВКИ | ПЕРЕДЕЛАТЬ
Сборка: lint ✔/✘ (новых ошибок N), build ✔/✘, db reset ✔/✘/—

### blocker
- `app/dashboard/actions.ts:830` — новый `archiveEmployee` обновляет сотрудника по `id` с
  клиента без проверки организации. Правило: REVIEW §1.1, CLAUDE.md «Безопасность» п. 2.
  Как у нас: сначала организация по `user_id`, как в `getEmployees` (`actions.ts:548`).

### issue
- `hooks/use-x.ts:40` — после мутации не инвалидирован `employees-count`, счётчик на вкладке
  устаревает. Образец: `useApprovePendingEmployee`.

### suggestion / nit
- …

### question
- …

### Что хорошо
- Одна-две строки, если есть за что.
```

Префиксы — как в комментариях к PR:

| Префикс       | Значение                                                   |
| ------------- | ---------------------------------------------------------- |
| `blocker:`    | Исправить до мержа: безопасность, потеря данных, баг       |
| `issue:`      | Исправить, но способ можно обсудить                        |
| `suggestion:` | Предложение, автор решает сам                              |
| `nit:`        | Мелочь (стиль, имя), не блокирует                          |
| `question:`   | Вопрос для понимания, правок не требует                    |

Правила формулировок: `файл:строка`; одно замечание — одно правило; ссылка на образец из
репо; объясняй **почему**, без «рассмотрите возможность». Не предлагай тесты, Storybook,
другой стейт-менеджер, ORM, i18n-библиотеку и прочее, чего в проекте нет. Не требуй чинить
наследие из §10. Если не уверен, как «правильно», открой соседний файл в той же папке: он и
есть правило.

Автор отвечает на каждый `blocker` и `issue`: «исправлено» (с коммитом) или аргумент, почему
нет. Если правок больше трёх кругов, созваниваемся.

## Мерж

- Только после approve и зелёных `lint` / `build`.
- **Squash and merge**, заголовок PR становится итоговым коммитом (`feat: …`), ветку удаляем.
- Если в PR есть миграция, после мержа её накатывают на dev-проект Supabase и проверяют, что
  приложение работает.
- Ревьюер отвечает на PR в течение 1 рабочего дня.
