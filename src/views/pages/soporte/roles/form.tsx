import { useEffect } from "react";

import { Box } from "@mui/material";

import { FormProvider, useForm } from "react-hook-form";

import CustomTextField from "@/@core/components/mui/TextField";
import CustomButton from "@/@core/components/mui/Button";
import CustomDialog from "@/@core/components/mui/Dialog";
import { defaultRoleValues } from "@/utils/defaultValues/role";
import { usePermissionState } from "./usePermissionState";
import PermissionTable from "./PermissionTable";

type Props = {
  mutate: (data: any) => void;
  isLoadingMutate?: boolean;
  isLoadingQuery?: boolean;
  open: boolean;
  toogleDialog: () => void;
  defaultValues?: {
    id: number;
    name: string;
  };
  roleModules: any[];
};

const Form: React.FC<Props> = ({
  mutate,
  open,
  toogleDialog,
  defaultValues,
  isLoadingMutate = false,
  isLoadingQuery = false,
  roleModules
}) => {
  const { selectedCheckbox, togglePermission, resetPermissions } = usePermissionState(roleModules);

  const methods = useForm({
    defaultValues: defaultValues ?? defaultRoleValues
  });

  useEffect(() => {
    if (defaultValues) {
      methods.reset(defaultValues ?? defaultRoleValues);
    }
  }, [defaultValues, methods]);

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset
  } = methods;

  const handleOnSubmit = async (values: any) => {
    const permissions = selectedCheckbox.reduce(
      (acc, id) => {
        const [, , itemId, action] = id.split("-");

        if (!itemId) return acc;

        if (!acc[itemId]) {
          acc[itemId] = {
            module: {
              id: Number(itemId)
            },
            privileges: {
              read: false,
              create: false,
              update: false,
              delete: false
            }
          };
        }

        acc[itemId].privileges[action] = true;

        return acc;
      },
      {} as Record<
        string,
        {
          module: { id: number };
          privileges: Record<string, boolean>;
        }
      >
    );

    await mutate({
      roleName: values.name,
      modulePrivileges: Object.values(permissions)
    });

    reset();
    resetPermissions();
  };

  return (
    <CustomDialog
      open={open}
      toogleDialog={toogleDialog}
      title={defaultValues ? "Editar Rol" : "Crear Rol"}
      maxWidth='lg'
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(handleOnSubmit)}>
          <Box mb={4}>
            <CustomTextField
              {...register("name")}
              autoFocus
              fullWidth
              label='Rol'
              placeholder='Ingrese el nombre del rol'
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </Box>

          <PermissionTable
            roleModules={roleModules}
            selectedCheckbox={selectedCheckbox}
            togglePermission={togglePermission}
            isLoadingQuery={isLoadingQuery}
          />

          <Box display='flex' justifyContent='center' mt={4}>
            <CustomButton type='submit' variant='contained' isLoading={isLoadingMutate} text='Guardar' />
          </Box>
        </form>
      </FormProvider>
    </CustomDialog>
  );
};

export default Form;
