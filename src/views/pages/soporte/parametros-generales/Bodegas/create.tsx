"use client";

import { useTransition } from "react";

import { useRouter } from "next/navigation";

import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";

import CustomCard from "@/@core/components/mui/Card";
import { useAbility } from "@/hooks/casl/useAbility";
import { ABILITY_ACTIONS, ABILITY_FIELDS, ABILITY_SUBJECT } from "@/utils/constant";
import { warehouseSchema } from "@/utils/schemas/generalParameters";
import { createWarehouse } from "@/api/general-parameters/actions";
import Form from "./form";

const Create = () => {
  const router = useRouter();
  const ability = useAbility();
  const [isPending, startTransition] = useTransition();

  const methods = useForm({
    defaultValues: { name: "", address: "", phone: "" },
    resolver: yupResolver(warehouseSchema)
  });

  const { handleSubmit, reset } = methods;

  if (!ability.can(ABILITY_ACTIONS.CREATE as any, ABILITY_SUBJECT.GENERAL_PARAMETERS, ABILITY_FIELDS.BODEGAS))
    return null;

  const onSubmit = (data: any) => {
    startTransition(async () => {
      const result = await createWarehouse(data);

      if (result.success) {
        toast.success("Bodega creada con éxito");
        reset();
        router.refresh();
      } else {
        toast.error(result.error || "Error al crear la bodega");
      }
    });
  };

  return (
    <CustomCard title='Crear Bodega'>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Form isPending={isPending} />
        </form>
      </FormProvider>
    </CustomCard>
  );
};

export default Create;
