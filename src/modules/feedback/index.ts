import type { ModuleDefinition } from "@/shared/lib/module-contract";

import FeedbackHome from "./ui/FeedbackHome";
import FeedbackPublic from "./ui/FeedbackPublic";

export const feedbackModule: ModuleDefinition = {
  key: "feedback",
  nav: ["home"],
  pages: { home: FeedbackHome },
  publicPage: FeedbackPublic,
};
