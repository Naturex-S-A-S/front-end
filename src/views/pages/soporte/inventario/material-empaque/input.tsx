import { Controller, useForm, useWatch } from "react-hook-form";

import { Grid } from "@mui/material";

import { yupResolver } from "@hookform/resolvers/yup";

import CustomButton from "@/@core/components/mui/Button";
import { useAbility } from "@/hooks/casl/useAbility";
import CustomAutocomplete from "@/@core/components/mui/Autocomplete";
import CustomTextField from "@/@core/components/mui/TextField";
import DatePickerWrapper from "@/@core/styles/libs/react-datepicker";
import { kardexPackagingInputSchema } from "@/utils/schemas/inventory/input";
import useKardexInput from "@/hooks/packaging/kardex/useKardexInput";
import { ABILITY_FIELDS, ABILITY_SUBJECT } from "@/utils/constant";
import useGetPackagingList from "@/hooks/packaging/useGetPackagingList";
import useGetProvidersList from "@/hooks/provider/useGetProvidersList";
import GroupedAutocomplete from "@/@core/components/mui/GroupedAutocomplete";
import useGetWarehouseList from "@/hooks/warehouse/useGetWarehouse";
import useGetOpenSupplyOrders from "@/hooks/order/useGetOpenSupplyOrders";
import SupplyOrderField from "../supply-order/SupplyOrderField";
import SupplyIncomingAlert, { supplyIncoming } from "../supply-order/SupplyIncomingAlert";

const Input = () => {
  const { mutateAsync, isPending } = useKardexInput();
  const { packagingList } = useGetPackagingList();
  const { providersList } = useGetProvidersList();
  const { warehouseList } = useGetWarehouseList();
  const ability = useAbility();

  const canReadEntradas = ability.can("create", ABILITY_SUBJECT.PACKAGING, ABILITY_FIELDS.ENTRADAS);
  const canReadListado = ability.can("read", ABILITY_SUBJECT.PACKAGING, ABILITY_FIELDS.LISTADO);

  const methods = useForm({
    defaultValues: {
      material: undefined,
      provider: undefined,
      quantity: undefined,
      charge: undefined,
      document: undefined,
      batch: undefined,
      rack: undefined,
      supplyOrder: undefined
    },
    mode: "onBlur",
    resolver: yupResolver(kardexPackagingInputSchema)
  });

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
    reset,
    setValue
  } = methods;

  const [material, quantity, supplyOrder] = useWatch({
    control,
    name: ["material", "quantity", "supplyOrder"]
  }) as any[];

  const { openOrders, isLoading: isLoadingOpenOrders } = useGetOpenSupplyOrders(material?.id, "packaging");
  const noOpenOrders = !!material?.id && !isLoadingOpenOrders && openOrders.length === 0;
  const incomingUnits = Number(quantity) > 0 ? Number(quantity) : 0;
  const incoming = supplyIncoming(supplyOrder, incomingUnits);

  const onSubmit = (values: any) => {
    const req = {
      idPackaging: values.material.id,
      idProvider: values.provider.id,
      quantity: Number(values.quantity),
      charge: Number(values.charge),
      document: values.document,
      internalLot: values.batch,
      idRack: values.rack?.id,
      idSupplyOrder: values.supplyOrder?.orderId
    };

    mutateAsync(req).then(() => {
      reset();
    });
  };

  return (
    <div>
      <DatePickerWrapper>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            {incoming && (
              <Grid item xs={12}>
                <SupplyIncomingAlert incoming={incoming} unitLabel='und' />
              </Grid>
            )}

            <Grid item xs={12} md={6} lg={4}>
              <Controller
                name='material'
                control={control}
                render={({ field: { value, onChange } }: any) => (
                  <CustomAutocomplete
                    value={value}
                    options={packagingList || []}
                    onChange={(e, value: any) => {
                      onChange(value);

                      // La orden depende del material: se limpia cuando cambia.
                      setValue("supplyOrder", undefined as any);
                    }}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        label='Material de empaque'
                        placeholder='Seleccione un material de empaque'
                        error={!!errors.material?.id}
                        helperText={errors.material?.id?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Controller
                name='provider'
                control={control}
                render={({ field: { value, onChange } }: any) => (
                  <CustomAutocomplete
                    value={value}
                    options={providersList || []}
                    onChange={(e, value: any) => {
                      onChange(value);
                    }}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        label='Proveedor'
                        placeholder='Seleccione un proveedor'
                        error={!!errors.provider?.id}
                        helperText={errors.provider?.id?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <SupplyOrderField
                control={control}
                options={openOrders}
                isLoading={isLoadingOpenOrders}
                materialSelected={!!material?.id}
                unitLabel='und'
                errorMessage={(errors.supplyOrder as any)?.message || (errors.supplyOrder as any)?.orderId?.message}
              />
            </Grid>

            <Grid item xs={12} md={6} lg={2}>
              <CustomTextField
                {...register("batch")}
                fullWidth
                label='Lote'
                placeholder='Ingrese el lote'
                error={!!errors.batch}
                helperText={errors.batch?.message}
              />
            </Grid>

            <Grid item xs={12} md={6} lg={2}>
              <CustomTextField
                {...register("document")}
                fullWidth
                label='Documento'
                placeholder='Ingrese el documento'
                error={!!errors.document}
                helperText={errors.document?.message}
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
                      <CustomTextField
                        {...params}
                        label='Estante'
                        placeholder='Seleccione un estante'
                        error={!!errors.rack?.id}
                        helperText={errors.rack?.id?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6} lg={2}>
              <CustomTextField
                {...register("quantity")}
                fullWidth
                type='number'
                inputProps={{ min: 1, step: 1 }}
                label='Cantidad'
                placeholder='Ingrese la cantidad'
                error={!!errors.quantity}
                helperText={errors.quantity?.message}
              />
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <CustomTextField
                {...register("charge")}
                fullWidth
                type='number'
                inputProps={{ min: 0, step: "any" }}
                label='Valor total'
                placeholder='Ingrese el valor total'
                error={!!errors.charge}
                helperText={errors.charge?.message}
              />
            </Grid>

            <Grid item xs={12} className='flex justify-center'>
              {!canReadListado && (
                <div className='mt-4 text-red-500'>No tienes permisos para ver el listado de material de empaque.</div>
              )}

              {canReadEntradas ? (
                <div className='mt-4'>
                  {canReadEntradas && (
                    <CustomButton
                      className='mr-2 px-4 py-2 text-white rounded d-flex align-middle'
                      isLoading={isPending}
                      disabled={noOpenOrders}
                      type='submit'
                    >
                      Registrar
                    </CustomButton>
                  )}
                </div>
              ) : (
                <div className='mt-4 text-red-500'>
                  No tienes permisos para registrar movimientos de material de empaque.
                </div>
              )}
            </Grid>
          </Grid>
        </form>
      </DatePickerWrapper>
    </div>
  );
};

export default Input;
