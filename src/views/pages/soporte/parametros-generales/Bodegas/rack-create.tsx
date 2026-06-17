"use client";

import { useTransition } from "react";

import { useRouter } from "next/navigation";

import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";

import { rackSchema } from "@/utils/schemas/generalParameters";
import { createRack } from "@/api/general-parameters/actions";
import RackForm from "./rack-form";

interface Props {
  idWarehouse: string;
  onSuccess: () => void;
}

const CreateRack = ({ idWarehouse, onSuccess }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const methods = useForm({
    defaultValues: { name: "", description: "" },
    resolver: yupResolver(rackSchema)
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = (data: any) => {
    startTransition(async () => {
      const result = await createRack({ ...data, idWarehouse });

      if (result.success) {
        toast.success("Rack creado con éxito");
        reset();
        router.refresh();
        onSuccess();
      } else {
        toast.error(result.error || "Error al crear el rack");
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

export default CreateRack;
