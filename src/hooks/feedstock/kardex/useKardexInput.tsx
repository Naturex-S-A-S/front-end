import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { postKardexInput } from "@/api/feedstock";
import { alertMessageErrors } from "@/utils/messages";
import { revalidateOrdersSupply } from "@/api/order/actions";

const useKardexInput = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postKardexInput,
    onSuccess: () => {
      // La entrada cambia lo ingresado del aprovisionamiento: el detalle (cache del servidor) y el selector.
      void revalidateOrdersSupply();
      void queryClient.invalidateQueries({ queryKey: ["openSupplyOrders"] });
      toast.success("Entrada de materia prima registrada con éxito");
    },
    onError: (error: any) => {
      alertMessageErrors(error, "Error al registrar la entrada de materia prima");
    }
  });
};

export default useKardexInput;
