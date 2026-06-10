import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/nextAuthOptions";

export const metadata = {
  title: "Home - Naturex",
  description: "Panel de administración de Naturex"
};

export default async function Page() {
  const session = await getServerSession(authOptions);

  return <h1>Home page! {session?.user?.name}</h1>;
}
