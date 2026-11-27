import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ru", "kk", "en"],
  defaultLocale: "ru",
  localePrefix: "as-needed",
  // Язык выбирает пользователь, а не заголовок браузера: по умолчанию всегда русский.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
