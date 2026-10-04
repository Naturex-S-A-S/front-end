"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import CustomCard from "@/@core/components/mui/Card";
import Form from "./form";
import { postCategoryLot } from "@/api/general-parameters/categories-lot";
import { alertMessageErrors } from "@/utils/messages";

const schema = yup
  .object({
    name: yup.string().required("El nombre es requerido"),
    lotFormat: yup
      .object({
        id: yup.string().required("El formato de lote es requerido"),
        label: yup.string().optional()
      })
      .required("El formato de lote es requerido")
  })
  .required();

const Create = () => {
  const queryClient = useQueryClient();

  const methods = useForm({
    defaultValues: {
      name: "",
      lotFormat: undefined
    },
    resolver: yupResolver(schema)
  });

  const { handleSubmit, reset } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) => postCategoryLot(data),
    onSuccess: () => {
      toast.success("Categoría de lote creada con éxito");
      queryClient.invalidateQueries({ queryKey: ["getCategoriesLot"] });
      reset();
    },
    onError: (error: any) => {
      alertMessageErrors(error, "Error al crear la categoría de lote");
    }
  });

  const onSubmit = (data: any) => {
    mutate({
      name: data.name,
      lotFormat: data.lotFormat.id
    });
  };

  return (
    <CustomCard title='Crear categoría de lote'>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Form isPending={isPending} />
        </form>
      </FormProvider>
    </CustomCard>
  );
};

export default Create;
