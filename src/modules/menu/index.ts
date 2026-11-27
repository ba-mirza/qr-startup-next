import type { ModuleDefinition } from "@/shared/lib/module-contract";

import MenuHome from "./ui/MenuHome";
import MenuPublic from "./ui/MenuPublic";

export const menuModule: ModuleDefinition = {
  key: "menu",
  nav: ["home"],
  pages: { home: MenuHome },
  publicPage: MenuPublic,
};
