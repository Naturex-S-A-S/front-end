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
    mutationFn: (data: any) =>
      data.idType === CategoryTypeName.FEEDSTOCK ? putCategoryFeedstock(data) : putCategoryPackaging(data),
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
      id: category.id,
      name: data.name,
      idType: data.type.id
    });
  };

  return (
    <CustomDialog open={open} toogleDialog={toogleDialog} title='Editar categoria'>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Form isPending={isPending} />
        </form>
      </FormProvider>
    </CustomDialog>
  );
};

export default Update;
