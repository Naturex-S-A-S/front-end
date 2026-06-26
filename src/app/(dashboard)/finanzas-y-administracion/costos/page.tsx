import { Suspense } from "react";

import { Box } from "@mui/material";

import CustomBox from "@/@core/components/mui/Box";
import Loader from "@/@core/components/react-spinners";
import ConfigForm from "@/views/pages/finanzas-y-administracion/costos/config";
import Tabs from "@/views/pages/finanzas-y-administracion/costos/tabs";
import EstimateView from "@/views/pages/finanzas-y-administracion/costos/estimate";
import { getCostConfigServer } from "@/api/costs/server";
import { getPeriodsServer } from "@/api/cif/server";

export const metadata = {
  title: "Costos - Naturex",
  description: "Configuración general de costos"
};

const Page = ({ searchParams }: { searchParams?: { tab?: string } }) => {
  const tab = searchParams?.tab || "Configuracion";

  return (
    <CustomBox title='Costos'>
      <Suspense fallback={<Loader type='component' />}>
        <CostContent tab={tab} />
      </Suspense>
    </CustomBox>
  );
};

async function CostContent({ tab }: { tab: string }) {
  const [config, periods] = await Promise.all([getCostConfigServer(), getPeriodsServer()]);

  const hasConfig = config !== null && periods.length > 0;

  if (!hasConfig) {
    return <ConfigForm initialData={config} periodsCount={periods.length} />;
  }

  return (
    <>
      <Tabs />
      <Box width='100%'>
        {tab === "Configuracion" && <ConfigForm initialData={config} periodsCount={periods.length} />}
        {tab === "Estimacion" && (
          <Suspense fallback={<Loader type='component' />}>
            <EstimateView />
          </Suspense>
        )}
      </Box>
    </>
  );
}

export default Page;
