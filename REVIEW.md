# REVIEW.md: как проверять PR в KasipQR

Инструкция для агента и для человека, который **ревьюит** PR или делает прогон перед пушем.
Правила написания кода — в [CLAUDE.md](./CLAUDE.md). Здесь — что искать, как ранжировать
находки и как формулировать замечания.

Проект мультитенантный, и браузер пишет в таблицы напрямую под защитой RLS. Одна ошибка в
политике открывает данные одной организации другой. Поэтому безопасность и БД проверяются
первыми. Пока они не пройдены, остальное не смотрим.

---

## 0. Процедура

1. Прочитай описание PR (шаблон в §12) и **весь дифф**: `git diff main...`. Смотри соседние
   файлы в той же папке: они задают образец.
2. Запусти `pnpm install --frozen-lockfile && pnpm lint && pnpm build`. Падение `build` —
   блокер. Ошибки и предупреждения `lint` (включая React Compiler) — замечание. Тестов в
   проекте нет: не требуй их.
3. Если в PR есть миграция: она применяется на пустой базе после предыдущих миграций
   (локальный Postgres с заглушкой схемы `auth` или чистый dev-проект), а
   `database.types.ts` обновлён в том же PR.
4. Пройди чек-листы §1–9. Каждое замечание: `файл:строка`, нарушенное правило и **образец из
   репо** (эталоны в §11).
5. Сверься с §10, чтобы не писать замечания по известным проблемам.
6. Оформи итог по форме §13.

Не перепроверяй руками то, что ловят `tsc` (strict) и ESLint.

---

## 1. Блокеры (PR не мержить)

| #    | Что искать | Как искать | Почему блокер |
| ---- | ---------- | ---------- | ------------- |
| 1.1  | Новая таблица без `enable row level security` и политик в той же миграции | `grep -n "create table" supabase/migrations/*.sql`, рядом `enable row level security` и `create policy` | Без RLS таблица открыта любому с publishable-ключом |
| 1.2  | Политика не опирается на членство: нет `is_org_member(...)`, сравнивается id из параметра, `using (true)` на данных организации | Прочитать каждую `create policy` в диффе | Браузер пишет напрямую — политика единственная защита (CLAUDE.md «Безопасность», п. 1) |
| 1.3  | Таблица модуля без `has_module(organization_id, '<module>')` в политиках | `grep -n "create policy" ... \| grep -E "attendance_\|feedback_\|menu_\|bonus_"` | Модуль доступен без оплаты; экран «Подключить» не защита |
| 1.4  | Действие владельца доступно кассиру: политика или RPC без `array['owner']` там, где нужна роль | Сверить роли в политиках `insert/update` и в начале RPC | Кассир меняет организацию |
| 1.5  | Аноним читает или пишет таблицу напрямую: политика `to anon` на данных организации, `grant … on table … to anon` | `grep -niE "to anon\|grant .* to anon" supabase/migrations` | Анонимы — только через RPC (CLAUDE.md, п. 4). Исключение — каталог `modules` |
| 1.6  | RPC без `security definer` / `set search_path = ''`, без валидации входа, без `revoke execute … from public, anon` | Прочитать каждую `create function` | Подмена объектов через `search_path`, открытый вызов функции |
| 1.7  | `service_role`, secret-ключ, токены, пароли в коде или `.env*` в диффе | `grep -rnE "service_role\|SERVICE_ROLE\|sb_secret\|eyJhbGci" src supabase` и `git diff --name-only main... \| grep env` | CLAUDE.md, п. 6 |
| 1.8  | Схема меняется без миграции, или миграция есть, а `database.types.ts` не обновлён | Сравнить новые имена в `.from(…)` / `.rpc(…)` с диффом миграций и типов | Dev расходится с prod, типы врут |
| 1.9  | Отредактирована уже смерженная миграция | `git diff --name-status main... -- supabase/migrations \| grep -v "^A"` | Только новые миграции поверх |
| 1.10 | Публичный эндпоинт (скан, опрос, регистрация по QR, вход кассира) без проверки токена, `expires_at`, `is_active` и без защиты от перебора и повторов | Прочитать RPC или route целиком | Подделка отметок, перебор PIN |
| 1.11 | `any`, `@ts-ignore`, `as unknown as` | `grep -rnE ": any\b\|as any\|@ts-ignore\|as unknown as" src` | Strict-режим |
| 1.12 | `getSupabase()` в серверном коде или `createServerSupabase()` в `"use client"` | `grep -rln "use client" src \| xargs grep -l "supabase/server"`; `grep -rn "getSupabase" src/app --include=route.ts` | Сессия и куки ломаются |
| 1.13 | Ядро импортирует модуль: `shared`, `entities`, ядровые `features`/`widgets` → `@/modules/*` | `grep -rn "@/modules/" src/shared src/entities src/features src/widgets` | Модуль зависит от ядра, не наоборот |
| 1.14 | Open redirect: `?next=` / `redirect_to` без проверки на внутренний путь | Прочитать route handlers | Фишинг через наш домен |

