import { Suspense } from "react";

import CustomBox from "@/@core/components/mui/Box";
import Create from "@/views/order/create";
import List from "@/views/pages/produccion/ordenes/list";
import { getOrdersServer } from "@/api/order/server";
import Loader from "@/@core/components/react-spinners";

export const metadata = {
  title: "Órdenes - Naturex",
  description: ""
};

const OrderPage = ({ searchParams }: { searchParams?: { productId?: string; status?: string } }) => {
  return (
    <CustomBox title='Órdenes'>
      <Create />
      <Suspense fallback={<Loader type='component' />}>
        <OrdersList searchParams={searchParams} />
      </Suspense>
    </CustomBox>
  );
};

async function OrdersList({ searchParams }: { searchParams?: { productId?: string; status?: string } }) {
  const orders = await getOrdersServer(searchParams);

  return <List initialData={orders} />;
}

export default OrderPage;
