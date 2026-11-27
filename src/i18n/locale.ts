import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";

import { routing, type Locale } from "./routing";

// Сегмент [locale] из params приходит строкой: сужаем до Locale или отдаём 404.
export const toLocale = (value: string): Locale => {
  if (!hasLocale(routing.locales, value)) notFound();
  return value;
};
