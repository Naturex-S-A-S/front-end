"use client";

import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Alert, Box, Chip, Typography } from "@mui/material";

import CustomAutocomplete from "@/@core/components/mui/Autocomplete";
import CustomTextField from "@/@core/components/mui/TextField";
import type { IOpenSupplyOrder } from "@/types/pages/order";
import { formatDate } from "@/utils/format";
import { supplyPending } from "@/utils/supplyProgress";

export type SupplyOrderOption = IOpenSupplyOrder & { id: number };

interface Props {
  control: Control<any>;
  options: IOpenSupplyOrder[];
  isLoading: boolean;

  /** Hay un material elegido. Sin material el campo queda deshabilitado. */
  materialSelected: boolean;

  /** Unidad de las cantidades del aprovisionamiento: "g" para MP y "und" para ME. */
  unitLabel: string;

  /** Cantidad de esta entrada en la unidad del aprovisionamiento, para el aviso de sobre-entrega. */
  incomingQuantity?: number;
  errorMessage?: string;
}

const numberFormat = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2 });

export const formatQuantity = (value: number, unitLabel: string) => `${numberFormat.format(value)} ${unitLabel}`;

export const supplyOrderOptionLabel = (option: IOpenSupplyOrder | null | undefined, unitLabel: string) => {
  if (!option) return "";
  const pending = option.quantityPending > 0 ? `Pendiente: ${formatQuantity(option.quantityPending, unitLabel)}` : "Completo";

  return `${option.batch} · ${formatDate(option.dateCreated)} · ${pending}`;
};

/** CustomAutocomplete compara opciones por id; el backend devuelve orderId. */
export const toSupplyOrderOptions = (orders: IOpenSupplyOrder[]): SupplyOrderOption[] =>
  orders.map(order => ({ ...order, id: order.orderId }));

/**
 * Selector obligatorio de la orden de aprovisionamiento de una entrada normal de MP o ME, con el avance de la
 * orden elegida y el aviso (que no bloquea) de sobre-entrega.
 */
const SupplyOrderField = ({
  control,
  options,
  isLoading,
  materialSelected,
  unitLabel,
  incomingQuantity,
  errorMessage
}: Props) => {
  const noOpenOrders = materialSelected && !isLoading && options.length === 0;

  return (
    <Controller
      name='supplyOrder'
      control={control}
      render={({ field: { value, onChange } }) => {
        const selected = value as SupplyOrderOption | undefined;
        const incoming = incomingQuantity && incomingQuantity > 0 ? incomingQuantity : 0;
        const excess = selected ? incoming - selected.quantityPending : 0;

        return (
          <Box className='flex flex-col gap-2'>
            <CustomAutocomplete
              value={selected ?? null}
              options={toSupplyOrderOptions(options)}
              loading={isLoading}
              disabled={!materialSelected || noOpenOrders}
              getOptionLabel={(option: any) => supplyOrderOptionLabel(option, unitLabel)}
              onChange={(e, option: any) => onChange(option ?? undefined)}
              noOptionsText='Sin órdenes en proceso'
              renderInput={params => (
                <CustomTextField
                  {...params}
                  label='Orden de aprovisionamiento'
                  placeholder={materialSelected ? "Seleccione una orden" : "Seleccione primero el material"}
                  error={!!errorMessage}
                  helperText={errorMessage}
                />
              )}
            />

            {noOpenOrders && (
              <Alert severity='error'>No hay órdenes de aprovisionamiento en proceso para este material.</Alert>
            )}

            {selected && (
              <Box className='flex flex-wrap items-center gap-x-4 gap-y-1'>
                <Typography variant='body2'>
                  Total: <strong>{formatQuantity(selected.quantityTotal, unitLabel)}</strong>
                </Typography>
                <Typography variant='body2'>
                  Ingresado: <strong>{formatQuantity(selected.quantityReceived, unitLabel)}</strong>
                </Typography>
                <Typography variant='body2'>
                  Pendiente: <strong>{formatQuantity(selected.quantityPending, unitLabel)}</strong>
                </Typography>
                {incoming > 0 && (
                  <Chip
                    size='small'
                    variant='tonal'
                    color='primary'
                    label={`Después de esta entrada: ${formatQuantity(
                      supplyPending(selected.quantityTotal, selected.quantityReceived + incoming),
                      unitLabel
                    )} pendiente`}
                  />
                )}
              </Box>
            )}

            {selected && excess > 1e-6 && (
              <Alert severity='warning'>
                La cantidad supera lo pendiente de la orden en {formatQuantity(excess, unitLabel)}. Se registrará como
                sobre-entrega.
              </Alert>
            )}
          </Box>
        );
      }}
    />
  );
};

export default SupplyOrderField;