---

## 2. База данных и миграции

- [ ] Файл `supabase/migrations/<YYYYMMDDHHMMSS>_<name>.sql`, одна миграция на задачу.
      Таблицы модуля с префиксом `attendance_`, `feedback_`, `menu_`, `bonus_`.
- [ ] У таблиц `created_at timestamptz not null default now()`, имена в `snake_case`,
      множественное число.
- [ ] Ограничения в БД: `not null`, `check`, `unique`, у FK осознанный `on delete`.
- [ ] Политики раздельно на `select/insert/update/delete`. Проверено для трёх ролей: `anon`,
      участник своей организации, **чужой** `authenticated`. Для таблиц с ролями — ещё кассир.
- [ ] Колонки, которые нельзя менять (БИН, slug, автор), закрыты column-level `grant update (…)`.
- [ ] Индексы под фильтры: `organization_id`, `point_id`, даты `desc`.
- [ ] Многошаговая запись — одна RPC-функция, а не цепочка запросов из браузера.
- [ ] Сущности с историей не удаляются физически: `is_active = false`.
- [ ] Время — `timestamptz`, границы дня — в `organizations.timezone` на стороне Postgres.
- [ ] Поля, нужные только модулю, лежат в таблице профиля модуля, а не в `organizations`.
- [ ] Коды исключений RPC — snake_case (`tax_id_taken`) и добавлены в маппинг ошибок API.

---

## 3. Слой данных (`entities/*/api`, `features/*/api`)

- [ ] Тройка файлов: `<entity>.ts` (API + маппинг в доменный тип), `<entity>.keys.ts`,
      `<entity>.queries.ts` (`"use client"`).
- [ ] Функции API принимают `client: Supabase` параметром, а не создают клиент внутри.
- [ ] Компонент не вызывает `supabase.from(...)` сам: только через API сущности и хук.
- [ ] Ключи из фабрики `*QueryKeys`, а не литералы в компоненте. Серверный prefetch и
      клиентский хук используют **один и тот же** ключ.
- [ ] `staleTime` / `gcTime` — только из `queryCacheConfig`.
- [ ] После мутации инвалидированы все затронутые ключи.
- [ ] Ошибка — класс с `key`; сырой `error.message` Supabase не уходит в UI.
- [ ] Доменные типы в camelCase, snake_case остаётся внутри маппера.

---

## 4. Компоненты, стили, TypeScript

- [ ] Компонент в своём слое FSD, папка `<Name>/` с `<Name>.tsx`, `.module.sass`, `index.ts`.
      Импорт чужого слоя — через его `index.ts`.
- [ ] `default export`, стрелочные функции. `"use client"` только там, где нужны хуки и
      обработчики.
- [ ] Компоненты Mantine вместо самописных аналогов. Стили — Sass Modules по БЭМ, без
      инлайн-`style` и utility-классов.
- [ ] Цвета и отступы — переменные Mantine (`var(--mantine-color-brand-6)`), без hex в
      компонентах.
- [ ] Из RSC в Mantine не передаётся `component={Link}` — для этого `LinkButton` или
      клиентский компонент.
- [ ] Формы: `react-hook-form` + `zodResolver`, `useWatch` вместо `watch`.
- [ ] Нет дублей утилит и типов рядом с существующими (`shared/lib`, `entities/*/model`).
- [ ] `{count && <X/>}` на числе → `count > 0 && …`.
- [ ] Нет закомментированного кода, `TODO` без задачи, мёртвых импортов.

