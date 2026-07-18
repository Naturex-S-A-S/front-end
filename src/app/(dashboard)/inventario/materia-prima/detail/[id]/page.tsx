import { notFound } from "next/navigation";

import { Box } from "@mui/material";

import Header from "@/components/layout/detail/inventory/Header";
import Detail from "@/views/pages/soporte/inventario/materia-prima/detail";
import { getFeedstockByIdServer } from "@/api/feedstock/server";
import HeaderToggle from "@/views/pages/soporte/inventario/materia-prima/detail/HeaderToggle";

export const metadata = {
  title: "Detalle de Materia Prima - Naturex",
  description: "Detalle de la materia prima"
};

type Props = {
  params: { id: string };
};

const Page = async ({ params }: Props) => {
  const feedstock = await getFeedstockByIdServer(params.id);

  if (!feedstock) {
    notFound();
  }

  return (
    <Box display='flex' flexDirection='column' gap={2}>
      <Header
        id={params.id}
        name={feedstock.name}
        createdAt={feedstock.dateCreated}
        active={feedstock.active}
        quantity={feedstock.quantityG}
        actions={<HeaderToggle id={params.id} active={feedstock.active} />}
      />
      <Detail feedstock={feedstock} />
    </Box>
  );
};

export default Page;
