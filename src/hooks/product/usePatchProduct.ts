import { useMutation, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";

import { patchProduct, putActivateProduct, putDeactivateProduct } from "@/api/product";
import { alertMessageErrors } from "@/utils/messages";
import Swal from "@/lib/swal";

const usePatchProduct = () => {
  const queryClient = useQueryClient();

  const updateCache = () => {
    queryClient.invalidateQueries({ queryKey: ["getProducts"] });
    queryClient.invalidateQueries({ queryKey: ["getProduct"] });
    toast.success("Producto actualizado con éxito");
  };

  const mutation = useMutation({
    mutationFn: ({ id, data }: any) => patchProduct(id, data),
    onSuccess: () => {
      updateCache();
    },
    onError: (error: any) => {
      alertMessageErrors(error, "Error al actualizar el producto");
    }
  });

  const { mutateAsync: activate, isPending: isPendingActivate } = useMutation({
    mutationFn: putActivateProduct,
    onSuccess: () => {
      updateCache();
    }
  });

  const { mutateAsync: deactivate, isPending: isPendingDeactivate } = useMutation({
    mutationFn: putDeactivateProduct,
    onSuccess: () => {
      updateCache();
    }
  });

  const handleStatus = (id: string, name: string, active: boolean, validate = true) => {
    if (validate) {
      Swal.fire({
        title: `¿Estás seguro de ${active ? "desactivar" : "activar"} "${name}"?`,
        icon: "warning",
        confirmButtonText: active ? "Desactivar" : "Activar"
      }).then(result => {
        if (result.isConfirmed) {
          if (active) {
            deactivate(id);
          } else {
            activate(id);
          }
        }
      });
    } else {
      if (active) {
        deactivate(id);
      } else {
        activate(id);
      }
    }
  };

  return {
    ...mutation,
    isPendingStatus: isPendingActivate || isPendingDeactivate,
    handleStatus
  };
};

export default usePatchProduct;
