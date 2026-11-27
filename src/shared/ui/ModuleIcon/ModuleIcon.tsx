import { Gift, MessageSquareText, UserCheck, UtensilsCrossed, type LucideProps } from "lucide-react";

import type { ModuleKey } from "@/shared/config/site";

const ICONS = {
  attendance: UserCheck,
  feedback: MessageSquareText,
  menu: UtensilsCrossed,
  bonus: Gift,
} as const;

type Props = LucideProps & { module: ModuleKey };

const ModuleIcon = ({ module, ...props }: Props) => {
  const Icon = ICONS[module];
  return <Icon {...props} />;
};

export default ModuleIcon;
