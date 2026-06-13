import { notFound } from "next/navigation";

import { Box } from "@mui/material";

import Header from "@/components/layout/detail/inventory/Header";
import Detail from "@/views/pages/produccion/aprovisionamiento/detail";
import { getOrderSupplyByIdServer } from "@/api/order/server";

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

  return (
    <Box display='flex' flexDirection='column' gap={2}>
      <Header id={params.id} name={orderSupply.batch} createdAt={orderSupply.dateCreated} />
      <Detail orderSupply={orderSupply} />
    </Box>
  );
};

export default Page;
