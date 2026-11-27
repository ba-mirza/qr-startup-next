import type { Supabase } from "@/shared/api/supabase";
import { isModuleKey } from "@/shared/config/module-keys";
import type { ModuleKey } from "@/shared/config/site";

export type ResolvedQr = { module: ModuleKey; purpose: string };

export const qrApi = {
  // null — QR недействителен, выключен, истёк или модуль не подключён.
  resolve: async (client: Supabase, token: string): Promise<ResolvedQr | null> => {
    const { data, error } = await client.rpc("resolve_qr", { p_token: token });
    if (error || !isModuleKey(data.module)) return null;
    return { module: data.module, purpose: data.purpose };
  },
};
