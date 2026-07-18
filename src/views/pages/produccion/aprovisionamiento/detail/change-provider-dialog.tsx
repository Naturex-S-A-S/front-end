"use client";

import { useTransition } from "react";

import { useRouter } from "next/navigation";

import { Controller, FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";

import { Grid, Typography } from "@mui/material";

import CustomAutocomplete from "@/@core/components/mui/Autocomplete";
import CustomButton from "@/@core/components/mui/Button";
import CustomDialog from "@/@core/components/mui/Dialog";
import CustomTextField from "@/@core/components/mui/TextField";
import useGetProvidersList from "@/hooks/provider/useGetProvidersList";
import { patchMaterialProvider } from "@/api/order";

interface Props {
  open: boolean;
  toogleDialog: () => void;
  orderSupplyId: number;
  materialId: string;
  materialName: string;
}

const schema = yup.object({
  provider: yup
    .object({
      id: yup.string().required("Seleccione un proveedor")
    })
    .required("Seleccione un proveedor")
});

type FormData = yup.InferType<typeof schema>;

const ChangeProviderDialog: React.FC<Props> = ({ open, toogleDialog, orderSupplyId, materialId, materialName }) => {
  const [isPending, startTransition] = useTransition();
  const { providersList, isLoading: isLoadingProviders } = useGetProvidersList();
  const router = useRouter();

  const methods = useForm<FormData>({
    defaultValues: {
      provider: {
        id: ""
      }
    },
    resolver: yupResolver(schema)
  });

  const { handleSubmit, reset, control } = methods;

  const onSubmit = (data: any) => {
    if (!data.provider) return;

    startTransition(async () => {
      try {
        await patchMaterialProvider(orderSupplyId, materialId, data.provider.id);
        toast.success("Proveedor actualizado con éxito");
        reset();
        router.refresh();
        toogleDialog();
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Error al actualizar el proveedor");
      }
    });
  };

  const handleClose = () => {
    reset();
    toogleDialog();
  };

  return (
    <CustomDialog open={open} toogleDialog={handleClose} title='Cambiar proveedor' maxWidth='xs'>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Typography variant='subtitle2' color='textSecondary'>
                Material
              </Typography>
              <Typography variant='body1' fontWeight={600}>
                {materialName}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='provider'
                control={control}
                render={({ field: { value, onChange } }) => (
                  <CustomAutocomplete
                    value={value}
                    options={providersList}
                    loading={isLoadingProviders}
                    onChange={(_e, newValue) => onChange(newValue)}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        label='Proveedor'
                        placeholder='Seleccione un proveedor'
                        error={!!methods.formState.errors.provider}
                        helperText={methods.formState.errors.provider?.id?.message as string}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} className='flex justify-center'>
              <CustomButton text='Actualizar' type='submit' isLoading={isPending} />
            </Grid>
          </Grid>
        </form>
      </FormProvider>
    </CustomDialog>
  );
};

export default ChangeProviderDialog;
