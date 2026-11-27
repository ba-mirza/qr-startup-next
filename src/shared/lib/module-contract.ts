import type { ComponentType } from "react";

import type { ModuleKey } from "@/shared/config/site";

// Контракт между ядром и модулем. Модуль описывает себя объектом ModuleDefinition в
// src/modules/<module>/index.ts, ядро (src/app) подключает его через реестр src/modules.

export type ModuleOrganization = { id: string; slug: string; name: string };

// Страница модуля в кабинете: /dashboard/[orgSlug]/[module]/[segment]/...rest.
// Модуль уже проверен как подключённый; права на данные всё равно проверяет RLS.
export type ModulePageProps = { organization: ModuleOrganization; rest: string[] };

// Публичная страница по QR: /q/[token]. QR проверен resolve_qr(): активен, не истёк,
// модуль подключён. Данные модуль получает своей RPC по тому же token.
export type ModulePublicPageProps = { token: string; purpose: string };

export type ModuleDefinition = {
  key: ModuleKey;
  // Сегменты пунктов меню в кабинете. "home" — главная модуля. Подпись пункта берётся из
  // messages/<locale>/<module>.json → nav.<segment>.
  nav: readonly string[];
  // Страница на каждый сегмент, "home" обязателен.
  pages: { home: ComponentType<ModulePageProps> } & Record<string, ComponentType<ModulePageProps>>;
  // Гостевая страница по QR, если модуль работает с анонимами.
  publicPage?: ComponentType<ModulePublicPageProps>;
};
