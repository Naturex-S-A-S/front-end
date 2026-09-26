import { useMemo } from "react";

import { Checkbox, FormControlLabel, Grid } from "@mui/material";

import { Controller, useFormContext, useWatch } from "react-hook-form";

import CustomAutocomplete from "@/@core/components/mui/Autocomplete";
import CustomButton from "@/@core/components/mui/Button";
import CustomTextField from "@/@core/components/mui/TextField";
import { mockCategoryTypes, mockLotFormats } from "@/utils/mocks";
import { CategoryType } from "@/utils/enum";

interface Props {
  isPending: boolean;
  isEdit?: boolean;
}

const Form = ({ isPending, isEdit = false }: Props) => {
  const {
    control,
    formState: { errors },
    register
  }: any = useFormContext();

  const typeWatch = useWatch({ control, name: "type" });

  const isFinishedProduct = useMemo(() => typeWatch?.id === CategoryType.FINISHED_PRODUCT, [typeWatch?.id]);

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={isEdit ? 12 : 6}>
        <CustomTextField
          {...register("name")}
          autoFocus
          fullWidth
          label='Nombre'
          placeholder='Ingrese el nombre'
          error={!!errors.name}
          helperText={errors.name?.message as string}
        />
      </Grid>
      {!isEdit && (
        <Grid item xs={12} md={6}>
          <Controller
            name='type'
            control={control}
            render={({ field: { value, onChange } }: any) => (
              <CustomAutocomplete
                value={value}
                options={mockCategoryTypes}
                onChange={(e, value: any) => {
                  onChange(value);
                }}
                renderInput={params => (
                  <CustomTextField
                    {...params}
                    label='Tipo'
                    placeholder='Seleccione un tipo'
                    error={!!errors.type}
                    helperText={errors.type?.id?.message as string}
                  />
                )}
              />
            )}
          />
        </Grid>
      )}

      {isFinishedProduct && (
        <>
          <Grid item xs={12} md={6}>
            <CustomTextField
              {...register("idIndicator")}
              fullWidth
              label='Indicativo de id'
              placeholder='Ingrese el indicativo (2 dígitos, ej: 20)'
              error={!!errors.idIndicator}
              helperText={errors.idIndicator?.message as string}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomTextField
              {...register("expirationMonths")}
              fullWidth
              type='number'
              label='Meses de vencimiento'
              placeholder='Ingrese los meses de vencimiento'
              error={!!errors.expirationMonths}
              helperText={errors.expirationMonths?.message as string}
            />
          </Grid>
        </>
      )}

      {typeWatch?.id === CategoryType.PACKAGING && (
        <>
          <Grid item xs={12} md={6}>
            <CustomTextField
              {...register("codeIndicator")}
              fullWidth
              label='Indicativo de código'
              placeholder='Ingrese el indicativo (1-4 caracteres, ej: ET)'
              error={!!errors.codeIndicator}
              helperText={errors.codeIndicator?.message as string}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Checkbox {...register("dependsOnProduct")} />}
              label='Depende del producto'
            />
          </Grid>
        </>
      )}

      {typeWatch?.id === CategoryType.LOT && (
        <Grid item xs={12} md={6}>
          <Controller
            name='lotFormat'
            control={control}
            render={({ field: { value, onChange } }: any) => (
              <CustomAutocomplete
                value={value}
                options={mockLotFormats}
                onChange={(e, value: any) => {
                  onChange(value);
                }}
                renderInput={params => (
                  <CustomTextField
                    {...params}
                    label='Formato de lote'
                    placeholder='Seleccione el formato de lote'
                    error={!!errors.lotFormat?.message}
                    helperText={errors.lotFormat?.message as string}
                  />
                )}
              />
            )}
          />
        </Grid>
      )}

      <Grid item xs={12} className='flex justify-center'>
        <CustomButton text='Guardar' type='submit' isLoading={isPending} />
      </Grid>
    </Grid>
  );
};

export default Form;
