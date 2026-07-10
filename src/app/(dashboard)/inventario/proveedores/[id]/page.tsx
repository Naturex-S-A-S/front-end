import { notFound } from "next/navigation";

import { Box } from "@mui/material";

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

const Page = async ({ params }: Props) => {
  const provider = await getProviderByIdServer(params.id);

  if (!provider) {
    notFound();
  }

  return (
    <Box display='flex' flexDirection='column' gap={2}>
      <Header
        id={params.id}
        name={provider.name}
        createdAt={provider.dateCreated.toString()}
        active={provider.active}
      />
      <Detail provider={provider} />
    </Box>
  );
};

export default Page;
