"use client";

import { useTransition } from "react";

import { Box, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import toast from "react-hot-toast";

import Header from "@/components/layout/detail/inventory/Header";
import Detail from "@/views/pages/produccion/ordenes/detail";
import NotFound from "@/views/NotFound";
import { updateOrderStatus } from "@/api/order/actions";
import type { IOrder } from "@/types/pages/order";
import Swal from "@/lib/swal";
import { STATUS } from "@/utils/constant";

type Props = {
  order: IOrder | null;
};

const OrderDetailClient = ({ order }: Props) => {
  const mode = useTheme().palette.mode;
  const [, startTransition] = useTransition();

  if (!order) {
    return <NotFound mode={mode} />;
  }

  const handleFinalize = () => {
    Swal.fire({
      title: "¿Estás seguro de que deseas finalizar la orden?",
      icon: "question",
      confirmButtonText: "Sí, finalizar"
    }).then(result => {
      if (result.isConfirmed) {
        startTransition(async () => {
          const res = await updateOrderStatus(order.id, "finalizada");

          if (res.success) {
            toast.success("Orden actualizada con éxito");
          } else {
            toast.error(res.error || "Error al actualizar la orden");
          }
        });
      }
    });
  };

  const handleCancel = () => {
    Swal.fire({
      title: "¿Estás seguro de que deseas cancelar la orden?",
      icon: "warning",
      confirmButtonText: "Sí, cancelar"
    }).then(result => {
      if (result.isConfirmed) {
        startTransition(async () => {
          const res = await updateOrderStatus(order.id, "cancelada");

          if (res.success) {
            toast.success("Orden actualizada con éxito");
          } else {
            toast.error(res.error || "Error al actualizar la orden");
          }
        });
      }
    });
  };

  return (
    <Box display='flex' flexDirection='column' gap={2}>
      <Header
        id={String(order.id)}
        name={order.formulationName}
        createdAt={order.dateCreated}
        actions={
          <>
            {order.status === STATUS.en_proceso && (
              <Button variant='contained' color='primary' onClick={handleFinalize}>
                Finalizar
              </Button>
            )}
            {order.status === STATUS.en_proceso && (
              <Button variant='outlined' color='error' onClick={handleCancel}>
                Cancelar
              </Button>
            )}
          </>
        }
      />
      <Detail order={order} />
    </Box>
  );
};

export default OrderDetailClient;
