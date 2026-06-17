import { Suspense } from "react";

import { Grid } from "@mui/material";

import CustomBox from "@/@core/components/mui/Box";
import Tabs from "@/views/pages/soporte/parametros-generales/tabs";
import Category from "@/views/pages/soporte/parametros-generales/category";
import BodegaList from "@/views/pages/soporte/parametros-generales/Bodegas/list";
import { getWarehousesServer } from "@/api/general-parameters/server";
import Loader from "@/@core/components/react-spinners";

export const metadata = {
  title: "Parámetros Generales - Naturex",
  description: ""
};

const Page = ({ searchParams }: { searchParams?: { tab?: string } }) => {
  const tab = searchParams?.tab || "Categorias";

  return (
    <CustomBox title='Parámetros Generales'>
      <Grid container spacing={2}>
        <Tabs />
        <Grid item xs={12} md={8}>
          {tab === "Categorias" && <Category />}
          {tab === "Bodegas" && (
            <Suspense fallback={<Loader type='component' />}>
              <BodegaFetcher />
            </Suspense>
          )}
        </Grid>
      </Grid>
    </CustomBox>
  );
};

async function BodegaFetcher() {
  const data = await getWarehousesServer();

  return <BodegaList initialData={data} />;
}

export default Page;
