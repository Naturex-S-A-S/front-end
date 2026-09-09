import { useCallback, useEffect, useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  Alert
} from "@mui/material";

import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";

import moment from "moment";

import { useMutation } from "@tanstack/react-query";

import MetricCardGroup from "@/@core/components/mui/MetricCardGroup";

import MaterialTable from "./MaterialTable";

import CustomTextField from "@/@core/components/mui/TextField";
import CustomAutocomplete from "@/@core/components/mui/Autocomplete";
import CustomButton from "@/@core/components/mui/Button";
import useGetProductList from "@/hooks/product/useGetProductList";
import CustomDatePicker from "@/@core/components/react-datepicker";
import { getProductsRelated } from "@/api/product";
import { MaterialTypeKey } from "@/utils/enum";

type Props = {
  isPending: boolean;
  isChanged: boolean;
  setIsChanged: (value: boolean) => void;
  orderCalculate: () => Promise<boolean>;
  isPendingOrderCalculate: boolean;
};

type Product = {
  id: string | number;
  fullName?: string;
  [k: string]: any;
};

type Presentation = {
  id: string;
  fullName?: string;
  quantityG?: number | string;
  [k: string]: any;
};

const LoaderInfo = () => (
  <>
    <Skeleton variant='rectangular' width='100%' height={30} sx={{ borderRadius: "8px" }} />
    <Skeleton variant='rectangular' width='100%' height={30} sx={{ borderRadius: "8px" }} />
    <Skeleton variant='rectangular' width='100%' height={30} sx={{ borderRadius: "8px" }} />
    <Skeleton variant='rectangular' width='100%' height={30} sx={{ borderRadius: "8px" }} />
    <Skeleton variant='rectangular' width='100%' height={30} sx={{ borderRadius: "8px" }} />
    <Skeleton variant='rectangular' width='100%' height={30} sx={{ borderRadius: "8px" }} />
  </>
);

