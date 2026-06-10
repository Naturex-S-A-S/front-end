"use client";
import { useState } from "react";

import { Box } from "@mui/material";

import { FormProvider, useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";

import CreateButton from "@/components/layout/shared/CreateButton";
import { useAbility } from "@/hooks/casl/useAbility";
import CustomDialog from "@/@core/components/mui/Dialog";
import Form from "./form";
import { packingSchema } from "@/utils/schemas/packing";
import { packingDefaultValues } from "@/utils/defaultValues/packing";
import { ABILITY_ACTIONS, ABILITY_FIELDS, ABILITY_SUBJECT } from "@/utils/constant";
import { alertMessageErrors } from "@/utils/messages";
import { postPacking } from "@/api/packing";

const Create = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const ability = useAbility();

  const canCreatePacking = ability.can(
    ABILITY_ACTIONS.CREATE as any,
    ABILITY_SUBJECT.PRODUCTION,
    ABILITY_FIELDS.FORMULATION
  );

  const toogleDialog = () => {
    setOpen(!open);
  };

  const methods = useForm({
    defaultValues: packingDefaultValues,
    resolver: yupResolver(packingSchema)
  });

  const { handleSubmit, reset } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: postPacking,
    onSuccess: () => {
      toast.success("Empaque creado con éxito");
      queryClient.invalidateQueries({ queryKey: ["getPackings"] });
      reset();
      toogleDialog();
    },
    onError: (error: any) => {
      alertMessageErrors(error, "Error al crear el empaque");
    }
  });

  const onSubmit = (values: any) => {
    const req = {
      productId: values.product.id,
      packaging: values.details.map((detail: any) => ({
        id: detail.packaging.id,
        quantity: detail.quantity
      }))
    };

    mutate(req);
  };

  if (!canCreatePacking) return null;

  return (
    <Box>
      <CreateButton onClick={toogleDialog} />

      <CustomDialog open={open} toogleDialog={toogleDialog} title='Crear Empaque' maxWidth='lg'>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Form isPending={isPending} />
          </form>
        </FormProvider>
      </CustomDialog>
    </Box>
  );
};

export default Create;
