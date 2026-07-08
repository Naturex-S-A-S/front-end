import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from "@mui/material";

import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { Icon } from "@iconify/react";

import CustomTextField from "@/@core/components/mui/TextField";
import CustomAutocomplete from "@/@core/components/mui/Autocomplete";
import CustomButton from "@/@core/components/mui/Button";
import useGetFeedstockList from "@/hooks/feedstock/useGetFeedstockList";
import useGetProductList from "@/hooks/product/useGetProductList";

type Props = {
  isPending: boolean;
  isNewVersion?: boolean;
};

const Form: React.FC<Props> = ({ isPending, isNewVersion = false }) => {
  const { productList } = useGetProductList();
  const { feedstockList } = useGetFeedstockList();

  const {
    register,
    formState: { errors },
    control
  }: any = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "details"
  });

  const handleAddDetail = () => {
    append({ material: null, quantity: null });
  };

  const watchedDetails = useWatch({ control, name: "details" });

  const totalQuantity = watchedDetails?.reduce((sum: number, row: any) => sum + (Number(row?.quantity) || 0), 0) || 0;

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Alert severity='info'>
          <span>
            Fórmula base para producir <b>100 gramos</b>
          </span>
        </Alert>
      </Grid>

      {!isNewVersion && (
        <Grid item xs={12} md={6}>
          <CustomTextField
            {...register("name")}
            autoFocus
            fullWidth
            label='Nombre'
            placeholder='Ingrese un nombre para la fórmula'
            error={!!errors.name}
            helperText={errors.name?.message as string}
          />
        </Grid>
      )}

      <Grid item xs={12} md={6}>
        <CustomTextField
          {...register("comment")}
          autoFocus
          fullWidth
          label='Comentario'
          placeholder='Ingrese un comentario para la fórmula'
          error={!!errors.comment}
          helperText={errors.comment?.message as string}
        />
      </Grid>

      {!isNewVersion && (
        <Grid item xs={12} md={6}>
          <Controller
            name='products'
            control={control}
            render={({ field: { value, onChange } }: any) => (
              <CustomAutocomplete
                value={value}
                multiple
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

                    // error={!!errors.products?.[0]?.id}
                    // helperText={errors.products?.[0]?.id?.message}
                  />
                )}
              />
            )}
          />
        </Grid>
      )}

      <Grid item xs={12} className='flex justify-center'>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align='center'>Material</TableCell>
              <TableCell align='center'>Cantidad (g)</TableCell>
              <TableCell align='center'>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Controller
                    {...register(`details.${index}.material`)}
                    control={control}
                    render={({ field: { value, onChange } }: any) => (
                      <CustomAutocomplete
                        value={value}
                        options={feedstockList || []}
                        onChange={(e, value: any) => {
                          onChange(value);
                        }}
                        renderInput={params => (
                          <CustomTextField {...params} label='' placeholder='Seleccione un material' />
                        )}
                      />
                    )}
                  />
                </TableCell>
                <TableCell align='center'>
                  <CustomTextField
                    {...register(`details.${index}.quantity`)}
                    placeholder='Ingrese una cantidad'
                    error={!!errors.details?.[index]?.quantity}
                    helperText={errors.details?.[index]?.quantity?.message as string}
                    type='number'
                    className='w-40'
                  />
                </TableCell>
                <TableCell>
                  <div className='flex justify-center gap-2'>
                    <Button variant='outlined' color='error' size='small' onClick={() => remove(index)}>
                      <Icon icon='mdi:trash-can-outline' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={3}>
                <Button variant='text' color='primary' onClick={handleAddDetail} startIcon={<Icon icon='mdi:plus' />}>
                  Agregar material
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Grid>

      <Grid item xs={12}>
        <Alert
          severity={
            totalQuantity === 0 ? "info" : totalQuantity === 100 ? "success" : totalQuantity < 100 ? "warning" : "error"
          }
          icon={
            totalQuantity === 0 ? undefined : (
              <Icon
                icon={
                  totalQuantity === 100 ? "mdi:check-circle" : totalQuantity < 100 ? "mdi:alert" : "mdi:close-circle"
                }
              />
            )
          }
        >
          {totalQuantity === 0 ? (
            <span>
              Fórmula base para producir <b>100 gramos</b>
            </span>
          ) : (
            <span>
              Total de materiales: <b>{totalQuantity.toFixed(2)} (g)</b> / <b>100.00 (g)</b>
            </span>
          )}
        </Alert>
      </Grid>

      {isNewVersion && (
        <Grid item xs={12} md={6}>
          <FormControlLabel control={<Checkbox {...register("active")} />} label='Activar esta versión' />
        </Grid>
      )}

      <Grid item xs={12}>
        {errors.details && Array.isArray(errors.details) && (
          <FormHelperText error>{errors.details.map((detail: any) => detail?.message)}</FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} className='flex justify-center'>
        <CustomButton text='Guardar' type='submit' isLoading={isPending} disabled={totalQuantity !== 100} />
      </Grid>
    </Grid>
  );
};

export default Form;
