"use client";

import { Alert } from "@mui/material";

import type { IOpenSupplyOrder } from "@/types/pages/order";
import { supplyPending } from "@/utils/supplyProgress";

import { formatQuantity } from "./SupplyOrderField";

const EPSILON = 1e-6;

export type SupplyIncoming =
  | { kind: "pending"; pendingAfter: number }
  | { kind: "overDelivery"; excess: number };

/**
 * Efecto de la cantidad que se está ingresando sobre la orden elegida: lo que quedará pendiente, o lo que excede lo
 * pendiente (sobre-entrega). null si no hay orden o cantidad.
 */
export const supplyIncoming = (
  selected: IOpenSupplyOrder | null | undefined,
  incomingQuantity?: number
): SupplyIncoming | null => {
  if (!selected || !incomingQuantity || incomingQuantity <= 0) return null;
  const excess = incomingQuantity - selected.quantityPending;

  if (excess > EPSILON) return { kind: "overDelivery", excess };

  return {
    kind: "pending",
    pendingAfter: supplyPending(selected.quantityTotal, selected.quantityReceived + incomingQuantity)
  };
};

interface Props {
  incoming: SupplyIncoming;

  /** Unidad de las cantidades del aprovisionamiento: "g" para MP y "und" para ME. */
  unitLabel: string;
}

/**
 * Mensaje a todo el ancho arriba de los campos del formulario, para que su aparición no cambie el alto de las filas.
 * En verde lo que quedará pendiente; en amarillo la sobre-entrega (que no bloquea el registro).
 */
const SupplyIncomingAlert = ({ incoming, unitLabel }: Props) =>
  incoming.kind === "overDelivery" ? (
    <Alert severity='warning'>
      La cantidad supera lo pendiente de la orden en {formatQuantity(incoming.excess, unitLabel)}. Se registrará como
      sobre-entrega.
    </Alert>
  ) : (
    <Alert severity='success'>Después de esta entrada: {formatQuantity(incoming.pendingAfter, unitLabel)} pendiente</Alert>
  );

export default SupplyIncomingAlert;
