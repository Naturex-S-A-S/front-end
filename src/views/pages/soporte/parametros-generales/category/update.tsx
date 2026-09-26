import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { categorySchema } from "@/utils/schemas/generalParameters";
import CustomDialog from "@/@core/components/mui/Dialog";
import Form from "./form";
import type { ICategory } from "@/types/pages/generalParameters";
import { alertMessageErrors } from "@/utils/messages";
import { putCategoryFeedstock } from "@/api/general-parameters/categories-feedstock";
import { CategoryType, categoryTypeIdByLabel } from "@/utils/enum";
import { putCategoryPackaging } from "@/api/general-parameters/categories-packaging";
import { putCategoryProduct } from "@/api/general-parameters/categories-product";
import { putCategoryLot } from "@/api/general-parameters/categories-lot";

interface Props {
  category: ICategory;
  open: boolean;
  toogleDialog: () => void;
}

const putCategoryByType = (data: any) => {
  switch (data.idType) {
    case CategoryType.FEEDSTOCK:
      return putCategoryFeedstock(data);
    case CategoryType.PACKAGING:
      return putCategoryPackaging(data);
    case CategoryType.LOT:
      return putCategoryLot(data.id, data);
    default:
      return putCategoryProduct(data);
  }
};

const Update = ({ open, toogleDialog, category }: Props) => {
  const queryClient = useQueryClient();

  const methods = useForm({
    defaultValues: {
      // En el listado, category.type es el NOMBRE; lo normalizamos al id numérico para que el
      // formulario (campos condicionales) y el schema validen igual que en create.
      name: category.name,
      type: { label: category.type, id: categoryTypeIdByLabel[category.type ?? ""] },
      idIndicator: category.idIndicator,
      expirationMonths: category.expirationMonths,
      codeIndicator: category.codeIndicator,
      dependsOnProduct: category.dependsOnProduct ?? false,
      lotFormat: category.lotFormat ? { id: category.lotFormat, label: category.lotFormat } : undefined
    },
    resolver: yupResolver(categorySchema)
  });

  const { handleSubmit, reset } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) => putCategoryByType(data),
    onSuccess: () => {
      toast.success("Categoria actualizada con éxito");
      queryClient.invalidateQueries({ queryKey: ["getCategories"] });
      queryClient.invalidateQueries({ queryKey: ["getCategoriesLot"] });
      toogleDialog();
      reset();
    },
    onError: (error: any) => {
      alertMessageErrors(error, "Error al actualizar la categoria");
    }
  });

  const onSubmit = (data: any) => {
    const payload: any = {
      id: category.categoryId,
      idType: data.type.id,
      name: data.name
    };

    if (data.type.id === CategoryType.FINISHED_PRODUCT) {
      payload.idIndicator = data.idIndicator;
      payload.expirationMonths = Number(data.expirationMonths);
    } else if (data.type.id === CategoryType.PACKAGING) {
      payload.codeIndicator = data.codeIndicator;
      payload.dependsOnProduct = !!data.dependsOnProduct;
    } else if (data.type.id === CategoryType.LOT) {
      payload.lotFormat = data.lotFormat?.id;
    }

    mutate(payload);
  };

  return (
    <CustomDialog open={open} toogleDialog={toogleDialog} title='Editar categoria' maxWidth='sm'>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Form isPending={isPending} isEdit />
        </form>
      </FormProvider>
    </CustomDialog>
  );
};

export default Update;
