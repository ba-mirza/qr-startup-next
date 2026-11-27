import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { MODULE_FILES } from "./messages";
import { routing, type Locale } from "./routing";

type Messages = { [key: string]: string | Messages };

// Файла может не быть: переводы kk/en заполняются перед запуском.
const load = async (locale: Locale, file: string): Promise<Messages> => {
  try {
    return (await import(`../../messages/${locale}/${file}.json`)).default as Messages;
  } catch {
    return {};
  }
};

const loadAll = async (locale: Locale): Promise<Messages> => {
  const [core, ...modules] = await Promise.all([
    load(locale, "core"),
    ...MODULE_FILES.map((file) => load(locale, file)),
  ]);
  return { ...core, ...Object.fromEntries(MODULE_FILES.map((file, i) => [file, modules[i]])) };
};

// Недостающие ключи берутся из ru.
const withFallback = (fallback: Messages, messages: Messages): Messages =>
  Object.fromEntries(
    Object.entries(fallback).map(([key, value]) => {
      const own = messages[key];
      if (typeof value === "string") return [key, typeof own === "string" ? own : value];
      return [key, withFallback(value, typeof own === "object" ? own : {})];
    }),
  );

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const fallback = await loadAll(routing.defaultLocale);
  const messages =
    locale === routing.defaultLocale ? fallback : withFallback(fallback, await loadAll(locale));

  return { locale, timeZone: "Asia/Almaty", messages };
});
