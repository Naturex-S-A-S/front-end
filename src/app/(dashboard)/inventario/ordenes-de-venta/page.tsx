import { Suspense } from "react";

import CustomBox from "@/@core/components/mui/Box";
import Create from "@/views/pages/finanzas-y-administracion/ordenes-de-venta/create";
import List from "@/views/pages/finanzas-y-administracion/ordenes-de-venta/list";
import { getSalesOrderServer } from "@/api/order/server";
import Loader from "@/@core/components/react-spinners";

export const metadata = {
  title: "Órdenes de Venta - Naturex",
  description: ""
};

const Page = () => {
  return (
    <CustomBox title='Órdenes de Venta'>
      <Create />
      <Suspense fallback={<Loader type='component' />}>
        <SalesOrderList />
      </Suspense>
    </CustomBox>
  );
};

async function SalesOrderList() {
  const data = await getSalesOrderServer();

  return <List initialData={data} />;
}

export default Page;
