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
import { CategoryTypeName } from "@/utils/enum";
import { putCategoryPackaging } from "@/api/general-parameters/categories-packaging";
import { putCategoryProduct } from "@/api/general-parameters/categories-product";

interface Props {
  category: ICategory;
  open: boolean;
  toogleDialog: () => void;
}

const Update = ({ open, toogleDialog, category }: Props) => {
  const queryClient = useQueryClient();

  const methods = useForm({
    defaultValues: {
      name: category.name,
      type: { label: category.type, id: category.type }
    },
    resolver: yupResolver(categorySchema)
  });

  const { handleSubmit, reset } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) => {
      return data.idType === CategoryTypeName.FEEDSTOCK
        ? putCategoryFeedstock(data)
        : data.idType === CategoryTypeName.PACKAGING
          ? putCategoryPackaging(data)
          : putCategoryProduct(data);
    },
    onSuccess: () => {
      toast.success("Categoria actualizada con éxito");
      queryClient.invalidateQueries({ queryKey: ["getCategories"] });
      toogleDialog();
      reset();
    },
    onError: (error: any) => {
      alertMessageErrors(error, "Error al actualizar la categoria");
    }
  });

  const onSubmit = (data: any) => {
    mutate({
      id: category.categoryId,
      idType: data.type.id,
      name: data.name
    });
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
