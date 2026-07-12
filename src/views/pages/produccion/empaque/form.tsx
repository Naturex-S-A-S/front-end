"use client";

import { Alert, Button, FormHelperText, Grid, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

import { Controller, useFieldArray, useFormContext } from "react-hook-form";

import { Icon } from "@iconify/react";

import CustomTextField from "@/@core/components/mui/TextField";
import CustomAutocomplete from "@/@core/components/mui/Autocomplete";
import CustomButton from "@/@core/components/mui/Button";
import useGetProductList from "@/hooks/product/useGetProductList";
import useGetPackagingList from "@/hooks/packaging/useGetPackagingList";

type Props = {
  isPending: boolean;
  productName?: string;
};

const Form: React.FC<Props> = ({ isPending, productName }) => {
  const { productList } = useGetProductList();
  const { packagingList } = useGetPackagingList();

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
    append({ packaging: null, quantity: null });
  };

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Alert severity='info'>
          {productName ? (
            <span>
              Editando materiales de empaque para: <b>{productName}</b>
            </span>
          ) : (
            <span>Seleccione el producto y los materiales de empaque requeridos con sus cantidades</span>
          )}
        </Alert>
      </Grid>

      {productName ? (
        <Grid item xs={12} md={6}>
          <CustomTextField label='Producto' value={productName} InputProps={{ readOnly: true }} fullWidth />
        </Grid>
      ) : (
        <Grid item xs={12} md={6}>
          <Controller
            name='product'
            control={control}
            render={({ field: { value, onChange } }: any) => (
              <CustomAutocomplete
                value={value}
                options={productList}
                getOptionLabel={(option: any) => option?.completeName || option?.name || ""}
                onChange={(e: any, value: any) => {
                  onChange(value);
                }}
                renderInput={(params: any) => (
                  <CustomTextField
                    {...params}
                    label='Producto'
                    placeholder='Seleccione un producto'
                    error={!!errors.product}
                    helperText={errors.product?.message as string}
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
              <TableCell align='center'>Material de empaque</TableCell>
              <TableCell align='center'>Cantidad</TableCell>
              <TableCell align='center'>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((row, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Controller
                    control={control}
                    name={`details.${index}.packaging`}
                    render={({ field: { value, onChange } }: any) => (
                      <CustomAutocomplete
                        value={value}
                        options={packagingList || []}
                        getOptionLabel={(option: any) => option?.name || ""}
                        onChange={(e: any, value: any) => {
                          onChange(value);
                        }}
                        renderInput={(params: any) => (
                          <CustomTextField
                            {...params}
                            label=''
                            placeholder='Seleccione un material'
                            error={!!errors.details?.[index]?.packaging}
                            helperText={errors.details?.[index]?.packaging?.message as string}
                          />
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
        {errors.details && Array.isArray(errors.details) && (
          <FormHelperText error>{errors.details.map((detail: any) => detail?.message)}</FormHelperText>
        )}
        {errors?.details?.root && <FormHelperText error>{errors.details.root?.message}</FormHelperText>}
      </Grid>

      <Grid item xs={12} className='flex justify-center'>
        <CustomButton text='Guardar' type='submit' isLoading={isPending} />
      </Grid>
    </Grid>
  );
};

export default Form;
