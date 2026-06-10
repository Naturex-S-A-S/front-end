import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/nextAuthOptions";
import type { IPacking } from "@/types/pages/packing";

export async function getPackingServer(): Promise<IPacking[]> {
  const session = await getServerSession(authOptions);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}packing`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token}`
    },
    next: { tags: ["packings"] }
  });

  if (!res.ok) return [];

  return res.json();
}