---

## 5. UI/UX

- [ ] Разрушительное действие спрашивает подтверждение (`modals.openConfirmModal`), а не
      `confirm()`.
- [ ] У запроса три состояния: загрузка (`Skeleton` / `loading`), пусто (текст + действие),
      ошибка.
- [ ] Ошибка мутации видна пользователю (`Alert` или `notifications`), кнопка в `loading` на
      время запроса — двойной клик не создаёт дубль.
- [ ] Ширина 360px: ничего не вылезает, таблицы скроллятся или становятся карточками,
      основные действия внизу.
- [ ] Закрытый модуль показывает экран «Подключить» и не грузит данные модуля.
- [ ] Пограничные состояния: истёкший или выключенный QR, неактивная точка, истёкшая подписка,
      потеря сети.

---

## 6. Тексты и i18n

- [ ] Строк в коде нет: всё в `messages/ru.json`, в компонентах `useTranslations`.
- [ ] Новые ключи добавлены в `ru.json`. Отсутствие в `kk.json` / `en.json` **не** замечание:
      переводы делаются перед запуском.
- [ ] Навигация из `@/i18n/navigation`, не из `next/link` / `next/navigation` (кроме
      `notFound`).
- [ ] Серверная страница: `toLocale(...)` и `setRequestLocale(...)`.

---

## 7. Git-гигиена PR

- [ ] Ветка `feat/…`, `fix/…`, `refactor/…`, `chore/…` от свежего `main`.
- [ ] Коммиты на английском, повелительное наклонение, префикс `feat:` / `fix:` /
      `refactor:` / `chore:`.
- [ ] PR до ~400 строк без учёта `pnpm-lock.yaml` и `messages/*.json`. Больше — разбить.
- [ ] В диффе нет постороннего: попутных рефакторингов, `.env*`, `.next`. `pnpm-lock.yaml`
      меняется только вместе с `package.json`.
- [ ] Новая зависимость обоснована, аналога нет (уже есть: Mantine, TanStack Query, zustand,
      zod, react-hook-form, next-intl, lucide-react, qrcode.react).
- [ ] Изменилось правило архитектуры — обновлены `CLAUDE.md` / README в том же PR.

---

## 8. Сигналы «вернётся на переделку»

Если в PR **два и больше** признака, так и напиши: «в таком виде PR не примут».

1. Новая таблица без RLS или политика без `is_org_member` / `has_module`.
2. Изменение схемы без миграции или без обновления типов.
3. Запросы к Supabase из компонента в обход API сущности.
4. Многошаговая запись цепочкой запросов вместо RPC.
5. Самописные модалка, форма или таблица вместо Mantine + react-hook-form.
6. Хардкод строк и цветов в компонентах.
7. Нет состояний загрузки и ошибки, ошибки мутаций проглатываются.

---

## 9. Публичные (анонимные) сценарии: отдельный проход

Страницы сотрудника (регистрация по QR, отметка), отзыв, QR-меню, вход кассира по ссылке.
В дополнение к §1:

- [ ] Вход через одну RPC-функцию, которая сама проверяет токен, `expires_at`, `is_active`
      QR и точки, `has_module` организации и лимиты.
- [ ] Функция возвращает минимум данных: без `organization_id`, телефонов, чужих записей.
- [ ] Повтор и перебор защищены: уникальный индекс, лимит по устройству, блокировка PIN после
      N попыток.
- [ ] Геолокация проверяется в функции по радиусу, а не только в браузере.
- [ ] Маршрут исключён из `matcher` в `src/proxy.ts`, если не нуждается в языке и сессии.

---

## 10. Что НЕ считать ошибкой

Известные проблемы ведутся в одном месте: [CLAUDE.md](./CLAUDE.md), раздел «Известные
проблемы». Не пиши замечаний по ним, если PR их не трогает. «Не считать ошибкой» не значит
«можно копировать».

---

## 11. Эталоны для ссылок в замечаниях

