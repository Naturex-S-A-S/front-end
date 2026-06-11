import { Suspense } from "react";

import { notFound } from "next/navigation";

import { Box } from "@mui/material";

import Loader from "@/@core/components/react-spinners";
import Header from "@/components/layout/detail/inventory/Header";
import { getProviderByIdServer } from "@/api/providers/server";
import Detail from "@/views/pages/finanzas-y-administracion/proveedores/detail";

export const metadata = {
  title: "Detalle de Proveedor",
  description: "Detalle de Proveedor"
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
  const provider = await getProviderByIdServer(id);

  if (!provider) {
    notFound();
  }

  return (
    <>
      <Header id={id} name={provider.name} createdAt={provider.dateCreated.toString()} active={provider.active} />
      <Detail provider={provider} />
    </>
  );
}

export default Page;
