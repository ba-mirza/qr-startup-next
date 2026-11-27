import type { Supabase } from "@/shared/api/supabase";
import { moduleKeys, type ModuleKey } from "@/shared/config/site";

import type { ModuleState } from "../model/types";

const isModuleKey = (value: string): value is ModuleKey =>
  (moduleKeys as readonly string[]).includes(value);

export type StartTrialErrorKey = "trialAlreadyUsed" | "trialNotAvailable" | "forbidden" | "unknown";

const TRIAL_ERRORS: Record<string, StartTrialErrorKey> = {
  trial_already_used: "trialAlreadyUsed",
  trial_not_available: "trialNotAvailable",
  forbidden: "forbidden",
};

export class StartTrialError extends Error {
  constructor(readonly key: StartTrialErrorKey) {
    super(key);
  }
}

export const moduleApi = {
  // Каталог модулей вместе с состоянием подключения у организации.
  listForOrganization: async (client: Supabase, organizationId: string): Promise<ModuleState[]> => {
    const [catalog, connected] = await Promise.all([
      client.from("modules").select("*").order("sort_order"),
      client.from("org_modules").select("*").eq("organization_id", organizationId),
    ]);
    if (catalog.error) throw catalog.error;
    if (connected.error) throw connected.error;

    const now = Date.now();
    return catalog.data.flatMap((module) => {
      if (!isModuleKey(module.key)) return [];
      const link = connected.data.find((row) => row.module === module.key);
      const isActive =
        link?.status === "active" &&
        (link.active_until === null || new Date(link.active_until).getTime() > now);

      return [
        {
          key: module.key,
          isAvailable: module.is_available,
          trialDays: module.trial_days,
          priceMonthly: module.price_monthly,
          isActive,
          activeUntil: link?.active_until ?? null,
          trialUsed: link?.trial_used ?? false,
          canStartTrial:
            module.is_available && module.trial_days > 0 && !isActive && !(link?.trial_used ?? false),
        },
      ];
    });
  },

  startTrial: async (client: Supabase, organizationId: string, module: ModuleKey) => {
    const { error } = await client.rpc("start_module_trial", {
      p_organization_id: organizationId,
      p_module: module,
    });
    if (error) throw new StartTrialError(TRIAL_ERRORS[error.message] ?? "unknown");
  },
};
