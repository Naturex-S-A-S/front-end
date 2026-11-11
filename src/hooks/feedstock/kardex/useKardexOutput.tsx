import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { postKardexOutput, postKardexOutputAdjustment, postKardexOutputDiscard } from "@/api/feedstock";
import type { OutputType } from "@/types/pages/inventory";
import { alertMessageErrors } from "@/utils/messages";

const SUCCESS_MESSAGES: Record<OutputType, string> = {
  produccion: "Salida de materia prima registrada con éxito",
  ajuste: "Ajuste de salida de materia prima registrado con éxito",
  descarte: "Descarte de materia prima registrado con éxito"
};

/** Registra una salida de materia prima en el endpoint de su tipo (producción, ajuste o descarte). */
const useKardexOutput = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, data }: { type: OutputType; data: any }) => {
      if (type === "descarte") return postKardexOutputDiscard(data);
      if (type === "ajuste") return postKardexOutputAdjustment(data);

      return postKardexOutput(data);
    },
    onSuccess: (_, { type }) => {
      toast.success(SUCCESS_MESSAGES[type]);
      queryClient.invalidateQueries({ queryKey: ["feedstockLots"] });
      queryClient.invalidateQueries({ queryKey: ["getFeedstock"] });
    },
    onError: (error: any) => {
      alertMessageErrors(error, "Error al registrar la salida de materia prima");
    }
  });
};

export default useKardexOutput;
