import { Controller, useForm, useWatch } from "react-hook-form";

import { Alert, Grid, MenuItem } from "@mui/material";

import { yupResolver } from "@hookform/resolvers/yup";

import CustomAutocomplete from "@/@core/components/mui/Autocomplete";
import CustomTextField from "@/@core/components/mui/TextField";
import {
  outputAdjustmentFeedstockSchema,
  outputDiscardFeedstockSchema,
  outputProductionFeedstockSchema
} from "@/utils/schemas/inventory/output";
import { mockUnitWeight } from "@/utils/mocks";
import CustomButton from "@/@core/components/mui/Button";
import { useAbility } from "@/hooks/casl/useAbility";
import useKardexOutput from "@/hooks/feedstock/kardex/useKardexOutput";
import useGetFeedstockLots from "@/hooks/feedstock/kardex/useGetFeedstockLots";
import useGetOrders from "@/hooks/order/useGetOrders";
import { ABILITY_FIELDS, ABILITY_SUBJECT } from "@/utils/constant";
import useGetFeedstockList from "@/hooks/feedstock/useGetFeedstockList";
import { formatDate } from "@/utils/format";
import type { IFeedstockBatch, OutputType } from "@/types/pages/inventory";
import { OUTPUT_TYPE_OPTIONS } from "@/types/pages/inventory";

const SCHEMAS = {
  produccion: outputProductionFeedstockSchema,
  ajuste: outputAdjustmentFeedstockSchema,
  descarte: outputDiscardFeedstockSchema
};

const emptyValues = (type: OutputType) => ({
  type,
  material: null,
  order: null,
  lot: null,
  quantity: "",
  unit: null,
  observation: ""
});

const lotLabel = (lot: IFeedstockBatch) =>
  `${lot.batch} · venció ${formatDate(lot.expirationDate)} · saldo ${lot.currentQuantityG} g`;

/**
 * Salida de materia prima desde el listado. El tipo de salida decide los campos obligatorios
 * y el endpoint: producción (FEFO, sin orden), ajuste (FEFO, con orden) o descarte (un lote vencido).
 */
