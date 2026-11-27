import type { AppMessages } from "@/i18n/messages";
import type { routing } from "@/i18n/routing";

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: AppMessages;
  }
}

declare module "*.module.sass" {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}
