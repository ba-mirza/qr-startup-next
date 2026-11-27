import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

// Запросы сущностей принимают клиент параметром: один код для RSC-prefetch и браузера.
export type Supabase = SupabaseClient<Database>;
