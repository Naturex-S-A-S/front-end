"use client";

import { Alert, Box, Checkbox, Divider, FormControlLabel, Grid, Switch, Typography } from "@mui/material";
import { Icon } from "@iconify/react";

import { Controller, useFormContext } from "react-hook-form";

import CustomCard from "@/@core/components/mui/Card";
import CustomTextField from "@/@core/components/mui/TextField";
import CustomButton from "@/@core/components/mui/Button";
import { formatCurrency } from "@/utils/format";
import type { RegisterPriceFormValues } from "@/utils/schemas/costs";

interface Props {
  waterfall: {
    costBase: number;
    wastePct: number;
    wasteAmount: number;
    costWithWaste: number;
    taxPct: number;
    taxAmount: number;
    costWithTax: number;
  };
  profitMargin: { profit: number; marginPct: number } | null;
  isRegisteringPrice: boolean;
  onRegister: () => void;
}

const WaterfallRow = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <Box display='flex' justifyContent='space-between' alignItems='center' py={0.5}>
    <Typography variant='body2' color='text.secondary'>
      {label}
    </Typography>
    <Typography variant='body2' fontWeight={bold ? 600 : 500}>
      {value}
    </Typography>
  </Box>
);

const RegisterPriceCard = ({ waterfall, profitMargin, isRegisteringPrice, onRegister }: Props) => {
  const {
    register,
    watch,
    control,
    handleSubmit,
    formState: { errors }
  } = useFormContext<RegisterPriceFormValues>();

  const applyTax = watch("applyTax");

  return (
    <CustomCard>
      <form onSubmit={handleSubmit(onRegister)}>
        <Typography variant='h6' fontWeight={600} sx={{ mb: 2 }}>
          Registrar Precio Final
        </Typography>

        <WaterfallRow label='Costo Base (kg)' value={formatCurrency(waterfall.costBase)} />
        <WaterfallRow
          label={`+ Insumos (${waterfall.wastePct.toFixed(2)}%)`}
          value={formatCurrency(waterfall.wasteAmount)}
        />
        <Divider sx={{ my: 0.5, borderStyle: "dashed" }} />
        <WaterfallRow label='Costo con Insumos' value={formatCurrency(waterfall.costWithWaste)} />
        <WaterfallRow
          label={`+ Impuesto (${waterfall.taxPct.toFixed(2)}%)`}
          value={formatCurrency(waterfall.taxAmount)}
        />
        <Divider sx={{ my: 0.5, borderStyle: "dashed" }} />
        <WaterfallRow label='Costo Sugerido' value={formatCurrency(waterfall.costWithTax)} bold />
        <Divider sx={{ my: 1.5 }} />

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12}>
            <Controller
              name='applyTax'
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                  label='Aplicar IVA'
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <CustomTextField
              label='Insumos (%)'
              type='number'
              {...register("wastePct", { valueAsNumber: true })}
              InputProps={{ inputProps: { min: 0, step: 1 } }}
              error={!!errors.wastePct}
              helperText={errors.wastePct?.message as string}
            />
          </Grid>
          <Grid item xs={6}>
            {applyTax && (
              <CustomTextField
                label='Impuesto (%)'
                type='number'
                {...register("taxPct", { valueAsNumber: true })}
                InputProps={{ inputProps: { min: 0, step: 1 } }}
                error={!!errors.taxPct}
                helperText={errors.taxPct?.message as string}
                sx={{ mt: 1 }}
              />
            )}
          </Grid>
        </Grid>

        <CustomTextField
          label='Precio Final'
          type='number'
          placeholder='Ej: 12500.00'
          {...register("finalPrice", { valueAsNumber: true })}
          error={!!errors.finalPrice}
          helperText={errors.finalPrice?.message as string}
          sx={{
            mb: 2,
            "& input": { fontWeight: 700, fontSize: "1.1rem" }
          }}
        />
        {profitMargin && (
          <Alert
            severity={profitMargin.marginPct < 0 ? "warning" : "info"}
            icon={<Icon icon={profitMargin.marginPct < 0 ? "mdi:alert-outline" : "mdi:information-outline"} />}
            sx={{ mb: 2 }}
          >
            Margen de ganancia: {formatCurrency(profitMargin.profit)} ({profitMargin.marginPct.toFixed(2)}%)
          </Alert>
        )}
        <CustomTextField
          label='Notas'
          placeholder='Ej: Precio revisado con CIF de Q2 2026'
          multiline
          rows={2}
          {...register("priceNotes")}
          sx={{ mb: 2 }}
        />
        <FormControlLabel
          control={<Checkbox {...register("isDefinitive")} />}
          label={
            <Box>
              <Typography variant='caption' color='text.secondary'>
                Marca este costo como definitivo.
              </Typography>
            </Box>
          }
        />
        <CustomButton
          type='submit'
          isLoading={isRegisteringPrice}
          startIcon={<Icon icon='mdi:content-save-outline' />}
          className='w-full'
        >
          Guardar Precio
        </CustomButton>
      </form>
    </CustomCard>
  );
};

export default RegisterPriceCard;
