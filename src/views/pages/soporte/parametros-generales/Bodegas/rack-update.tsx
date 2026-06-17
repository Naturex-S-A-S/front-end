"use client";

import { useEffect, useTransition } from "react";

import { useRouter } from "next/navigation";

import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";

import { rackSchema } from "@/utils/schemas/generalParameters";
import { updateRack } from "@/api/general-parameters/actions";
import RackForm from "./rack-form";
import type { IRack } from "@/types/pages/generalParameters";

interface Props {
  rack: IRack;
  onSuccess: () => void;
}

const UpdateRack = ({ rack, onSuccess }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const methods = useForm({
    defaultValues: { name: rack.name, description: rack.description },
    resolver: yupResolver(rackSchema)
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    reset({
      ...rack
    });
  }, [rack, reset]);

  const onSubmit = (data: any) => {
    startTransition(async () => {
      const result = await updateRack(rack.id, { name: data.name });

      if (result.success) {
        toast.success("Rack actualizado con éxito");
        reset();
        router.refresh();
        onSuccess();
      } else {
        toast.error(result.error || "Error al actualizar el rack");
      }
    });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <RackForm isPending={isPending} onCancel={onSuccess} />
      </form>
    </FormProvider>
  );
};

export default UpdateRack;
