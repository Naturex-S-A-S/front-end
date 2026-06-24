import { Suspense } from "react";

import Loader from "@/@core/components/react-spinners";
import Tabs from "@/views/pages/finanzas-y-administracion/cif/tabs";
import { getCifTypesServer, getPeriodsServer } from "@/api/cif/server";

export const metadata = {
  title: "CIF - Naturex",
  description: "Costos indirectos de fabricación"
};

const Page = () => {
  return (
    <Suspense fallback={<Loader type='component' />}>
      <DataFetcher />
    </Suspense>
  );
};

async function DataFetcher() {
  const [initialCifTypes, initialPeriods] = await Promise.all([getCifTypesServer(), getPeriodsServer()]);

  return <Tabs initialCifTypes={initialCifTypes} initialPeriods={initialPeriods} />;
}

export default Page;
