import { Suspense } from "react";

import { notFound } from "next/navigation";

import Loader from "@/@core/components/react-spinners";
import Header from "@/components/layout/detail/inventory/Header";
import Detail from "@/views/pages/finanzas-y-administracion/ordenes-de-venta/detail";
import { getSalesOrderByIdServer } from "@/api/order/server";

export const metadata = {
  title: "Detalle de Orden de Venta - Naturex",
  description: "Detalle de la orden de venta"
};

const Page = ({ params }: { params: { id: string } }) => {
  return (
    <Suspense fallback={<Loader type='component' />}>
      <DataFetcher id={params.id} />
    </Suspense>
  );
};

async function DataFetcher({ id }: { id: string }) {
  const saleOrder = await getSalesOrderByIdServer(id);

  if (!saleOrder) {
    notFound();
  }

  return (
    <div className='flex flex-col gap-2'>
      <Header name={saleOrder.fileName} />
      <Detail saleOrder={saleOrder} />
    </div>
  );
}

export default Page;
