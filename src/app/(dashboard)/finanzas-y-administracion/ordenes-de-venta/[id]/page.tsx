import { notFound } from "next/navigation";

import Header from "@/components/layout/detail/inventory/Header";
import Detail from "@/views/pages/finanzas-y-administracion/ordenes-de-venta/detail";
import { getSalesOrderByIdServer } from "@/api/order/server";

export const metadata = {
  title: "Detalle de Orden de Venta - Naturex",
  description: "Detalle de la orden de venta"
};

const Page = async ({ params }: { params: { id: string } }) => {
  const saleOrder = await getSalesOrderByIdServer(params.id);

  if (!saleOrder) {
    notFound();
  }

  return (
    <div className='flex flex-col gap-2'>
      <Header name={saleOrder.fileName} />
      <Detail saleOrder={saleOrder} />
    </div>
  );
};

export default Page;
