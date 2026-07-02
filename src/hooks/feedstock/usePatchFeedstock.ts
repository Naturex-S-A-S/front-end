import { useMutation, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";

import { patchFeedstock } from "@/api/feedstock";
import { alertMessageErrors } from "@/utils/messages";
import Swal from "@/lib/swal";

const usePatchFeedstock = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: any) => patchFeedstock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getFeedstock"] });
      toast.success("Materia prima actualizado con éxito");
    },
    onError: (error: any) => {
      alertMessageErrors(error, "Error al actualizar la materia prima");
    }
  });

  const handleActive = (id: string, name: string, active: boolean, validate = true) => {
    if (validate) {
      Swal.fire({
        title: `¿Estás seguro de ${active ? "desactivar" : "activar"} "${name}"?`,
        icon: "warning",
        confirmButtonText: active ? "Desactivar" : "Activar"
      }).then(result => {
        if (result.isConfirmed) {
          mutation.mutateAsync({
            id,
            data: { active: !active }
          });
        }
      });
    } else {
      mutation.mutateAsync({
        id,
        data: { active: !active }
      });
    }
  };

  return {
    ...mutation,
    handleActive
  };
};

export default usePatchFeedstock;
