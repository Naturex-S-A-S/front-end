import { Grid } from "@mui/material";

import { Controller, useFormContext, useWatch } from "react-hook-form";

import CustomButton from "@/@core/components/mui/Button";
import CustomTextField from "@/@core/components/mui/TextField";
import useGetCategory from "@/hooks/packaging/useGetCategory";
import useGetProductList from "@/hooks/product/useGetProductList";
import CustomAutocomplete from "@/@core/components/mui/Autocomplete";

type Props = {
  isPending: boolean;
  isEdit?: boolean;
};

const Form: React.FC<Props> = ({ isPending }) => {
  const { categories } = useGetCategory();
  const { productList } = useGetProductList();

  const {
    register,
    formState: { errors },
    control
  }: any = useFormContext();

  const categoryWatch = useWatch({ control, name: "category" });

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
                  error={!!errors.category?.message}
                  helperText={errors.category?.message}
                />
              )}
            />
          )}
        />
      </Grid>
      {categoryWatch?.dependsOnProduct === true && (
        <Grid item xs={12} md={6}>
          <Controller
            name='productCode'
            control={control}
            render={({ field: { value, onChange } }: any) => (
              <CustomAutocomplete
                value={value ?? null}
                options={productList}
                getOptionLabel={(option: any) => option?.fullName || option?.name || ""}
                onChange={(e, value: any) => {
                  onChange(value);
                }}
                renderInput={params => (
                  <CustomTextField
                    {...params}
                    label='Producto'
                    placeholder='Seleccione un producto'
                    error={!!errors.productCode?.id}
                    helperText={errors.productCode?.id?.message}
                  />
                )}
              />
            )}
          />
        </Grid>
      )}
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
      <Grid item xs={12} md={6}>
        <CustomTextField
          {...register("color")}
          autoFocus
          fullWidth
          label='Color'
          placeholder='Ingrese el color'
          error={!!errors.color}
          helperText={errors.color?.message}
        />
      </Grid>

      <Grid item xs={12} className='flex justify-center'>
        <CustomButton text='Guardar' type='submit' isLoading={isPending} />
      </Grid>
    </Grid>
  );
};

export default Form;
