import type { ModuleKey } from "@/shared/config/site";

export type ModuleState = {
  key: ModuleKey;
  isAvailable: boolean;
  trialDays: number;
  priceMonthly: number | null;
  // Подключение у организации
  isActive: boolean;
  activeUntil: string | null;
  trialUsed: boolean;
  canStartTrial: boolean;
};
