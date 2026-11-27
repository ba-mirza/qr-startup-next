import { moduleKeys, type ModuleKey } from "./site";

export const isModuleKey = (value: string): value is ModuleKey =>
  (moduleKeys as readonly string[]).includes(value);
