import { notFound } from "next/navigation";

import { Box } from "@mui/material";

import Header from "@/components/layout/detail/inventory/Header";
import Detail from "@/views/pages/soporte/inventario/material-empaque/detail";
import { getPackagingByIdServer } from "@/api/packaging/server";
import HeaderToggle from "@/views/pages/soporte/inventario/material-empaque/detail/HeaderToggle";

export const metadata = {
  title: "Detalle de Material de Empaque - Naturex",
  description: "Detalle del material de empaque"
};

type Props = {
  params: { id: string };
};

const Page = async ({ params }: Props) => {
  const packaging = await getPackagingByIdServer(params.id);

  if (!packaging) {
    notFound();
  }

  return (
    <Box display='flex' flexDirection='column' gap={2}>
      <Header
        id={params.id}
        name={packaging.name}
        createdAt={packaging.dateCreated}
        active={packaging.active}
        quantity={packaging.quantityTotal}
        actions={<HeaderToggle id={params.id} active={packaging.active} />}
      />
      <Detail packaging={packaging} />
    </Box>
  );
};

export default Page;
