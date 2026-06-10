"use client";
import { useEffect } from "react";

import { FormProvider, useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";

import CustomDialog from "@/@core/components/mui/Dialog";
import { putPackingProduct } from "@/api/packing";
import type { IProductPackaging } from "@/types/pages/product";
import { editPackagingSchema } from "@/utils/schemas/packing";
import Form from "@/views/pages/produccion/empaque/form";
import { alertMessageErrors } from "@/utils/messages";

type Props = {
  productId: string;
  productName: string;
  packagings: IProductPackaging[];
  open: boolean;
  toogleDialog: () => void;
};

const EditPackagingsDialog: React.FC<Props> = ({ productId, productName, packagings, open, toogleDialog }) => {
  const queryClient = useQueryClient();

  const methods = useForm({
    defaultValues: {
      details: packagings.map(item => ({
        packaging: { id: item.packaging.id, name: item.packaging.name },
        quantity: item.quantity
      }))
    },
    resolver: yupResolver(editPackagingSchema)
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (open) {
      reset({
        details: packagings.map(item => ({
          packaging: { id: item.packaging.id, name: item.packaging.name },
          quantity: item.quantity
        }))
      });
    }
  }, [open, packagings, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: putPackingProduct,
    onSuccess: () => {
      toast.success("Materiales de empaque actualizados con éxito");
      queryClient.invalidateQueries({ queryKey: ["getProduct", productId] });
      queryClient.invalidateQueries({ queryKey: ["getPackings"] });
      toogleDialog();
    },
    onError: (error: any) => {
      alertMessageErrors(error, "Error al actualizar los materiales de empaque");
    }
  });

  const onSubmit = (values: any) => {
    mutate({
      productId,
      packaging: values.details.map((detail: any) => ({
        id: detail.packaging.id,
        quantity: Number(detail.quantity)
      }))
    });
  };

  return (
    <CustomDialog open={open} toogleDialog={toogleDialog} title='Editar materiales de empaque' maxWidth='lg'>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Form isPending={isPending} productName={productName} />
        </form>
      </FormProvider>
    </CustomDialog>
  );
};

export default EditPackagingsDialog;
