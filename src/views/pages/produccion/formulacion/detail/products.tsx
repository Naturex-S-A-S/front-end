import { useRouter } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Icon } from "@iconify/react";

import { IconButton, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import toast from "react-hot-toast";

import { deleteProductFromFormulation } from "@/api/formulation";
import type { IProduct } from "@/types/pages/formulation";
import { formatDate } from "@/utils/format";
import swal from "@/lib/swal";

interface Props {
  products: IProduct[];
  formulationId: number;
}

const Products = ({ products, formulationId }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: (productId: string) => deleteProductFromFormulation(formulationId, productId),
    onSuccess: () => {
      toast.success("Producto eliminado con éxito");
      queryClient.invalidateQueries({
        queryKey: ["getFormulationById", formulationId]
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Error al eliminar el producto");
    }
  });

  const handleViewDetail = (productId: string) => {
    router.push(`/inventario/producto-terminado/detail/${productId}`);
  };

  const handleDelete = (productId: string) => {
    swal
      .fire({
        title: "¿Estás seguro?",
        text: "No podrás deshacer esta acción",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
      })
      .then(result => {
        if (result.isConfirmed) {
          mutate(productId);
        }
      });
  };

  return (
    <List>
      {products.map(product => (
        <ListItem
          key={product.id}
          disablePadding
          secondaryAction={
            <IconButton edge='end' aria-label='Eliminar' onClick={() => handleDelete(product.idFinalProduct)}>
              <Icon icon='mdi:delete' />
            </IconButton>
          }
        >
          <ListItemButton onClick={() => handleViewDetail(product.idFinalProduct)}>
            <ListItemText
              primary={product.finalProduct.name}
              secondary={`Fecha asignada: ${formatDate(product.dateAssigned.toString())}`}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default Products;
