"use client";

import { Alert, Box, Grid, Typography } from "@mui/material";

import { useQuery } from "@tanstack/react-query";

import CustomCard from "@/@core/components/mui/Card";
import { getCategoriesLot } from "@/api/general-parameters/categories-lot";

const LotesList = () => {
  const { data: lots = [] } = useQuery({
    queryKey: ["getCategoriesLot"],
    queryFn: getCategoriesLot
  });

  return (
    <Box className='flex flex-col gap-4'>
      <Alert severity='info'>
        Si necesita agregar un nuevo formato de lote, debe comunicarse con el area de soporte.
      </Alert>

      <CustomCard title='Listado de categorías de lote'>
        <Grid container spacing={2}>
          {lots.map((lot: any) => (
            <Grid item xs={12} sm={6} md={4} key={lot.id}>
              <CustomCard>
                <Box display='flex' flexDirection='column' gap={1}>
                  <Typography variant='h6'>{lot.name}</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Formato: {lot.lotFormat}
                  </Typography>
                </Box>
              </CustomCard>
            </Grid>
          ))}
          {lots.length === 0 && (
            <Grid item xs={12}>
              <Typography variant='body2' color='text.secondary' textAlign='center'>
                No hay categorías de lote registradas
              </Typography>
            </Grid>
          )}
        </Grid>
      </CustomCard>
    </Box>
  );
};

export default LotesList;
