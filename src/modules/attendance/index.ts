import type { ModuleDefinition } from "@/shared/lib/module-contract";

import AttendanceHome from "./ui/AttendanceHome";
import AttendancePublic from "./ui/AttendancePublic";

export const attendanceModule: ModuleDefinition = {
  key: "attendance",
  nav: ["home"],
  pages: { home: AttendanceHome },
  publicPage: AttendancePublic,
};
