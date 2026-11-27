"use client";

import { useFormatter } from "next-intl";

// Дата без времени в часовом поясе из конфигурации next-intl.
export const useFormatDate = () => {
  const format = useFormatter();
  return (value: string) => format.dateTime(new Date(value), { dateStyle: "medium" });
};
