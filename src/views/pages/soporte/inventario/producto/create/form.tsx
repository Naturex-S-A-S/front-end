import { Grid } from "@mui/material";

import { Controller, useFormContext } from "react-hook-form";

import CustomButton from "@/@core/components/mui/Button";
import CustomTextField from "@/@core/components/mui/TextField";
import CustomAutocomplete from "@/@core/components/mui/Autocomplete";
import useGetProductUnit from "@/hooks/product/useGetProductUnit";
import useGetCategory from "@/hooks/product/useGetCategory";
import useGetLotCategory from "@/hooks/product/useGetLotCategory";

type Props = {
  isPending: boolean;
  isEdit?: boolean;
};

const Form: React.FC<Props> = ({ isPending }) => {
  const { categories } = useGetCategory();
  const { units } = useGetProductUnit();
  const { lotCategories } = useGetLotCategory();

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
          name='category'
          control={control}
          render={({ field: { value, onChange } }: any) => (
            <CustomAutocomplete
              value={value}
              options={categories}
              onChange={(e, value: any) => {
                onChange(value);
              }}
              renderInput={params => (
                <CustomTextField
                  {...params}
                  label='Categoria'
                  placeholder='Seleccione una categoria'
                  error={!!errors.category?.id?.message}
                  helperText={errors.category?.id?.message}
                />
              )}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name='lotCategory'
          control={control}
          render={({ field: { value, onChange } }: any) => (
            <CustomAutocomplete
              value={value}
              options={lotCategories}
              onChange={(e, value: any) => {
                onChange(value);
              }}
              renderInput={params => (
                <CustomTextField
                  {...params}
                  label='Categoría de lote'
                  placeholder='Seleccione la categoría de lote'
                  error={!!errors.lotCategory?.id?.message}
                  helperText={errors.lotCategory?.id?.message}
                />
              )}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name='unit'
          control={control}
          render={({ field: { value, onChange } }: any) => (
            <CustomAutocomplete
              value={value}
              options={units}
              onChange={(e, value: any) => {
                onChange(value);
              }}
              renderInput={params => (
                <CustomTextField
                  {...params}
                  label='Unidad'
                  placeholder='Seleccione una unidad'
                  error={!!errors.unit}
                  helperText={errors.unit?.id?.message}
                />
              )}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CustomTextField
          {...register("measurement")}
          autoFocus
          fullWidth
          label='Medida'
          placeholder='Ingrese la medida'
          error={!!errors.measurement}
          helperText={errors.measurement?.message}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CustomTextField
          {...register("minimumStandard")}
          autoFocus
          fullWidth
          type='number'
          label='Stock mínimo'
          placeholder='Ingrese el stock minimo'
          error={!!errors.minimumStandard}
          helperText={errors.minimumStandard?.message}
        />
      </Grid>

      <Grid item xs={12} className='flex justify-center'>
        <CustomButton text='Guardar' type='submit' isLoading={isPending} />
      </Grid>
    </Grid>
  );
};

export default Form;
