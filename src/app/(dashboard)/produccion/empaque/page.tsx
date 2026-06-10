import { Suspense } from "react";

import CustomBox from "@/@core/components/mui/Box";
import Create from "@/views/pages/produccion/empaque/create";
import List from "@/views/pages/produccion/empaque/list";
import { getPackingServer } from "@/api/packing/server";
import Loader from "@/@core/components/react-spinners";

export const metadata = {
  title: "Empaque - Naturex",
  description: "Gestión de empaques y embalajes"
};

const PackingPage = () => {
  return (
    <CustomBox title='Empaque'>
      <Create />
      <Suspense fallback={<Loader type='component' />}>
        <PackingList />
      </Suspense>
    </CustomBox>
  );
};

async function PackingList() {
  const packingData = await getPackingServer();

  return <List initialData={packingData} />;
}

export default PackingPage;
