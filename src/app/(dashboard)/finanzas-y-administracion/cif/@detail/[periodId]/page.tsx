import { Box, Chip, Grid, Typography } from "@mui/material";

import { Icon } from "@iconify/react";

import CustomCard from "@/@core/components/mui/Card";
import { getPeriodByIdServer } from "@/api/cif/server";
import type { IPeriod } from "@/types/pages/cif";

const PeriodDetailPage = async ({ params }: { params: { periodId: string } }) => {
  const period = await getPeriodByIdServer(Number(params.periodId));

  if (!period) {
    return (
      <CustomCard>
        <Box display='flex' flexDirection='column' alignItems='center' gap={2} py={8}>
          <Icon icon='mdi:alert-circle-outline' fontSize={48} color='error' />
          <Typography variant='h6' color='text.secondary'>
            Período no encontrado ....
          </Typography>
        </Box>
      </CustomCard>
    );
  }

  return <PeriodDetail period={period} />;
};

const PeriodDetail = ({ period }: { period: IPeriod }) => {
  return (
    <CustomCard
      title={
        <div className='flex items-center gap-2'>
          <Icon icon='mdi:information-outline' fontSize={20} /> {period.name}
        </div>
      }
    >
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Typography variant='caption' color='text.disabled'>
            Mes
          </Typography>
          <Typography variant='body2'>{period.month}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant='caption' color='text.disabled'>
            Año
          </Typography>
          <Typography variant='body2'>{period.year}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant='caption' color='text.disabled'>
            Fecha de inicio
          </Typography>
          <Typography variant='body2'>{period.startDate}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant='caption' color='text.disabled'>
            Fecha de fin
          </Typography>
          <Typography variant='body2'>{period.endDate}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant='caption' color='text.disabled'>
            Estado
          </Typography>
          <Box mt={0.5}>
            <Chip
              label={period.status === "open" ? "Abierto" : "Cerrado"}
              size='small'
              color={period.status === "open" ? "success" : "default"}
              variant='outlined'
            />
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Typography variant='caption' color='text.disabled'>
            Creado por
          </Typography>
          <Typography variant='body2'>{period.nameUser}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant='caption' color='text.disabled'>
            Kg producidos
          </Typography>
          <Typography variant='body2'>{period.totalKgProduced ?? "—"}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant='caption' color='text.disabled'>
            Tasa CIF por kg
          </Typography>
          <Typography variant='body2'>{period.cifRatePerKg ?? "—"}</Typography>
        </Grid>
        {period.dateClosed && (
          <Grid item xs={6}>
            <Typography variant='caption' color='text.disabled'>
              Fecha de cierre
            </Typography>
            <Typography variant='body2'>{period.dateClosed}</Typography>
          </Grid>
        )}
        {period.notes && (
          <Grid item xs={12}>
            <Typography variant='caption' color='text.disabled'>
              Notas
            </Typography>
            <Typography variant='body2'>{period.notes}</Typography>
          </Grid>
        )}
        {period.items.length > 0 && (
          <Grid item xs={12}>
            <Typography variant='caption' color='text.disabled'>
              Items ({period.items.length})
            </Typography>
          </Grid>
        )}
      </Grid>
    </CustomCard>
  );
};

export default PeriodDetailPage;
