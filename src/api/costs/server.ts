import { cache } from "react";

import type { ICostConfig } from "@/types/pages/costs";
import { apiFetch } from "../apiFetch";

export const getCostConfigServer = cache(async (): Promise<ICostConfig | null> => {
  try {
    return await apiFetch<ICostConfig>("costs/config", { tags: ["cost-config"] });
  } catch {
    return null;
  }
});
