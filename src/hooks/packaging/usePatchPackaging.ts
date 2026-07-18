import { useRouter } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";

import { patchPackaging } from "@/api/packaging";
import { alertMessageErrors } from "@/utils/messages";
import Swal from "@/lib/swal";

const usePatchPackaging = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: any) => patchPackaging(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getPackaging"] });
      router.refresh();
      toast.success("Material de empaque actualizado con éxito");
    },
    onError: (error: any) => {
      alertMessageErrors(error, "Error al actualizar el material de empaque");
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

export default usePatchPackaging;