| Тема | Файл |
| ---- | ---- |
| Миграция: таблицы, RLS на `is_org_member` / `has_module`, RPC, `revoke`/`grant` | `supabase/migrations/20261127000001_core.sql` |
| RPC-транзакция с валидацией и кодами ошибок | `create_organization`, `start_module_trial` в той же миграции |
| API сущности: клиент параметром, маппер, класс ошибки | `src/entities/organization/api/organization.ts` |
| Ключи и хуки, инвалидация после мутации | `src/entities/module/api/module.keys.ts`, `module.queries.ts` |
| SSR prefetch + `HydrationBoundary` | `src/app/[locale]/dashboard/[orgSlug]/layout.tsx` |
| Форма: react-hook-form + Zod + Mantine, ключ ошибки → перевод | `src/features/create-organization/`, `src/features/auth/ui/LoginForm/` |
| Виджет с Sass Modules по БЭМ | `src/widgets/SiteHeader/` |
| Экран закрытого модуля | `src/widgets/ModuleGate/` |
| Supabase-клиенты | `src/shared/api/supabase/client.ts`, `server.ts`, `proxy.ts` |
| Proxy: язык, сессия, защита маршрутов | `src/proxy.ts` |
| Безопасный редирект `?next=` | `src/app/auth/callback/route.ts` |

Скелет анонимной RPC-функции:

```sql
create function public.attendance_check_in(p_token text, p_device text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_qr public.qr_codes;
begin
  if p_token is null or length(p_device) not between 8 and 256 then
    raise exception 'invalid_input' using errcode = '22023';
  end if;

  select * into v_qr
  from public.qr_codes
  where token = p_token
    and module = 'attendance'
    and is_active
    and (expires_at is null or expires_at > now());

  if not found or not public.has_module(v_qr.organization_id, 'attendance') then
    raise exception 'qr_not_found' using errcode = 'P0002';
  end if;

  -- проверка сотрудника, повтора, геолокации; затем insert
  return jsonb_build_object('ok', true);
end;
$$;

revoke execute on function public.attendance_check_in(text, text) from public;
grant execute on function public.attendance_check_in(text, text) to anon, authenticated;
```

---

## 12. Описание PR (заполняет автор)

```md
## Задача
Что делаем, одной фразой.

## Что сделано
- …

## БД
Нет изменений / миграция `…`: таблицы, политики RLS, функции, индексы. Типы обновлены.

## Как проверить
1. …

## Скриншоты
Для UI: desktop + mobile (360px).

## Вопросы / риски
Что спорно, что не сделано и почему.
```

Если поля «БД» нет, а миграция есть, или PR про UI без скриншотов — попроси дополнить.

---

## 13. Форма ответа

```
## Итог: APPROVE | ПРАВКИ | ПЕРЕДЕЛАТЬ
Сборка: lint ✔/✘, build ✔/✘, миграция на чистой базе ✔/✘/—

### blocker
- `supabase/migrations/…_attendance.sql:40` — политика `attendance_logs_select` без
  `has_module(...)`: журнал читается без подключённого модуля. Правило: REVIEW §1.3.
  Как у нас: `qr_codes_insert` в `20261127000001_core.sql`.

### issue
- `src/entities/x/api/x.queries.ts:30` — после мутации не инвалидирован ключ списка.
  Образец: `useStartTrialMutation`.

### suggestion / nit
- …

### question
- …

### Что хорошо
- Одна-две строки, если есть за что.
```

| Префикс       | Значение                                                   |
| ------------- | ---------------------------------------------------------- |
| `blocker:`    | Исправить до мержа: безопасность, потеря данных, баг       |
| `issue:`      | Исправить, но способ можно обсудить                        |
| `suggestion:` | Предложение, автор решает сам                              |
| `nit:`        | Мелочь (стиль, имя), не блокирует                          |
| `question:`   | Вопрос для понимания, правок не требует                    |

Правила формулировок: `файл:строка`; одно замечание — одно правило; ссылка на образец;
объясняй **почему**. Не предлагай тесты, Storybook, другой стейт-менеджер, ORM и прочее, чего
в проекте нет. Не требуй переводов `kk`/`en`. Если не уверен, как правильно, открой соседний
файл в той же папке: он и есть правило.

## Мерж

- Только после approve и зелёных `lint` / `build`.
- **Squash and merge**, заголовок PR становится итоговым коммитом (`feat: …`), ветку удаляем.
- Миграцию из PR после мержа применяют в Supabase → SQL Editor на dev-проекте и проверяют,
  что приложение работает.
