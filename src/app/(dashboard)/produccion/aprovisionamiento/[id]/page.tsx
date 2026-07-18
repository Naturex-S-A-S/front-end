import { notFound } from "next/navigation";

import { getOrderSupplyByIdServer } from "@/api/order/server";
import OrderSupplyDetailClient from "./OrderSupplyDetailClient";

export const metadata = {
  title: "Aprovisionamiento - Naturex",
  description: "Detalle de aprovisionamiento"
};

type Props = {
  params: { id: string };
};

const Page = async ({ params }: Props) => {
  const orderSupply = await getOrderSupplyByIdServer(params.id);

  if (!orderSupply) {
    notFound();
  }

  return <OrderSupplyDetailClient orderSupply={orderSupply} />;
};

export default Page;
