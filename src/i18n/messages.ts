import type attendance from "../../messages/ru/attendance.json";
import type core from "../../messages/ru/core.json";
import type feedback from "../../messages/ru/feedback.json";
import type menu from "../../messages/ru/menu.json";

// Тексты модуля — свой файл messages/<locale>/<module>.json, в сообщениях он лежит под
// ключом модуля: useTranslations("menu.home"). Новый модуль: файл + строка здесь и в MODULE_FILES.
export type AppMessages = typeof core & {
  attendance: typeof attendance;
  feedback: typeof feedback;
  menu: typeof menu;
};

export const MODULE_FILES = ["attendance", "feedback", "menu"] as const;
