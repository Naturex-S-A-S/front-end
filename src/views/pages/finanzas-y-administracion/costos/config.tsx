"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";

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

  const [mode, setMode] = useState<Mode>(hasData ? "view" : "edit");

  const prevPeriodsCount = useRef(periodsCount);

  useEffect(() => {
    setConfig(initialData);
  }, [initialData]);

  useEffect(() => {
    if (periodsCount === 0) {
      setMode("no-periods");
    } else if (prevPeriodsCount.current === 0 && periodsCount > 0) {
      setMode(hasData ? "view" : "edit");
    }

    prevPeriodsCount.current = periodsCount;
  }, [periodsCount, hasData]);

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

  const handleEditClick = () => {
    if (periodsCount === 0) {
      setMode("no-periods");

      return;
    }

    setMode("edit");
  };

  const handleCancel = () => {
    reset(config ?? { cifAveragingMonths: 0, defaultWastePct: 0, defaultMarginPct: 0 });
    setMode("view");
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
        action={
          <CustomButton size='small' onClick={handleEditClick}>
            Editar
          </CustomButton>
        }
      >
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box className='rounded-lg border border-gray-200 p-4'>
              <Stack spacing={1.5} textAlign={"center"}>
                <Stack direction='row' spacing={1} alignItems='center' justifyContent='center'>
                  <Icon icon='mdi:calendar-clock' fontSize={20} className='text-gray-500' />
                  <Typography variant='body2' color='text.secondary'>
                    Meses de Promedio CIF
                  </Typography>
                </Stack>
                <Typography variant='h3' fontWeight={700} color='primary.main'>
                  {config.cifAveragingMonths}
                </Typography>
              </Stack>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box className='rounded-lg border border-gray-200 p-4'>
              <Stack spacing={1.5} textAlign={"center"}>
                <Stack direction='row' spacing={1} alignItems='center' justifyContent='center'>
                  <Icon icon='mdi:package-variant-closed' fontSize={20} className='text-gray-500' />
                  <Typography variant='body2' color='text.secondary'>
                    % Merma por Defecto
                  </Typography>
                </Stack>
                <Typography variant='h3' fontWeight={700} color='primary.main'>
                  {config.defaultWastePct}%
                </Typography>
              </Stack>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box className='rounded-lg border border-gray-200 p-4'>
              <Stack spacing={1.5} textAlign={"center"}>
                <Stack direction='row' spacing={1} alignItems='center' justifyContent='center'>
                  <Icon icon='mdi:percent' fontSize={20} className='text-gray-500' />
                  <Typography variant='body2' color='text.secondary'>
                    % Margen por Defecto
                  </Typography>
                </Stack>
                <Typography variant='h3' fontWeight={700} color='primary.main'>
                  {config.defaultMarginPct}%
                </Typography>
              </Stack>
            </Box>
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
          <Grid container spacing={4} alignItems='flex-end'>
            <Grid item xs={12} sm={4} lg={3}>
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
            <Grid item xs={12} sm={4} lg={3}>
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
            <Grid item xs={12} sm={4} lg={3}>
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
            <Grid item xs={12} lg={3} gap={2} display={"flex"} justifyContent={"center"}>
              <CustomButton variant='outlined' onClick={handleCancel} disabled={isPending}>
                Cancelar
              </CustomButton>
              <CustomButton type='submit' isLoading={isPending}>
                Guardar
              </CustomButton>
            </Grid>
          </Grid>
        </form>
      </FormProvider>
    </CustomCard>
  );
};

export default ConfigForm;
