import { Suspense } from "react";

import Loader from "@/@core/components/react-spinners";
import { getCifTypesServer, getPeriodByIdServer } from "@/api/cif/server";
import PeriodDetail from "@/views/pages/finanzas-y-administracion/cif/period/detail";

const Page = ({ params }: { params: { periodId: string } }) => {
  return (
    <Suspense fallback={<Loader type='component' />}>
      <DataFetcher periodId={params.periodId} />
    </Suspense>
  );
};

async function DataFetcher({ periodId }: { periodId: string }) {
  const [period, cifTypes] = await Promise.all([getPeriodByIdServer(Number(periodId)), getCifTypesServer()]);

  return <div key={periodId}><PeriodDetail period={period} cifTypes={cifTypes} /></div>;
}

export default Page;
