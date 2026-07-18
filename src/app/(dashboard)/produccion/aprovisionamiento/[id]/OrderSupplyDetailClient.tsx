"use client";

import { useTransition } from "react";

import { Box, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import toast from "react-hot-toast";

import Header from "@/components/layout/detail/inventory/Header";
import Detail from "@/views/pages/produccion/aprovisionamiento/detail";
import NotFound from "@/views/NotFound";
import { updateOrderSupplyStatus } from "@/api/order/actions";
import type { IOrderSupply } from "@/types/pages/order";
import Swal from "@/lib/swal";
import { STATUS } from "@/utils/constant";

type Props = {
  orderSupply: IOrderSupply | null;
};

const OrderSupplyDetailClient = ({ orderSupply }: Props) => {
  const mode = useTheme().palette.mode;
  const [, startTransition] = useTransition();

  if (!orderSupply) {
    return <NotFound mode={mode} />;
  }

  const handleFinalize = () => {
    Swal.fire({
      title: "¿Estás seguro de que deseas finalizar la orden de aprovisionamiento?",
      icon: "question",
      confirmButtonText: "Sí, finalizar"
    }).then(result => {
      if (result.isConfirmed) {
        startTransition(async () => {
          const res = await updateOrderSupplyStatus(orderSupply.id, "finalizada");

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
      title: "¿Estás seguro de que deseas cancelar la orden de aprovisionamiento?",
      icon: "warning",
      confirmButtonText: "Sí, cancelar"
    }).then(result => {
      if (result.isConfirmed) {
        startTransition(async () => {
          const res = await updateOrderSupplyStatus(orderSupply.id, "cancelada");

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
        id={String(orderSupply.id)}
        name={orderSupply.batch}
        createdAt={orderSupply.dateCreated}
        actions={
          <>
            {orderSupply.status === STATUS.en_proceso && (
              <Button variant='contained' color='primary' onClick={handleFinalize}>
                Finalizar
              </Button>
            )}
            {orderSupply.status === STATUS.en_proceso && (
              <Button variant='outlined' color='error' onClick={handleCancel}>
                Cancelar
              </Button>
            )}
          </>
        }
      />
      <Detail orderSupply={orderSupply} />
    </Box>
  );
};

export default OrderSupplyDetailClient;
