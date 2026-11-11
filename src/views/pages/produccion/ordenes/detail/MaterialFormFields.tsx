import type { FC } from "react";

import { Alert, Grid, MenuItem } from "@mui/material";

import { Controller, useWatch, type Control } from "react-hook-form";

import CustomAutocomplete from "@/@core/components/mui/Autocomplete";
import CustomTextField from "@/@core/components/mui/TextField";
import GroupedAutocomplete from "@/@core/components/mui/GroupedAutocomplete";
import useGetOrderDetailLots from "@/hooks/order/useGetOrderDetailLots";
import type { IOrderDetailLot } from "@/types/pages/order";
import { formatCurrency, formatDate } from "@/utils/format";
import type { AdjustmentFormValues } from "./adjustment";

type Option = { id: string; label: string; type: string };

interface MaterialFormFieldsProps {
  control: Control<AdjustmentFormValues>;
  materialOptions: Option[];
  warehouseList: any[];
  isPackaging: boolean;
  orderId: number;
}

const lotLabel = (lot: IOrderDetailLot, unit: string) => {
  const expiration = lot.expirationDate
    ? ` · vence ${formatDate(lot.expirationDate)}${lot.expired ? " (VENCIDO)" : ""}`
    : "";

  return `${lot.batch}${expiration} · ${formatCurrency(lot.unitCost)}/${unit} · devolvible ${lot.quantityReturnable} ${unit}`;
};

/**
 * Campos del ajuste de MP y ME desde la orden (QA-04). En la entrada (devolución) se elige
 * el lote que la orden consumió; en la salida el lote lo decide el sistema.
 */
const MaterialFormFields: FC<MaterialFormFieldsProps> = ({
  control,
  materialOptions,
  warehouseList,
  isPackaging,
  orderId
}) => {
  const material: any = useWatch({ control, name: "material" });
  const type = useWatch({ control, name: "type" });
  const unit = isPackaging ? "und" : "g";

  const { lots, isLoading: isLoadingLots } = useGetOrderDetailLots(orderId, material?.id, type === "IN");

  return (
    <>
      <Grid item xs={6}>
        <Controller
          name='material'
          control={control}
          rules={{ required: "Seleccione un material" }}
          render={({ field: { value, onChange }, fieldState: { error } }: any) => (
            <CustomAutocomplete
              value={value}
              options={materialOptions}
              onChange={(e, v: any) => onChange(v)}
              renderInput={params => (
                <CustomTextField
                  {...params}
                  label='Material'
                  placeholder='Seleccione material'
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          )}
        />
      </Grid>

      <Grid item xs={6}>
        <Controller
          name='type'
          control={control}
          rules={{ required: "Seleccione entrada o salida" }}
          render={({ field: { value, onChange }, fieldState: { error } }: any) => (
            <CustomTextField
              select
              label='Tipo'
              value={value ?? ""}
              onChange={e => onChange(e.target.value)}
              error={!!error}
              helperText={error?.message}
            >
              <MenuItem value='IN'>Entrada (devolución)</MenuItem>
              <MenuItem value='OUT'>Salida (consumo extra)</MenuItem>
            </CustomTextField>
          )}
        />
      </Grid>

      {type === "IN" && (
        <Grid item xs={12}>
          <Controller
            name='lot'
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }: any) => (
              <CustomAutocomplete
                value={value}
                options={lots}
                loading={isLoadingLots}
                disabled={!material}
                getOptionLabel={(option: any) => lotLabel(option, unit)}
                isOptionEqualToValue={(option: any, v: any) => option.idLot === v?.idLot}
                noOptionsText='La orden no ha consumido este material o ya se devolvió todo'
                onChange={(e, v: any) => onChange(v)}
                renderInput={params => (
                  <CustomTextField
                    {...params}
                    label='Lote de origen'
                    placeholder={material ? "Seleccione el lote al que se devuelve" : "Seleccione primero el material"}
                    error={!!error}
                    helperText={
                      error?.message ??
                      (material && !isLoadingLots && lots.length === 0
                        ? "La orden no tiene cantidades por devolver de este material."
                        : undefined)
                    }
                  />
                )}
              />
            )}
          />
        </Grid>
      )}

      {type === "OUT" && (
        <Grid item xs={12}>
          <Alert severity='info'>
            {isPackaging
              ? "El consumo extra se descuenta automáticamente del lote más antiguo (FIFO), a su costo real."
              : "El consumo extra se descuenta automáticamente del lote que vence primero (FEFO), a su costo real."}
          </Alert>
        </Grid>
      )}

      <Grid item xs={6}>
        <Controller
          name='quantity'
          control={control}
          rules={{ required: "Ingrese la cantidad", min: { value: 1, message: "Cantidad mínima 1" } }}
          render={({ field: { value, onChange }, fieldState: { error } }: any) => (
            <CustomTextField
              type='number'
              label={`Cantidad (${unit})`}
              value={value ?? ""}
              onChange={e => onChange(Number(e.target.value))}
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={6}>
        <Controller
          name='rack'
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }: any) => (
            <GroupedAutocomplete
              value={value}
              groups={warehouseList || []}
              getOptionLabel={(option: any) => option?.name || ""}
              groupOptionsKey='racks'
              onChange={(e: any, value: any) => {
                onChange(value);
              }}
              renderInput={(params: any) => (
                <CustomTextField
                  {...params}
                  label='Estante'
                  placeholder='Seleccione un estante'
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Controller
          name='observation'
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }: any) => (
            <CustomTextField
              label='Observación'
              value={value ?? ""}
              onChange={e => onChange(e.target.value)}
              multiline
              rows={3}
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
      </Grid>
    </>
  );
};

export default MaterialFormFields;
