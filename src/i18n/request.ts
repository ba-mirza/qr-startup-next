import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

type Messages = { [key: string]: string | Messages };

// Переводы kk/en заполняются перед запуском. До тех пор недостающие ключи берутся из ru.
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
  const fallback = (await import("../../messages/ru.json")).default as Messages;
  const own =
    locale === routing.defaultLocale
      ? fallback
      : ((await import(`../../messages/${locale}.json`)).default as Messages);

  return {
    locale,
    timeZone: "Asia/Almaty",
    messages: withFallback(fallback, own),
  };
});
