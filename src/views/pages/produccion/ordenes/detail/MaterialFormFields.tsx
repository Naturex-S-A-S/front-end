import type { FC } from "react";

import { Grid, MenuItem } from "@mui/material";

import { Controller, type Control, type FieldErrors } from "react-hook-form";

import CustomAutocomplete from "@/@core/components/mui/Autocomplete";
import CustomTextField from "@/@core/components/mui/TextField";
import GroupedAutocomplete from "@/@core/components/mui/GroupedAutocomplete";
import CustomDatePicker from "@/@core/components/react-datepicker";
import type { AdjustmentFormValues } from "./adjustment";

type Option = { id: number; label: string };

interface MaterialFormFieldsProps {
  control: Control<AdjustmentFormValues>;
  errors: FieldErrors<AdjustmentFormValues>;
  materialOptions: Option[];
  warehouseList: any[];
}

const MaterialFormFields: FC<MaterialFormFieldsProps> = ({ control, errors, materialOptions, warehouseList }) => {
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
              <MenuItem value='IN'>Entrada</MenuItem>
              <MenuItem value='OUT'>Salida</MenuItem>
            </CustomTextField>
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

      <Grid item xs={6}>
        <Controller
          name='quantity'
          control={control}
          rules={{ required: "Ingrese la cantidad", min: { value: 1, message: "Cantidad mínima 1" } }}
          render={({ field: { value, onChange }, fieldState: { error } }: any) => (
            <CustomTextField
              type='number'
              label='Cantidad'
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

      <Grid item xs={12} md={6} lg={4}>
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
