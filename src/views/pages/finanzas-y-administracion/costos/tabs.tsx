"use client";

import { useRouter, useSearchParams } from "next/navigation";

import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";

import CustomTabList from "@/@core/components/mui/TabList";

const Tabs = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "Configuracion";

  const handleChange = (_: any, value: string) => {
    router.replace(`?tab=${value}`);
  };

  return (
    <TabContext value={activeTab}>
      <CustomTabList onChange={handleChange} variant='standard'>
        <Tab label='Configuración' value='Configuracion' />
        <Tab label='Estimación de costos' value='Estimacion' />
      </CustomTabList>
    </TabContext>
  );
};

export default Tabs;
