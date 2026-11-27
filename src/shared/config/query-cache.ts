import { isServer } from "@tanstack/react-query";

const SECOND = 1000;
const MINUTE = 60 * SECOND;

// На сервере Infinity, как умолчание TanStack Query: конечный gcTime держит
// таймер и вместе с ним контекст SSR-запроса.
const gcTime = (ms: number) => (isServer ? Infinity : ms);

export const queryCacheConfig = {
  default: { staleTime: 30 * SECOND, gcTime: gcTime(30 * MINUTE) },
  // Справочники: каталог модулей, тарифы.
  staticData: { staleTime: 60 * MINUTE, gcTime: gcTime(6 * 60 * MINUTE) },
  // Данные кабинета, которые меняет сам пользователь.
  dashboard: { staleTime: 30 * SECOND, gcTime: gcTime(30 * MINUTE) },
  // Живые данные: журнал отметок, касса.
  live: { staleTime: 5 * SECOND, gcTime: gcTime(10 * MINUTE) },
} as const;
