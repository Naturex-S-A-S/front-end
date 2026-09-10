"use client";

import { Box, Chip, Grid, Stack, Typography } from "@mui/material";

import { Icon } from "@iconify/react";

import CustomCard from "@/@core/components/mui/Card";
import type { ICifType, IPeriod } from "@/types/pages/cif";
import CustomButton from "@/@core/components/mui/Button";
import CustomDialog from "@/@core/components/mui/Dialog";
import { formatCurrency } from "@/utils/format";
import { useCifPeriodItems } from "./useCifPeriodItems";
import CifItemsTable from "./CifItemsTable";

const PeriodDetail = ({ period, cifTypes }: { period: IPeriod | null; cifTypes: ICifType[] }) => {
  const {
    items,
    isPending,
    isClosed,
    cifTotal,
    closeDialogOpen,
    setCloseDialogOpen,
    setItemField,
    handleSave,
    handleDelete,
    handleAdd,
    handleClosePeriod
  } = useCifPeriodItems(period);

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

  return (
    <CustomCard
      title={
        <div className='flex items-center gap-2'>
          {period.name} ({period.month}/{period.year})
          <Chip
            label={period.status === "open" ? "Abierto" : "Cerrado"}
            size='small'
            color={period.status === "open" ? "success" : "default"}
            variant='outlined'
          />
        </div>
      }
      action={
        !isClosed && (
          <Box>
            <CustomButton
              variant='outlined'
              color='inherit'
              size='small'
              onClick={() => setCloseDialogOpen(true)}
              disabled={isPending}
            >
              <Stack direction='row' alignItems='center' spacing={1}>
                <Icon icon='uil:padlock' fontSize={15} />
                <span>Cerrar periodo</span>
              </Stack>
            </CustomButton>
          </Box>
        )
      }
    >
      <Stack direction='column'>
        <Stack direction='row' spacing={1} alignItems='center'>
          <Icon icon='mdi:calendar' fontSize={15} />
          <Typography variant='body2'>
            {period.startDate} a {period.endDate}
          </Typography>
        </Stack>
        <Typography variant='body2'>{period.notes}</Typography>
      </Stack>

      <Grid container spacing={3} className='mt-2' justifyContent={"center"}>
        <Grid item xs={4}>
          <CustomCard variant='outlined' className='h-full p-2'>
            <Box textAlign='center' py={2}>
              <Typography variant='caption' color='text.secondary'>
                CIF Total del periodo
              </Typography>
              <Typography variant='h5' fontWeight={600} color='primary.main'>
                {formatCurrency(cifTotal)}
              </Typography>
            </Box>
          </CustomCard>
        </Grid>
        <Grid item xs={4}>
          <CustomCard variant='outlined' className='h-full p-2'>
            <Box textAlign='center' py={2}>
              <Typography variant='caption' color='text.secondary'>
                Kg producidos
              </Typography>
              <Typography variant='h5' fontWeight={600} color='primary.main'>
                {period.totalKgProduced}
              </Typography>
            </Box>
          </CustomCard>
        </Grid>

        <Grid item xs={12}>
          <CifItemsTable
            items={items}
            cifTypes={cifTypes}
            isClosed={isClosed}
            isPending={isPending}
            onFieldChange={setItemField}
            onSave={handleSave}
            onDelete={handleDelete}
            onAdd={handleAdd}
          />
        </Grid>
      </Grid>

      <CustomDialog open={closeDialogOpen} toogleDialog={() => setCloseDialogOpen(false)} title='Cerrar período' maxWidth='xs'>
        <Stack spacing={4} alignItems='center'>
          <Typography variant='body1'>
            ¿Está seguro de que desea cerrar el período <b>{period.name}</b>? Una vez cerrado no podrá modificar los
            ítems.
          </Typography>
          <Stack direction='row' spacing={2}>
            <CustomButton variant='outlined' color='secondary' onClick={() => setCloseDialogOpen(false)}>
              Cancelar
            </CustomButton>
            <CustomButton onClick={handleClosePeriod} isLoading={isPending}>
              Cerrar período
            </CustomButton>
          </Stack>
        </Stack>
      </CustomDialog>
    </CustomCard>
  );
};

export default PeriodDetail;
