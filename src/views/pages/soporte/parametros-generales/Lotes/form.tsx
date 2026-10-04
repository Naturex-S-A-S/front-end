"use client";

import { Grid } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

import CustomButton from "@/@core/components/mui/Button";
import CustomTextField from "@/@core/components/mui/TextField";
import CustomAutocomplete from "@/@core/components/mui/Autocomplete";
import { mockLotFormats } from "@/utils/mocks";

interface Props {
  isPending: boolean;
}

const Form = ({ isPending }: Props) => {
  const {
    register,
    formState: { errors },
    control
  }: any = useFormContext();

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <CustomTextField
          {...register("name")}
          autoFocus
          fullWidth
          label='Nombre'
          placeholder='Ingrese el nombre'
          error={!!errors.name}
          helperText={errors.name?.message}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name='lotFormat'
          control={control}
          render={({ field: { value, onChange } }: any) => (
            <CustomAutocomplete
              value={value}
              options={mockLotFormats}
              onChange={(_, value: any) => {
                onChange(value);
              }}
              renderInput={params => (
                <CustomTextField
                  {...params}
                  label='Formato de lote'
                  placeholder='Seleccione el formato de lote'
                  error={!!errors.lotFormat?.id}
                  helperText={errors.lotFormat?.id?.message}
                />
              )}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} className='flex justify-center'>
        <CustomButton text='Guardar' type='submit' isLoading={isPending} />
      </Grid>
    </Grid>
  );
};

export default Form;
