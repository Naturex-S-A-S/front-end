import CustomBox from "@/@core/components/mui/Box";
import Create from "@/views/pages/produccion/empaque/create";
import List from "@/views/pages/produccion/empaque/list";

export const metadata = {
  title: "Empaque - Naturex",
  description: ""
};

const PackingPage = async () => {
  return (
    <CustomBox title='Empaque'>
      <Create />
      <List />
    </CustomBox>
  );
};

export default PackingPage;
