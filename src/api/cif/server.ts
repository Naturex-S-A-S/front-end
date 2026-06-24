import { cache } from "react";

import type { ICifType, IPeriod } from "@/types/pages/cif";
import { apiFetch } from "../apiFetch";

export const getCifTypesServer = cache(async (): Promise<ICifType[]> => {
  try {
    console.log("Fetching CIF types...");

    return await apiFetch<ICifType[]>("costs/cif/types", { tags: ["cif-types"] });
  } catch {
    return [];
  }
});

export const getPeriodsServer = cache(async (): Promise<IPeriod[]> => {
  try {
    console.log("Fetching CIF periods...");

    return await apiFetch<IPeriod[]>("costs/cif/periods", { tags: ["cif-periods"] });
  } catch {
    return [];
  }
});

export async function getPeriodByIdServer(id: number): Promise<IPeriod | null> {
  try {
    return await apiFetch<IPeriod>(`costs/cif/periods/${id}`, { tags: ["cif-periods"] });
  } catch {
    return null;
  }
}
