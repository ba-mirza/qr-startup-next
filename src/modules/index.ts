import type { ModuleKey } from "@/shared/config/site";
import type { ModuleDefinition } from "@/shared/lib/module-contract";

import { attendanceModule } from "./attendance";
import { feedbackModule } from "./feedback";
import { menuModule } from "./menu";

// Реестр модулей. Импортирует его только src/app: ядро о модулях не знает.
// Модуль без записи в реестре считается «ещё не готов».
export const moduleRegistry: Partial<Record<ModuleKey, ModuleDefinition>> = {
  attendance: attendanceModule,
  feedback: feedbackModule,
  menu: menuModule,
};
