"use client";

import { useMemo, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { FormProvider, useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";

import { Box, Grid, Stack, Typography } from "@mui/material";
import { Icon } from "@iconify/react";

import CustomCard from "@/@core/components/mui/Card";
import CustomTextField from "@/@core/components/mui/TextField";
import CustomButton from "@/@core/components/mui/Button";
import { updateCostConfig } from "@/api/costs/actions";
import { costConfigSchema } from "@/utils/schemas/costs";
import type { ICostConfig, IPutCostConfig } from "@/types/pages/costs";

interface Props {
  initialData: ICostConfig | null;
  periodsCount: number;
}

type Mode = "view" | "edit" | "no-periods";

const ConfigForm = ({ initialData, periodsCount }: Props) => {
  const router = useRouter();
  const [config, setConfig] = useState<ICostConfig | null>(initialData);
  const [isPending, startTransition] = useTransition();

  const hasData = useMemo(
    () =>
      config !== null && (config.cifAveragingMonths > 0 || config.defaultWastePct > 0 || config.defaultMarginPct > 0),
    [config]
  );

  const [mode, setMode] = useState<Mode>(() => {
    if (periodsCount === 0) return "no-periods";

    return hasData ? "view" : "edit";
  });

  const methods = useForm<IPutCostConfig>({
    defaultValues: config ?? { cifAveragingMonths: 0, defaultWastePct: 0, defaultMarginPct: 0 },
    resolver: yupResolver(costConfigSchema) as any
  });

  const { handleSubmit, control, reset, setError } = methods;

  const onSubmit = (data: IPutCostConfig) => {
    if (data.cifAveragingMonths > periodsCount) {
      setError("cifAveragingMonths", {
        type: "manual",
        message: `No puede superar los ${periodsCount} períodos existentes`
      });

      return;
    }

    startTransition(async () => {
      const result = await updateCostConfig(data);

      if (result.success) {
        toast.success("Configuración actualizada con éxito");
        reset(data);
        setConfig(data);
        setMode("view");
      } else {
        toast.error(result.error || "Error al actualizar la configuración");
      }
    });
  };

  const handleUpdateClick = () => {
    if (periodsCount === 0) {
      setMode("no-periods");

      return;
    }

    setMode("edit");
  };

  if (mode === "no-periods") {
    return (
      <CustomCard
        title={
          <Stack direction='row' spacing={2} alignItems='center'>
            <Icon icon='mdi:cog-outline' fontSize={20} />
            <span>Configuración de Costos</span>
          </Stack>
        }
      >
        <Box display='flex' flexDirection='column' alignItems='center' gap={3} py={4}>
          <Icon icon='mdi:alert-circle-outline' fontSize={48} color='#f59e0b' />
          <Typography variant='h6' textAlign='center'>
            No hay períodos CIF creados
          </Typography>
          <Typography variant='body2' color='text.secondary' textAlign='center'>
            Debe crear al menos un período en la sección de Costos Indirectos antes de configurar los costos.
          </Typography>
          <CustomButton onClick={() => router.push("/finanzas-y-administracion/cif")}>Ir a CIF</CustomButton>
        </Box>
      </CustomCard>
    );
  }

  if (mode === "view" && config) {
    return (
      <CustomCard
        title={
          <Stack direction='row' spacing={2} alignItems='center'>
            <Icon icon='mdi:cog-outline' fontSize={20} />
            <span>Configuración de Costos</span>
          </Stack>
        }
      >
        <Grid container spacing={4}>
          <Grid item xs={4} sm={3}>
            <Stack spacing={1}>
              <Typography variant='body2' color='text.secondary'>
                Meses de Promedio CIF
              </Typography>
              <Typography variant='body1' fontWeight={600}>
                {config.cifAveragingMonths}
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={4} sm={3}>
            <Stack spacing={1}>
              <Typography variant='body2' color='text.secondary'>
                % Merma por Defecto
              </Typography>
              <Typography variant='body1' fontWeight={600}>
                {config.defaultWastePct}%
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={4} sm={3}>
            <Stack spacing={1}>
              <Typography variant='body2' color='text.secondary'>
                % Margen por Defecto
              </Typography>
              <Typography variant='body1' fontWeight={600}>
                {config.defaultMarginPct}%
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={3} className='flex justify-center'>
            <CustomButton onClick={handleUpdateClick}>Actualizar</CustomButton>
          </Grid>
        </Grid>
      </CustomCard>
    );
  }

  return (
    <CustomCard
      title={
        <Stack direction='row' spacing={2} alignItems='center'>
          <Icon icon='mdi:cog-outline' fontSize={20} />
          <span>Configuración de Costos</span>
        </Stack>
      }
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={3}>
              <Controller
                name='cifAveragingMonths'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Meses de Promedio CIF'
                    placeholder='Ej: 3'
                    onChange={e => field.onChange(Number(e.target.value))}
                    error={!!methods.formState.errors.cifAveragingMonths}
                    helperText={methods.formState.errors.cifAveragingMonths?.message as string}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Controller
                name='defaultWastePct'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label='% Merma por Defecto'
                    placeholder='Ej: 5.00'
                    onChange={e => field.onChange(Number(e.target.value))}
                    error={!!methods.formState.errors.defaultWastePct}
                    helperText={methods.formState.errors.defaultWastePct?.message as string}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Controller
                name='defaultMarginPct'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label='% Margen por Defecto'
                    placeholder='Ej: 20.00'
                    onChange={e => field.onChange(Number(e.target.value))}
                    error={!!methods.formState.errors.defaultMarginPct}
                    helperText={methods.formState.errors.defaultMarginPct?.message as string}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3} className='flex justify-center'>
              <CustomButton type='submit' isLoading={isPending}>
                Guardar Configuración
              </CustomButton>
            </Grid>
          </Grid>
        </form>
      </FormProvider>
    </CustomCard>
  );
};

export default ConfigForm;
