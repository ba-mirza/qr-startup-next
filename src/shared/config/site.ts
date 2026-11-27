// Якоря разделов лендинга: общие для шапки, подвала и самих разделов.
export const landingSections = {
  modules: "modules",
  how: "how",
  pricing: "pricing",
  about: "about",
} as const;

export type LandingSection = keyof typeof landingSections;

export const moduleKeys = ["attendance", "feedback", "menu", "bonus"] as const;
export type ModuleKey = (typeof moduleKeys)[number];

// Совпадает с modules.is_available в миграции ядра.
export const availableModules: readonly ModuleKey[] = ["attendance"];
