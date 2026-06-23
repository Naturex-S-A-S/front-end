"use client";

import { useEffect, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";
import { Box, Divider, Typography } from "@mui/material";

import { Icon } from "@iconify/react";

import CustomDialog from "@/@core/components/mui/Dialog";
import CustomDataGrid from "@/@core/components/mui/DataGrid";
import { warehouseSchema } from "@/utils/schemas/generalParameters";
import { updateWarehouse, updateRack } from "@/api/general-parameters/actions";
import { getWarehouseById } from "@/api/general-parameters";
import { useColumns } from "@/utils/columns/rack";
import WarehouseForm from "./form";
import CreateRack from "./rack-create";
import UpdateRack from "./rack-update";
import CustomIconButton from "@/@core/components/mui/IconButton";
import Loader from "@/@core/components/react-spinners";

interface Props {
  warehouseId: string;
  open: boolean;
  onClose: () => void;
}

const Update = ({ warehouseId, open, onClose }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [warehousePending, startWarehouseTransition] = useTransition();
  const [showCreateRack, setShowCreateRack] = useState(false);
  const [editRack, setEditRack] = useState<any>(null);

  const { data: warehouse, isLoading } = useQuery({
    queryKey: ["warehouse", warehouseId],
    queryFn: () => getWarehouseById(warehouseId),
    enabled: open && !!warehouseId
  });

  const methods = useForm({
    defaultValues: { name: "", address: "", phone: "" },
    resolver: yupResolver(warehouseSchema)
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (warehouse) {
      reset({ name: warehouse.name, address: warehouse.address, phone: warehouse.phone });
    }
  }, [warehouse, reset]);

  const onSubmitWarehouse = (data: any) => {
    startWarehouseTransition(async () => {
      const result = await updateWarehouse(warehouseId, { ...data });

      if (result.success) {
        toast.success("Bodega actualizada con éxito");
        router.refresh();
      } else {
        toast.error(result.error || "Error al actualizar la bodega");
      }
    });
  };

  const handleUpdateActive = async (rack: any) => {
    queryClient.setQueryData(["warehouse", warehouseId], (old: any) => {
      if (!old) return old;

      return {
        ...old,
        racks: old.racks.map((r: any) => (r.id === rack.id ? { ...r, active: !r.active } : r))
      };
    });

    const result = await updateRack(rack.id, { active: !rack.active });

    queryClient.invalidateQueries({ queryKey: ["warehouse", warehouseId] });

    if (!result.success) {
      toast.error(result.error || "Error al actualizar el rack");
    }
  };

  const handleCreateRackSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["warehouse", warehouseId] });
    setShowCreateRack(false);
  };

  const handleUpdateRackSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["warehouse", warehouseId] });
    setEditRack(null);
  };

  const colDefs = useColumns({
    handleEdit: (rack: any) => {
      setShowCreateRack(false);
      setEditRack(rack);
    },
    handleUpdateActive
  });

  const handleClose = () => {
    reset({ name: "", address: "", phone: "" });
    setShowCreateRack(false);
    setEditRack(null);
    onClose();
  };

  return (
    <CustomDialog open={open} toogleDialog={handleClose} title='Editar Bodega' maxWidth='lg'>
      {isLoading ? (
        <Loader type='component' />
      ) : warehouse ? (
        <>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmitWarehouse)}>
              <WarehouseForm isPending={warehousePending} />
            </form>
          </FormProvider>

          <Divider sx={{ my: 4 }} />

          <Typography variant='h6' sx={{ mb: 2 }}>
            Estanterías
          </Typography>

          <Box marginTop={8}>
            {showCreateRack ? (
              <CreateRack idWarehouse={warehouseId} onSuccess={handleCreateRackSuccess} />
            ) : editRack ? (
              <UpdateRack rack={editRack} onSuccess={handleUpdateRackSuccess} />
            ) : (
              <></>
            )}
          </Box>

          {!showCreateRack && !editRack && (
            <div className='flex justify-center mt-4'>
              <CustomIconButton
                color='primary'
                size='large'
                variant='contained'
                className='p-2 rounded-full'
                onClick={() => setShowCreateRack(true)}
              >
                <Icon icon='ic:baseline-plus' width='40' height='40' />
              </CustomIconButton>
            </div>
          )}

          <CustomDataGrid columns={colDefs} data={warehouse.racks} />
        </>
      ) : (
        <Typography>No se pudo cargar la bodega</Typography>
      )}
    </CustomDialog>
  );
};

export default Update;
