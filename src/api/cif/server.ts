import { cache } from "react";

import type { ICifType, IPeriod } from "@/types/pages/cif";
import { apiFetch } from "../apiFetch";

export const getCifTypesServer = cache(async (): Promise<ICifType[]> => {
  try {
    return await apiFetch<ICifType[]>("costs/cif/types", { tags: ["cif-types"] });
  } catch {
    return [];
  }
});

export const getPeriodsServer = cache(async (): Promise<IPeriod[]> => {
  try {
    return await apiFetch<IPeriod[]>("costs/cif/periods", { tags: ["cif-periods"] });
  } catch {
    return [];
  }
});

export async function getPeriodByIdServer(id: number): Promise<IPeriod | null> {
  try {
    return await apiFetch<IPeriod>(`costs/cif/periods/${id}`, { tags: [`cif-periods-${id}`] });
  } catch {
    return null;
  }
}
