"use client";

import { Button, Menu } from "@mantine/core";
import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

const LABELS: Record<Locale, string> = { ru: "Русский", kk: "Қазақша", en: "English" };

const LanguageSwitcher = () => {
  const t = useTranslations("header");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <Button
          variant="subtle"
          color="gray"
          size="sm"
          leftSection={<Languages size={16} />}
          aria-label={t("language")}
        >
          {locale.toUpperCase()}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        {routing.locales.map((item) => (
          <Menu.Item
            key={item}
            disabled={item === locale}
            onClick={() => router.replace(pathname, { locale: item })}
          >
            {LABELS[item]}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};

export default LanguageSwitcher;
