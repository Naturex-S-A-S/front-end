"use client";

import { Box, Checkbox, Divider, FormControlLabel, Grid, Typography } from "@mui/material";
import { Icon } from "@iconify/react";

import { useFormContext } from "react-hook-form";

import CustomCard from "@/@core/components/mui/Card";
import CustomTextField from "@/@core/components/mui/TextField";
import CustomButton from "@/@core/components/mui/Button";
import { formatCurrency } from "@/utils/format";
import type { RegisterPriceFormValues } from "@/utils/schemas/costs";
import type { ICostEstimate } from "@/types/pages/costs";

interface Props {
  readonly: boolean;
  estimate: ICostEstimate;
  isRegisteringPrice: boolean;
  onRegister: () => void;
}

const WaterfallRow = ({
  label,
  variant = "body2",
  value,
  bold,
  color
}: {
  label: string;
  variant?: "body2" | "body1";
  value: string;
  bold?: boolean;
  color?: string;
}) => (
  <Box display='flex' justifyContent='space-between' alignItems='center' py={0.5}>
    <Typography variant={variant} color={color ?? "text.secondary"}>
      {label}
    </Typography>
    <Typography variant={variant} fontWeight={bold ? 600 : 500} color={color}>
      {value}
    </Typography>
  </Box>
);

const RegisterPriceCard = ({ readonly, estimate, isRegisteringPrice, onRegister }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useFormContext<RegisterPriceFormValues>();

  return (
    <CustomCard className='sticky'>
      <form onSubmit={handleSubmit(onRegister)}>
        <Typography variant='h6' fontWeight={600} sx={{ mb: 2 }}>
          Registrar Precio Final
        </Typography>

        <WaterfallRow label='Costo produccion' value={formatCurrency(estimate.totalCost)} />
        <Divider sx={{ my: 0.5, borderStyle: "dashed" }} />
        <WaterfallRow
          label={`+ Insumos (${estimate.wastePct.toFixed(2)}%)`}
          value={formatCurrency(estimate.wasteValue)}
        />
        <WaterfallRow
          label={`+ Margen (${estimate.defaultMarginPct}%)`}
          value={formatCurrency(estimate.defaultMarginValue)}
        />
        <Divider sx={{ my: 0.5, borderStyle: "dashed" }} />
        <WaterfallRow label='Precio Sugerido' value={formatCurrency(estimate.price.suggestedPrice)} />
        <Divider sx={{ my: 1.5 }} />

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/*<Grid item xs={12}>
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
          </Grid>*/}
          <Grid item xs={6}>
            <CustomTextField
              label='Insumos (%)'
              type='number'
              disabled={readonly}
              {...register("wastePct", { valueAsNumber: true })}
              InputProps={{ inputProps: { min: 0, step: 1 } }}
              error={!!errors.wastePct}
              helperText={errors.wastePct?.message as string}
            />
          </Grid>
          <Grid item xs={6}>
            <CustomTextField
              label='Comisión (%)'
              type='number'
              disabled={readonly}
              {...register("comissionPct", { valueAsNumber: true })}
              InputProps={{ inputProps: { min: 0, step: 1 } }}
              error={!!errors.comissionPct}
              helperText={errors.comissionPct?.message as string}
            />
          </Grid>
          {/*<Grid item xs={6}>
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
          </Grid>*/}
        </Grid>

        <CustomTextField
          label='Precio Final'
          type='number'
          disabled={readonly}
          placeholder='Ej: 12500.00'
          {...register("finalPrice", { valueAsNumber: true })}
          error={!!errors.finalPrice}
          helperText={errors.finalPrice?.message as string}
          sx={{
            mb: 2,
            "& input": { fontWeight: 700, fontSize: "1.1rem" }
          }}
        />
        {Number.isFinite(estimate.price.commissionValue) && (
          <WaterfallRow label={`Comisión`} value={formatCurrency(estimate.price.commissionValue)} />
        )}
        <WaterfallRow label={`Margen de ganancia`} value={formatCurrency(estimate.costDifference)} />
        <WaterfallRow
          label={`Utilidad`}
          variant='body1'
          value={estimate?.utilityPct?.toFixed(2) + "%"}
          color={estimate?.utilityPct?.toFixed(2) >= estimate?.defaultMarginPct?.toFixed(2) ? "success.main" : "error"}
        />
        <Divider sx={{ my: 1.5 }} />
        <CustomTextField
          label='Notas'
          disabled={readonly}
          placeholder='Ej: Precio revisado con CIF de Q2 2026'
          multiline
          rows={2}
          {...register("priceNotes")}
          sx={{ mb: 2 }}
        />
        <FormControlLabel
          control={<Checkbox disabled={readonly} {...register("isDefinitive")} />}
          label={
            <Box>
              <Typography variant='caption' color='text.secondary'>
                Marca este costo como definitivo.
              </Typography>
            </Box>
          }
        />
        {!readonly && (
          <CustomButton
            type='submit'
            isLoading={isRegisteringPrice}
            startIcon={<Icon icon='mdi:content-save-outline' />}
            className='w-full'
          >
            Guardar Precio
          </CustomButton>
        )}
      </form>
    </CustomCard>
  );
};

export default RegisterPriceCard;
