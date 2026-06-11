import { Suspense } from "react";

import { notFound } from "next/navigation";

import { Box } from "@mui/material";

import Loader from "@/@core/components/react-spinners";
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

const Page = ({ params }: Props) => {
  return (
    <Box display='flex' flexDirection='column' gap={2}>
      <Suspense fallback={<Loader type='component' />}>
        <DataFetcher id={params.id} />
      </Suspense>
    </Box>
  );
};

async function DataFetcher({ id }: { id: string }) {
  const orderSupply = await getOrderSupplyByIdServer(id);

  if (!orderSupply) {
    notFound();
  }

  return (
    <>
      <Header id={id} name={orderSupply.batch} createdAt={orderSupply.dateCreated} />
      <Detail orderSupply={orderSupply} />
    </>
  );
}

export default Page;
