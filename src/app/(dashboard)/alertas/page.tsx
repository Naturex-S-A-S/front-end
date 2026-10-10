import { Suspense } from "react";

import CustomBox from "@/@core/components/mui/Box";
import Loader from "@/@core/components/react-spinners";
import AlertsList from "@/views/pages/alertas/list";
import { getAlertsPageServer } from "@/api/alert/server";

export const metadata = {
  title: "Alertas - Naturex",
  description: ""
};

type SearchParams = { onlyActive?: string };

const AlertsPage = ({ searchParams }: { searchParams?: SearchParams }) => {
  return (
    <CustomBox title='Alertas'>
      <Suspense fallback={<Loader type='component' />}>
        <AlertsData searchParams={searchParams} />
      </Suspense>
    </CustomBox>
  );
};

async function AlertsData({ searchParams }: { searchParams?: SearchParams }) {
  const onlyActive = searchParams?.onlyActive === "true";

  const alerts = await getAlertsPageServer({ onlyActive });

  return <AlertsList initialData={alerts} onlyActive={onlyActive} />;
}

export default AlertsPage;