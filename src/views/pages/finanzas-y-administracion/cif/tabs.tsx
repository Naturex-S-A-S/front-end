"use client";

import type { SyntheticEvent } from "react";
import { useState } from "react";

import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import { Box, Tab } from "@mui/material";

import CustomTabList from "@/@core/components/mui/TabList";
import CustomCard from "@/@core/components/mui/Card";
import type { ICifType, IPeriod } from "@/types/pages/cif";
import TiposCIFPanel from "./CIFTypes";
import CIFPeriods from "./CIFPeriods";

interface Props {
  initialCifTypes: ICifType[];
  initialPeriods: IPeriod[];
}

const Tabs = ({ initialCifTypes, initialPeriods }: Props) => {
  const [value, setValue] = useState("1");

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%", typography: "body1" }} display='flex' flexDirection='column' gap={2}>
      <TabContext value={value}>
        <CustomCard className='p-2'>
          <CustomTabList onChange={handleChange} centered variant='fullWidth'>
            <Tab label='Periodos' value='1' />
            <Tab label='Tipos de CIF' value='2' />
          </CustomTabList>
        </CustomCard>

        <TabPanel value='1'>
          <CIFPeriods data={initialPeriods} />
        </TabPanel>
        <TabPanel value='2'>
          <TiposCIFPanel data={initialCifTypes} />
        </TabPanel>
      </TabContext>
    </Box>
  );
};

export default Tabs;
