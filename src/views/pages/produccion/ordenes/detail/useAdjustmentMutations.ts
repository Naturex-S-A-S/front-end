import { useCallback } from "react";

import { useRouter } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";

import moment from "moment";

import {
  postKardexInputAdjustment as postKardexInputAdjustmentFeedStock,
  postKardexOutputAdjustment
} from "@/api/feedstock";
import { postKardexInputAdjustment as postKardexInputAdjustmentProduct } from "@/api/product";
import { alertMessageErrors } from "@/utils/messages";

interface UseAdjustmentMutationsProps {
  orderId: number;
  isCategoryMaterial: boolean;
  isCategoryProduct: boolean;
  onReset: (value?: any) => void;
  onClose: () => void;
}

export const useAdjustmentMutations = ({
  orderId,
  isCategoryMaterial,
  isCategoryProduct,
  onReset,
  onClose
}: UseAdjustmentMutationsProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const onSuccess = () => {
    onReset();
    onClose();
    queryClient.invalidateQueries({ queryKey: ["getOrderById", Number(orderId)] });
    toast.success("Ajuste registrado correctamente");
    router.refresh();
  };

  const onError = (error: any) => {
    alertMessageErrors(error, "Error al registrar el ajuste");
  };

  const { mutate: mutateInputProduct, isPending: isPendingInputProduct } = useMutation({
    mutationFn: postKardexInputAdjustmentProduct,
    onSuccess,
    onError
  });

  const { mutate: mutateInputFeedStock, isPending: isPendingInputFeedStock } = useMutation({
    mutationFn: postKardexInputAdjustmentFeedStock,
    onSuccess,
    onError
  });

  const { mutate: mutateOutput, isPending: isPendingOutput } = useMutation({
    mutationFn: postKardexOutputAdjustment,
    onSuccess,
    onError
  });

  const isPending = isPendingInputProduct || isPendingInputFeedStock || isPendingOutput;

  const submitAdjustment = useCallback(
    (values: any) => {
      if (isCategoryMaterial) {
        const payload = {
          idMaterial: values.material?.id,
          idOrder: orderId,
          quantity: values.quantity,
          batch: values.batch,
          expirationDate1: moment(values.expiration_date_1).format("YYYY-MM-DD"),
          observation: values.observation,
          idRack: values.rack?.id
        };

        if (values.type === "IN") {
          mutateInputFeedStock(payload);
        } else if (values.type === "OUT") {
          mutateOutput(payload);
        }
      } else if (isCategoryProduct) {
        const payload = {
          idOrder: orderId,
          idFinalProduct: values.product?.id,
          batch: values.batch,
          quantity: values.quantity,
          observation: values.observation,
          expirationDate1: moment(values.expiration_date_1).format("YYYY-MM-DD"),
          idRack: values.rack?.id
        };

        mutateInputProduct(payload);
      }
    },
    [isCategoryMaterial, isCategoryProduct, orderId, mutateInputFeedStock, mutateOutput, mutateInputProduct]
  );

  return { submitAdjustment, isPending };
};
