"use client";
import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";

import CustomDataGrid from "@/@core/components/mui/DataGrid";
import Create from "./create";
import { useColumns } from "@/utils/columns/category";
import { getCategories } from "@/api/general-parameters";
import type { ICategory } from "@/types/pages/generalParameters";
import Update from "./update";
import swal from "@/lib/swal";
import { alertMessageErrors } from "@/utils/messages";
import { CategoryTypeName } from "@/utils/enum";
import { deleteCategoryFeedstock } from "@/api/general-parameters/categories-feedstock";
import { deleteCategoryPackaging } from "@/api/general-parameters/categories-packaging";
import { deleteCategoryProduct } from "@/api/general-parameters/categories-product";

const Category = () => {
  const queryClient = useQueryClient();

  const [updateData, setUpdateData] = useState<{ open: boolean; category: ICategory | undefined }>({
    open: false,
    category: undefined
  });

  const { data } = useQuery<ICategory[]>({
    queryKey: ["getCategories"],
    queryFn: getCategories
  });

  const { mutate: deleteCategory } = useMutation({
    mutationFn: (variables: any) => {
      return variables.idType === CategoryTypeName.FEEDSTOCK
        ? deleteCategoryFeedstock(variables.id)
        : variables.idType === CategoryTypeName.PACKAGING
          ? deleteCategoryPackaging(variables.id)
          : deleteCategoryProduct(variables.id);
    },
    onSuccess: () => {
      toast.success("Categoria eliminada con éxito");
      queryClient.invalidateQueries({ queryKey: ["getCategories"] });
    },
    onError: (error: any) => {
      alertMessageErrors(error, "Error al eliminar la categoria");
    }
  });

  const toogleDialog = () => {
    setUpdateData({
      open: false,
      category: undefined
    });
  };

  const handleEdit = (category: ICategory) => {
    setUpdateData({
      category,
      open: true
    });
  };

  const handleDelete = (category: ICategory) => {
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
          deleteCategory({
            idType: category.type,
            id: category.categoryId
          });
        }
      });
  };

  const colDefs = useColumns({ handleEdit, handleDelete });

  return (
    <div className='flex flex-col items-center gap-2'>
      {updateData.category && (
        <Update open={updateData.open} toogleDialog={toogleDialog} category={updateData.category} />
      )}
      <Create />
      <div className='w-full'>
        <CustomDataGrid
          columns={colDefs}
          data={data?.map((category, index) => ({
            ...category,
            categoryId: category.id,
            id: index
          }))}
        />
      </div>
      {/*<Grid container spacing={2}>
        {data?.map((category: any) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Paper elevation={2} className='p-4'>
              <ListItem
                secondaryAction={
                  <div className='flex gap-1'>
                    <Icon icon='mdi:pencil-outline' />
                    <Icon icon='mdi:delete-outline' />
                  </div>
                }
              >
                <ListItemText primary={category.name} secondary={category.typeName} />
              </ListItem>
            </Paper>
          </Grid>
        ))}

        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={2} className='w-full p-4'>
            <List>
              {data?.map((category: any) => (
                <ListItem
                  key={category.id}
                  secondaryAction={
                    <div className='flex gap-1'>
                      <Icon icon='mdi:pencil-outline' />
                      <Icon icon='mdi:delete-outline' />
                    </div>
                  }
                >
                  <Icon icon='mdi:circle' />
                  <ListItemText primary={category.name} secondary={category.typeName} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>*/}
    </div>
  );
};

export default Category;
