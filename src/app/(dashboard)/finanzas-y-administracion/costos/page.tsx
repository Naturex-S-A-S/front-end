import { Suspense } from "react";

import CustomBox from "@/@core/components/mui/Box";
import Loader from "@/@core/components/react-spinners";
import ConfigForm from "@/views/pages/finanzas-y-administracion/costos/config";
import { getCostConfigServer } from "@/api/costs/server";
import { getPeriodsServer } from "@/api/cif/server";

export const metadata = {
  title: "Costos - Naturex",
  description: "Configuración general de costos"
};

const Page = () => {
  return (
    <CustomBox title='Costos'>
      <Suspense fallback={<Loader type='component' />}>
        <CostConfig />
      </Suspense>
    </CustomBox>
  );
};

async function CostConfig() {
  const [config, periods] = await Promise.all([getCostConfigServer(), getPeriodsServer()]);

  return <ConfigForm initialData={config} periodsCount={periods.length} />;
}

export default Page;
