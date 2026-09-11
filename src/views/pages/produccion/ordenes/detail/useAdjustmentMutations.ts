import { useCallback } from "react";

import { useRouter } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";

import moment from "moment";

import {
  postKardexInputAdjustment as postKardexInputAdjustmentFeedStock,
  postKardexOutputAdjustment as postKardexOutputAdjustmentFeedStock
} from "@/api/feedstock";
import {
  postKardexInputAdjustment as postKardexInputAdjustmentPackaging,
  postKardexOutputAdjustment as postKardexOutputAdjustmentPackaging
} from "@/api/packaging";
import { postKardexInputAdjustment as postKardexInputAdjustmentProduct } from "@/api/product";
import { alertMessageErrors } from "@/utils/messages";
import { MaterialTypeKey } from "@/utils/enum";

interface UseAdjustmentMutationsProps {
  orderId: number;
  isCategoryMaterial: boolean;
  isCategoryPackaging: boolean;
  isCategoryProduct: boolean;
  onReset: (value?: any) => void;
  onClose: () => void;
}

export const useAdjustmentMutations = ({
  orderId,
  isCategoryMaterial,
  isCategoryPackaging,
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

  const { mutate: mutateInput, isPending: isPendingInputFeedStock } = useMutation({
    mutationFn: (variables: any) =>
      variables.type === MaterialTypeKey.FEEDSTOCK
        ? postKardexInputAdjustmentFeedStock(variables)
        : postKardexInputAdjustmentPackaging(variables),
    onSuccess,
    onError
  });

  const { mutate: mutateOutput, isPending: isPendingOutput } = useMutation({
    mutationFn: (variables: any) =>
      variables.type === MaterialTypeKey.FEEDSTOCK
        ? postKardexOutputAdjustmentFeedStock(variables)
        : postKardexOutputAdjustmentPackaging(variables),
    onSuccess,
    onError
  });

  const isPending = isPendingInputProduct || isPendingInputFeedStock || isPendingOutput;

  const submitAdjustment = useCallback(
    (values: any) => {
      if (isCategoryMaterial || isCategoryPackaging) {
        const payload = {
          idMaterial: values.material?.id,
          idPackaging: values.material?.id,
          idOrder: orderId,
          quantity: values.quantity,
          batch: values.batch,
          expirationDate1: isCategoryPackaging
            ? null
            : values.expiration_date_1
              ? moment(values.expiration_date_1).format("YYYY-MM-DD")
              : null,
          observation: values.observation,
          idRack: values.rack?.id,
          type: values.material?.type
        };

        if (values.type === "IN") {
          mutateInput(payload);
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
    [isCategoryMaterial, isCategoryProduct, isCategoryPackaging, orderId, mutateInput, mutateOutput, mutateInputProduct]
  );

  return { submitAdjustment, isPending };
};