const Output = () => {
  const { mutateAsync, isPending } = useKardexOutput();
  const { feedstockList } = useGetFeedstockList();
  const { orders } = useGetOrders({ status: "en_proceso" });

  const ability = useAbility();

  const canReadSalidas = ability.can("create", ABILITY_SUBJECT.FEEDSTOCK, ABILITY_FIELDS.SALIDAS);

  const methods = useForm<any>({
    defaultValues: emptyValues("produccion"),
    mode: "onBlur",
    resolver: (data, context, options) => yupResolver(SCHEMAS[data.type as OutputType] as any)(data, context, options as any)
  });

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
    reset,
    setValue
  } = methods;

  const type: OutputType = useWatch({ control, name: "type" });
  const material = useWatch({ control, name: "material" });

  const { lots, isLoading: isLoadingLots } = useGetFeedstockLots(type === "descarte" ? material?.id : undefined);

  const orderOptions = orders.map(o => ({ id: o.orderId, label: o.batch }));

  const onSubmit = (values: any) => {
    const base = { idMaterial: values.material.id, observation: values.observation || undefined };

    const data =
      type === "ajuste"
        ? { ...base, idOrder: values.order.id, quantity: Number(values.quantity) }
        : type === "descarte"
          ? { ...base, idLot: values.lot.id, quantity: Number(values.quantity), unit: values.unit.value }
          : { ...base, quantity: Number(values.quantity), unit: values.unit.value };

    mutateAsync({ type, data })
      .then(() => reset(emptyValues(type)))
      .catch(() => undefined); // el error ya lo muestra el onError del hook
  };

  const errorMessage = (field: string) => (errors as any)?.[field]?.message as string | undefined;

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} lg={3}>
            <Controller
              name='type'
              control={control}
              render={({ field: { value } }) => (
                <CustomTextField
                  select
                  fullWidth
                  label='Tipo de salida'
                  value={value}
                  onChange={e => reset(emptyValues(e.target.value as OutputType))}
                >
                  {OUTPUT_TYPE_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </CustomTextField>
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Controller
              name='material'
              control={control}
              render={({ field: { value, onChange } }: any) => (
                <CustomAutocomplete
                  value={value}
                  options={feedstockList || []}
                  onChange={(e, value: any) => {
                    onChange(value);
                    setValue("lot", null);
                  }}
                  renderInput={params => (
                    <CustomTextField
                      {...params}
                      label='Materia prima'
                      placeholder='Seleccione una materia prima'
                      error={!!errors.material}
                      helperText={(errors as any)?.material?.id?.message ?? errorMessage("material")}
                    />
                  )}
                />
              )}
            />
          </Grid>

          {type === "ajuste" && (
            <Grid item xs={12} sm={6} lg={3}>
              <Controller
                name='order'
                control={control}
                render={({ field: { value, onChange } }: any) => (
                  <CustomAutocomplete
                    value={value}
                    options={orderOptions}
                    isOptionEqualToValue={(option: any, v: any) => option.id === v?.id}
                    onChange={(e, value: any) => onChange(value)}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        label='Orden en proceso'
                        placeholder='Seleccione la orden'
                        error={!!errors.order}
                        helperText={errorMessage("order")}
                      />
                    )}
                  />
                )}
              />
            </Grid>
          )}

          {type === "descarte" && (
            <Grid item xs={12} sm={6} lg={3}>
              <Controller
                name='lot'
                control={control}
                render={({ field: { value, onChange } }: any) => (
                  <CustomAutocomplete
                    value={value}
                    options={lots}
                    loading={isLoadingLots}
                    disabled={!material}
                    getOptionLabel={(option: any) => lotLabel(option)}
                    isOptionEqualToValue={(option: any, v: any) => option.id === v?.id}
                    noOptionsText='Esta materia prima no tiene lotes vencidos con saldo'
                    onChange={(e, value: any) => onChange(value)}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        label='Lote vencido'
                        placeholder={material ? "Seleccione el lote" : "Seleccione primero la materia prima"}
                        error={!!errors.lot}
                        helperText={errorMessage("lot")}
                      />
                    )}
                  />
                )}
              />
            </Grid>
          )}

          {type !== "ajuste" && (
            <Grid item xs={12} sm={6} lg={2}>
              <Controller
                name='unit'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomAutocomplete
                    value={value}
                    options={mockUnitWeight}
                    onChange={(e, value: any) => {
                      onChange(value);
                    }}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        label='Unidad de medida'
                        placeholder='Seleccione una unidad de medida'
                        error={!!errors.unit}
                        helperText={(errors as any)?.unit?.value?.message ?? errorMessage("unit")}
                      />
                    )}
                  />
                )}
              />
            </Grid>
          )}

          <Grid item xs={12} sm={6} lg={type === "ajuste" ? 3 : 2}>
            <CustomTextField
              {...register("quantity")}
              fullWidth
              label={type === "ajuste" ? "Cantidad (g)" : "Cantidad"}
              placeholder='Ingrese la cantidad'
              error={!!errors.quantity}
              helperText={errorMessage("quantity")}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomTextField
              {...register("observation")}
              fullWidth
              multiline
              rows={2}
              label={type === "produccion" ? "Observación (opcional)" : "Observación"}
              placeholder={
                type === "descarte"
                  ? "Justifique el descarte del lote vencido"
                  : type === "ajuste"
                    ? "Justifique el ajuste de la orden"
                    : "Ingrese una observación"
              }
              error={!!errors.observation}
              helperText={errorMessage("observation")}
            />
          </Grid>

          <Grid item xs={12}>
            <Alert severity='info'>
              {type === "descarte"
                ? "El descarte saca del inventario solo el lote vencido seleccionado, sin asociarlo a una orden."
                : "El sistema descuenta automáticamente del lote que vence primero (FEFO). Los lotes vencidos no se consumen."}
            </Alert>
          </Grid>

          <Grid item xs={12} className='flex flex-col justify-center text-center'>
            {canReadSalidas ? (
              <div className='mt-4'>
                <CustomButton
                  className='mr-2 px-4 py-2 text-white rounded d-flex align-middle'
                  isLoading={isPending}
                  type='submit'
                >
                  Registrar
                </CustomButton>
              </div>
            ) : (
              <div className='mt-4 text-red-500'>No tienes permisos para registrar movimientos de materia prima.</div>
            )}
          </Grid>
        </Grid>
      </form>
    </div>
  );
};

export default Output;
