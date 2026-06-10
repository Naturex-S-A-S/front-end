import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/nextAuthOptions";
import type { IProvider } from "@/types/pages/financeAdministation";

export async function getProvidersServer(): Promise<IProvider[]> {
  const session = await getServerSession(authOptions);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}providers`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token}`
    },
    next: { tags: ["providers"] }
  });

  if (!res.ok) return [];

  return res.json();
}
