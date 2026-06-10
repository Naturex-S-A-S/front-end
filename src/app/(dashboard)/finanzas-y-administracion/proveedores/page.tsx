import { Suspense } from "react";

import CustomBox from "@/@core/components/mui/Box";
import Create from "@/views/pages/finanzas-y-administracion/proveedores/create";
import List from "@/views/pages/finanzas-y-administracion/proveedores/list";
import { getProvidersServer } from "@/api/providers/server";
import Loader from "@/@core/components/react-spinners";

export const metadata = {
  title: "Proveedores - Naturex",
  description: "Gestión de proveedores"
};

const Page = () => {
  return (
    <CustomBox title='Proveedores'>
      <Create />
      <Suspense fallback={<Loader type='component' />}>
        <ProvidersList />
      </Suspense>
    </CustomBox>
  );
};

async function ProvidersList() {
  const providers = await getProvidersServer();

  return <List initialData={providers} />;
}

export default Page;
