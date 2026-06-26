import { Box, Typography } from "@mui/material";

import { Icon } from "@iconify/react";

import CustomCard from "@/@core/components/mui/Card";

export const metadata = {
  title: "CIF - Naturex",
  description: "Costos indirectos de fabricación"
};

const Page = () => {
  return (
    <CustomCard>
      <Box display='flex' flexDirection='column' alignItems='center' gap={2} py={8}>
        <Icon icon='mdi:calendar-month' fontSize={48} color='text.secondary' />
        <Typography variant='h6' color='text.secondary'>
          Seleccione un período
        </Typography>
        <Typography variant='body2' color='text.disabled'>
          Elija un período de la lista para ver su detalle
        </Typography>
      </Box>
    </CustomCard>
  );
};

export default Page;
