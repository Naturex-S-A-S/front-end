"use client";

import { Alert, Box, Grid, Stack, Typography } from "@mui/material";

import { useQuery } from "@tanstack/react-query";

import Loader from "@/@core/components/react-spinners";
import CustomCard from "@/@core/components/mui/Card";
import { getCategoriesLot } from "@/api/general-parameters/categories-lot";

interface LotCategory {
  id: string;
  name: string;
  description?: string | null;
  lotFormat?: string | null;
}

const getLotDescription = (lot: LotCategory): string | null => {
  if (lot.description?.trim()) return lot.description.trim();

  return null;
};

const LotesList = () => {
  const { data: lots = [], isLoading } = useQuery({
    queryKey: ["getCategoriesLot"],
    queryFn: getCategoriesLot
  });

  return (
    <Box className='flex flex-col gap-4'>
      <Alert severity='info'>
        Si necesita agregar un nuevo formato de lote, debe comunicarse con el area de soporte.
      </Alert>

      <CustomCard title='Listado de categorías de lote'>
        {isLoading ? (
          <Loader type='component' />
        ) : (
          <Grid container spacing={3}>
            {lots.map((lot: LotCategory) => {
              const description = getLotDescription(lot);

              return (
                <Grid item xs={12} sm={6} md={4} key={lot.id}>
                  <CustomCard className='h-full'>
                    <Stack spacing={1.5} className='h-full'>
                      <Typography
                        variant='h6'
                        fontWeight={600}
                        sx={{ textWrap: "balance", overflow: "hidden", textOverflow: "ellipsis" }}
                      >
                        {lot.name}
                      </Typography>
                      {description ? (
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{
                            textWrap: "pretty",
                            display: "-webkit-box",
                            WebkitLineClamp: 5,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden"
                          }}
                        >
                          {description}
                        </Typography>
                      ) : (
                        <Typography variant='body2' color='text.disabled' fontStyle='italic'>
                          Sin descripción registrada
                        </Typography>
                      )}
                    </Stack>
                  </CustomCard>
                </Grid>
              );
            })}
            {lots.length === 0 && (
              <Grid item xs={12}>
                <Box py={4}>
                  <Typography variant='body2' color='text.secondary' textAlign='center'>
                    No hay categorías de lote registradas
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </CustomCard>
    </Box>
  );
};

export default LotesList;
