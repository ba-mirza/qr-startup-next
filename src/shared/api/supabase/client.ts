import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/shared/config/env";

import type { Database } from "./database.types";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

// Только в клиентских компонентах. На сервере — createServerSupabase.
export const getSupabase = () => {
  if (typeof window === "undefined") {
    throw new Error("getSupabase вызван на сервере, используйте createServerSupabase");
  }
  browserClient ??= createBrowserClient<Database>(env.supabaseUrl, env.supabaseKey);
  return browserClient;
};
