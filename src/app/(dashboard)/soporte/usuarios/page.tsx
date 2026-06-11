import { Suspense } from "react";

import CustomBox from "@/@core/components/mui/Box";
import Loader from "@/@core/components/react-spinners";
import Create from "@/views/pages/soporte/usuarios/create";
import List from "@/views/pages/soporte/usuarios/list";
import { getUsersServer } from "@/api/user/server";

export const metadata = {
  title: "Usuarios - Naturex",
  description: ""
};

const Page = () => {
  return (
    <CustomBox title='Usuarios'>
      <Create />
      <Suspense fallback={<Loader type='component' />}>
        <DataFetcher />
      </Suspense>
    </CustomBox>
  );
};

async function DataFetcher() {
  const data = await getUsersServer();

  return <List initialData={data} />;
}

export default Page;
