"use client";

import { useState, useTransition } from "react";

import { useRouter, usePathname } from "next/navigation";

import { FormProvider, useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";
import moment from "moment";

import { Badge, Box, Card, Chip, Grid, MenuItem, Stack, Typography } from "@mui/material";

import { Icon } from "@iconify/react";

import CustomCard from "@/@core/components/mui/Card";
import CustomButton from "@/@core/components/mui/Button";
import CustomDialog from "@/@core/components/mui/Dialog";
import CustomTextField from "@/@core/components/mui/TextField";
import CustomDatePicker from "@/@core/components/react-datepicker";
import { createPeriod } from "@/api/cif/actions";
import { periodSchema } from "@/utils/schemas/cif";
import type { IPeriod, IPostPeriod } from "@/types/pages/cif";
import CustomIconButton from "@/@core/components/mui/IconButton";

interface CIFPeriodsProps {
  data: IPeriod[];
}

const CIFPeriods = ({ data }: CIFPeriodsProps) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const selectedId = pathname.match(/\/(\d+)$/)?.[1] || null;

  return (
    <>
      <CustomCard
        title={
          <Stack direction='row' spacing={4} alignItems='center'>
            <Icon icon='mdi:calendar-month' fontSize={15} />
            <Typography variant='h6' fontWeight={600}>
              Periodos
            </Typography>
            <Badge badgeContent={data.length} color='secondary' />
          </Stack>
        }
        action={
          <CustomButton size='small' onClick={() => setOpen(true)}>
            Agregar
          </CustomButton>
        }
      >
        <Box display='flex' flexDirection='column' gap={2}>
          {data.map(item => (
            <Card
              key={item.id}
              variant='outlined'
              sx={{
                borderColor: selectedId === String(item.id) ? "primary.main" : undefined,
                bgcolor: selectedId === String(item.id) ? "action.selected" : undefined,
                cursor: "pointer"
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 16px"
                }}
              >
                <Stack direction={"column"} spacing={2}>
                  <Stack direction='row' spacing={4} alignItems='center'>
                    <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                      {item.name}
                    </Typography>
                    <Chip
                      label={item.status === "open" ? "Abierto" : "Cerrado"}
                      size='small'
                      color={item.status === "open" ? "success" : "default"}
                      variant='outlined'
                    />
                  </Stack>
                  <Typography variant='subtitle2' sx={{ color: "text.secondary" }}>
                    {item.startDate} a {item.endDate}
                  </Typography>
                </Stack>
                <CustomIconButton
                  onClick={e => {
                    e.stopPropagation();
                    router.push(`/finanzas-y-administracion/cif/${item.id}`);
                  }}
                >
                  <Icon icon='mingcute:right-fill' fontSize={15} />
                </CustomIconButton>
              </Box>
            </Card>
          ))}
        </Box>
      </CustomCard>
      {open && (
        <CreatePeriodDialog
          open={open}
          onClose={() => {
            setOpen(false);
          }}
        />
      )}
    </>
  );
};

interface DialogProps {
  open: boolean;
  onClose: () => void;
}

const CreatePeriodDialog = ({ open, onClose }: DialogProps) => {
  const [isPending, startTransition] = useTransition();

  const methods = useForm<any>({
    defaultValues: { name: "", month: undefined, year: undefined, startDate: null, endDate: null, notes: "" },
    resolver: yupResolver(periodSchema) as any
  });

  const { handleSubmit, reset, control } = methods;

  const onSubmit = (data: any) => {
    const payload: IPostPeriod = {
      ...data,
      startDate: data.startDate ? moment(data.startDate).format("YYYY-MM-DD") : "",
      endDate: data.endDate ? moment(data.endDate).format("YYYY-MM-DD") : ""
    };

    startTransition(async () => {
      const result = await createPeriod(payload);

      if (result.success) {
        toast.success("Período creado con éxito");
        reset();
        onClose();
      } else {
        toast.error(result.error || "Error al crear el período");
      }
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <CustomDialog open={open} toogleDialog={handleClose} title='Agregar Período' maxWidth='xs'>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Controller
                name='name'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    autoFocus
                    fullWidth
                    label='Nombre'
                    placeholder='Ej: Junio 2026'
                    error={!!methods.formState.errors.name}
                    helperText={methods.formState.errors.name?.message as string}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name='month'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label='Mes'
                    error={!!methods.formState.errors.month}
                    helperText={methods.formState.errors.month?.message as string}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <MenuItem key={m} value={m}>
                        {m}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name='year'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Año'
                    type='number'
                    error={!!methods.formState.errors.year}
                    helperText={methods.formState.errors.year?.message as string}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                control={control}
                errors={methods.formState.errors.startDate}
                name='startDate'
                label='Fecha de inicio'
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                control={control}
                errors={methods.formState.errors.endDate}
                name='endDate'
                label='Fecha de fin'
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='notes'
                control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth label='Notas' multiline rows={3} placeholder='Opcional' />
                )}
              />
            </Grid>
            <Grid item xs={12} className='flex justify-center'>
              <CustomButton text='Guardar' type='submit' isLoading={isPending} />
            </Grid>
          </Grid>
        </form>
      </FormProvider>
    </CustomDialog>
  );
};

export default CIFPeriods;
