import { Suspense } from "react";

import CustomBox from "@/@core/components/mui/Box";
import Loader from "@/@core/components/react-spinners";
import Create from "@/views/aprovisionamiento/create";
import List from "@/views/pages/produccion/aprovisionamiento/list";
import { getOrderSupplyServer } from "@/api/order/server";

export const metadata = {
  title: "Aprovisionamiento - Naturex",
  description: ""
};

const Page = ({ searchParams }: { searchParams?: { productId?: string; status?: string } }) => {
  return (
    <CustomBox title='Aprovisionamiento'>
      <Create />
      <Suspense fallback={<Loader type='component' />}>
        <DataFetcher searchParams={searchParams} />
      </Suspense>
    </CustomBox>
  );
};

async function DataFetcher({ searchParams }: { searchParams?: { productId?: string; status?: string } }) {
  const data = await getOrderSupplyServer(searchParams);

  return <List initialData={data} />;
}

export default Page;
