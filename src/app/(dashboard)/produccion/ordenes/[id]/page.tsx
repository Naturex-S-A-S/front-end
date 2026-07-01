import OrderDetailClient from "./OrderDetailClient";
import { getOrderByIdServer } from "@/api/order/server";

type Props = {
  params: { id: string };
};

async function Page({ params }: Props) {
  const order = await getOrderByIdServer(params.id);

  return <OrderDetailClient order={order} />;
}

export default Page;