const Form: React.FC<Props> = ({
  isPending: isPendingCreate,
  isChanged,
  setIsChanged,
  orderCalculate,
  isPendingOrderCalculate
}) => {
  const [step, setStep] = useState<number>(0);

  const { productList } = useGetProductList();

  const {
    register,
    formState: { errors },
    control,
    reset,
    trigger,
    setValue,
    getValues
  }: any = useFormContext();

  const { mutateAsync: mutateProductsRelated, isPending: isPendingProductsRelated } = useMutation({
    mutationFn: getProductsRelated
  });

  const { fields, replace } = useFieldArray({
    control,
    name: "presentations"
  });

  const productWatch = useWatch({ control, name: "product" });
  const calculatedData = useWatch({ control, name: "calculatedData" });

  const handleContinue = useCallback(async () => {
    const result = await trigger("presentations");

    if (result) {
      const success = await orderCalculate();

      success ? setStep(2) : setStep(1);
    }
  }, [orderCalculate, setStep, trigger]);

  const handleChangeQuantity = (newValue: string, index: number) => {
    const oldValue = getValues(`presentations.${index}.quantityG`);

    if (newValue !== oldValue) setIsChanged(true);
  };

  useEffect(() => {
    if (productWatch?.id) {
      mutateProductsRelated(productWatch.id).then((res: Presentation[] = []) => {
        replace(res);
        setStep(1);
      });
    } else {
      setStep(0);
      reset();
      replace([]);
    }
  }, [mutateProductsRelated, replace, productWatch?.id, reset]);

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={4}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display='flex' flexDirection='column' gap={4}>
                  <Controller
                    name='product'
                    control={control}
                    render={({ field: { value, onChange } }: any) => (
                      <CustomAutocomplete
                        value={value}
                        options={productList}
                        getOptionLabel={(option: Product) => option?.fullName || ""}
                        onChange={(_, v: Product | null) => onChange(v)}
                        renderInput={(params: any) => (
                          <CustomTextField {...params} label='Elegir producto' placeholder='Seleccione un producto' />
                        )}
                      />
                    )}
                  />

                  <Divider />

                  {isPendingProductsRelated || isPendingOrderCalculate ? (
                    <LoaderInfo />
                  ) : (
                    (step === 1 || step === 2) && (
                      <>
                        <Typography variant='h5'>Presentaciones</Typography>
                        {fields.map((presentation: Presentation, index: number) => (
                          <CustomTextField
                            key={presentation.id}
                            {...register(`presentations.${index}.quantityG`)}
                            type='number'
                            autoComplete='off'
                            onBlur={e => {
                              handleChangeQuantity(e.target.value, index);
                            }}
                            onChange={e => {
                              const value = e.target.value;

                              handleChangeQuantity(value, index);

                              setValue(`presentations.${index}.quantityG`, value);
                            }}
                            fullWidth
                            label={`${presentation.fullName}`}
                            placeholder='Ingrese las unidades a producir'
                            error={!!errors?.presentations?.[index]?.quantityG}
                          />
                        ))}

                        {(step === 1 || isChanged) && <CustomButton text='Calcular' onClick={handleContinue} />}

                        {step === 2 && (
                          <>
                            <Divider />
                            <CustomDatePicker
                              control={control}
                              minDate={moment().add(1, "day").toDate()}
                              name='expirationDate1'
                              label='Fecha de vencimiento'
                              errors={errors?.expirationDate1?.message}
                            />
                            <CustomButton
                              text='Generar orden'
                              type='submit'
                              disabled={isChanged}
                              isLoading={isPendingCreate}
                            />
                          </>
                        )}
                      </>
                    )
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12} md={8}>
        {isPendingProductsRelated || isPendingOrderCalculate ? (
          <>
            <Skeleton variant='rectangular' width='100%' height={90} sx={{ borderRadius: "8px", marginBottom: 4 }} />
            <Skeleton variant='rectangular' width='100%' height={200} sx={{ borderRadius: "8px", marginBottom: 4 }} />
            <Skeleton variant='rectangular' width='100%' height={200} sx={{ borderRadius: "8px" }} />
          </>
        ) : (
          <Grid container spacing={4}>
            {calculatedData?.message && step === 2 && (
              <Grid item xs={12}>
                <Alert severity={calculatedData?.totalQuantityMissing === 0 ? "success" : "warning"}>
                  {calculatedData.message}
                </Alert>
              </Grid>
            )}

            {step === 2 && (
              <Grid item xs={12}>
                <MetricCardGroup
                  items={[
                    {
                      icon: "mdi:weight-kilogram",
                      label: "Cantidad a producir (Kg)",
                      value: calculatedData?.totalQuantityInKg ?? "-"
                    },
                    {
                      icon: "mdi:check-circle-outline",
                      label: "Cantidad disponible (Kg)",
                      value: calculatedData?.totalQuantityPossible ?? "-"
                    },
                    {
                      icon: "mdi:package-variant-closed",
                      label: "Total unidades m. de empaque",
                      value: calculatedData?.totalQuantityMaterialPackaging ?? "-"
                    },
                    {
                      icon: "mdi:flask-outline",
                      label: "Total materia prima (g)",
                      value: calculatedData?.totalQuantityMaterialByOrder ?? "-"
                    }
                  ]}
                />
              </Grid>
            )}

            {step !== 2 ? (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={4} sx={{ textAlign: "center" }}>
                            Ingrese las cantidades de las presentaciones
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </Grid>
            ) : (
              <>
                <Grid item md={12} lg={6}>
                  <MaterialTable
                    title='Material de empaque'
                    type={MaterialTypeKey.PACKAGING}
                    items={calculatedData?.materials}
                  />
                </Grid>
                <Grid item md={12} lg={6}>
                  <MaterialTable
                    title='Materia prima'
                    type={MaterialTypeKey.FEEDSTOCK}
                    items={calculatedData?.materials}
                    quantityLabel='Cantidad (g)'
                  />
                </Grid>
              </>
            )}

            {/*step === 2 && (
              <Grid item xs={12}>
                <Card>
                  <CardHeader title='Ajustes' />
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                      <Button variant='contained' color='success'>
                        <Icon icon='tabler:plus' />
                      </Button>
                      <Button variant='contained' color='warning'>
                        <Icon icon='tabler:minus' />
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )*/}
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

export default Form;
