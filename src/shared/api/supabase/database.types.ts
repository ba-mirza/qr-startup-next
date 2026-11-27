// Пишется вручную по supabase/migrations. Меняешь миграцию — обнови файл своей схемы
// в schema/ в том же PR. Этот файл только собирает схемы ядра и модулей.

import type { AttendanceEnums, AttendanceFunctions, AttendanceTables } from "./schema/attendance";
import type { CoreEnums, CoreFunctions, CoreTables } from "./schema/core";
import type { FeedbackEnums, FeedbackFunctions, FeedbackTables } from "./schema/feedback";
import type { MenuEnums, MenuFunctions, MenuTables } from "./schema/menu";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: CoreTables & AttendanceTables & FeedbackTables & MenuTables;
    Views: { [_ in never]: never };
    Functions: CoreFunctions & AttendanceFunctions & FeedbackFunctions & MenuFunctions;
    Enums: CoreEnums & AttendanceEnums & FeedbackEnums & MenuEnums;
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];
