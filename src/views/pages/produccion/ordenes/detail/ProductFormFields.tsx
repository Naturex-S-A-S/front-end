import type { FC } from "react";

import { Grid } from "@mui/material";

import { Controller, type Control, type FieldErrors } from "react-hook-form";

import CustomAutocomplete from "@/@core/components/mui/Autocomplete";
import CustomTextField from "@/@core/components/mui/TextField";
import GroupedAutocomplete from "@/@core/components/mui/GroupedAutocomplete";
import CustomDatePicker from "@/@core/components/react-datepicker";
import type { AdjustmentFormValues } from "./adjustment";

type Option = { id: number; label: string };

interface ProductFormFieldsProps {
  control: Control<AdjustmentFormValues>;
  errors: FieldErrors<AdjustmentFormValues>;
  productOptions: Option[];
  warehouseList: any[];
}

const ProductFormFields: FC<ProductFormFieldsProps> = ({ control, errors, productOptions, warehouseList }) => {
  return (
    <>
      <Grid item xs={12}>
        <Controller
          name='product'
          control={control}
          rules={{ required: "Seleccione un producto" }}
          render={({ field: { value, onChange }, fieldState: { error } }: any) => (
            <CustomAutocomplete
              value={value}
              options={productOptions}
              onChange={(e, v: any) => onChange(v)}
              renderInput={params => (
                <CustomTextField
                  {...params}
                  label='Producto'
                  placeholder='Seleccione producto'
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
          name='batch'
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }: any) => (
            <CustomTextField
              disabled
              label='Lote'
              value={value ?? ""}
              onChange={e => onChange(e.target.value)}
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6} lg={4}>
        <Controller
          name='rack'
          control={control}
          render={({ field: { value, onChange } }: any) => (
            <GroupedAutocomplete
              value={value}
              groups={warehouseList || []}
              getOptionLabel={(option: any) => option?.name || ""}
              groupOptionsKey='racks'
              onChange={(e: any, value: any) => {
                onChange(value);
              }}
              renderInput={(params: any) => (
                <CustomTextField {...params} label='Estante' placeholder='Seleccione un estante' />
              )}
            />
          )}
        />
      </Grid>

      <Grid item xs={6}>
        <Controller
          name='quantity'
          control={control}
          rules={{ required: "Debe ingresar la cantidad", min: { value: 1, message: "Cantidad mínima 1" } }}
          render={({ field: { value, onChange }, fieldState: { error } }: any) => (
            <CustomTextField
              type='number'
              label='Cantidad (g)'
              value={value ?? ""}
              onChange={e => onChange(Number(e.target.value))}
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={6}>
        <CustomDatePicker name='expiration_date_1' control={control} label='Fecha expiración 1' errors={errors.expiration_date_1} />
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

export default ProductFormFields;
