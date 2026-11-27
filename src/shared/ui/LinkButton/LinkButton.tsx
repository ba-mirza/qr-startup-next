"use client";

import { Button, type ButtonProps } from "@mantine/core";
import type { ComponentProps } from "react";

import { Link } from "@/i18n/navigation";

type Props = ButtonProps &
  Pick<ComponentProps<typeof Link>, "href" | "onClick" | "aria-label" | "target">;

// Button c навигацией next-intl. Отдельный клиентский компонент: из RSC нельзя
// передать Link в проп component.
const LinkButton = ({ href, ...props }: Props) => (
  <Button component={Link} href={href} {...props} />
);

export default LinkButton;
