import { useMutation, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";

import { FormProvider, useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";

import { useAbility } from "@/hooks/casl/useAbility";
import CustomCard from "@/@core/components/mui/Card";
import { ABILITY_ACTIONS, ABILITY_FIELDS, ABILITY_SUBJECT } from "@/utils/constant";
import { categorySchema } from "@/utils/schemas/generalParameters";
import Form from "./form";
import { alertMessageErrors } from "@/utils/messages";
import { postCategoryFeedstock } from "@/api/general-parameters/categories-feedstock";
import { postCategoryPackaging } from "@/api/general-parameters/categories-packaging";
import { postCategoryProduct } from "@/api/general-parameters/categories-product";
import { postCategoryLot } from "@/api/general-parameters/categories-lot";
import { CategoryType } from "@/utils/enum";

const postCategoryByType = (data: any) => {
  switch (data.idType) {
    case CategoryType.FEEDSTOCK:
      return postCategoryFeedstock(data);
    case CategoryType.PACKAGING:
      return postCategoryPackaging(data);
    case CategoryType.LOT:
      return postCategoryLot(data);
    default:
      return postCategoryProduct(data);
  }
};

const Create = () => {
  const queryClient = useQueryClient();
  const ability = useAbility();

  const methods = useForm({
    defaultValues: {
      name: undefined,
      type: undefined,
      dependsOnProduct: false
    },
    resolver: yupResolver(categorySchema)
  });

  const { handleSubmit, reset } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (variables: any) => postCategoryByType(variables),
    onSuccess: () => {
      toast.success("Categoria creada con éxito");
      queryClient.invalidateQueries({ queryKey: ["getCategories"] });
      queryClient.invalidateQueries({ queryKey: ["getCategoriesLot"] });
      reset();
    },
    onError: (error: any) => {
      alertMessageErrors(error, "Error al crear la categoria");
    }
  });

  if (!ability.can(ABILITY_ACTIONS.CREATE as any, ABILITY_SUBJECT.GENERAL_PARAMETERS, ABILITY_FIELDS.CATEGORIES))
    return null;

  const onSubmit = (data: any) => {
    const payload: any = {
      name: data.name,
      idType: data.type.id
    };

    if (data.type.id === CategoryType.FINISHED_PRODUCT) {
      payload.idIndicator = data.idIndicator;
      payload.expirationMonths = Number(data.expirationMonths);
    } else if (data.type.id === CategoryType.PACKAGING) {
      payload.codeIndicator = data.codeIndicator;
      payload.dependsOnProduct = !!data.dependsOnProduct;
    } else if (data.type.id === CategoryType.LOT) {
      payload.lotFormat = data.lotFormat.id;
    }

    mutate(payload);
  };

  return (
    <CustomCard title='Crear Categoria'>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Form isPending={isPending} />
        </form>
      </FormProvider>
    </CustomCard>
  );
};

export default Create;
