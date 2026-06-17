"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";
import { Box, Divider, Typography } from "@mui/material";

import { Icon } from "@iconify/react";

import CustomDialog from "@/@core/components/mui/Dialog";
import CustomDataGrid from "@/@core/components/mui/DataGrid";
import { warehouseSchema } from "@/utils/schemas/generalParameters";
import { updateWarehouse, deleteRack } from "@/api/general-parameters/actions";
import { useColumns } from "@/utils/columns/rack";
import type { IWarehouse } from "@/types/pages/generalParameters";
import WarehouseForm from "./form";
import CreateRack from "./rack-create";
import UpdateRack from "./rack-update";
import CustomIconButton from "@/@core/components/mui/IconButton";

interface Props {
  warehouse: IWarehouse;
  open: boolean;
  onClose: () => void;
}

const Update = ({ warehouse, open, onClose }: Props) => {
  const router = useRouter();
  const [warehousePending, startWarehouseTransition] = useTransition();
  const [showCreateRack, setShowCreateRack] = useState(false);
  const [editRack, setEditRack] = useState<any>(null);

  const methods = useForm({
    defaultValues: { name: warehouse.name, address: warehouse.address, phone: warehouse.phone },
    resolver: yupResolver(warehouseSchema)
  });

  const { handleSubmit, reset } = methods;

  const onSubmitWarehouse = (data: any) => {
    startWarehouseTransition(async () => {
      const result = await updateWarehouse(warehouse.id, { address: data.address });

      if (result.success) {
        toast.success("Bodega actualizada con éxito");
        router.refresh();
      } else {
        toast.error(result.error || "Error al actualizar la bodega");
      }
    });
  };

  const handleDeleteRack = async (rack: any) => {
    const result = await deleteRack(rack.id);

    if (result.success) {
      toast.success("Rack eliminado con éxito");
      router.refresh();
    } else {
      toast.error(result.error || "Error al eliminar el rack");
    }
  };

  const colDefs = useColumns({
    handleEdit: (rack: any) => {
      setShowCreateRack(false);
      setEditRack(rack);
    },
    handleDelete: handleDeleteRack
  });

  const handleClose = () => {
    reset();
    setShowCreateRack(false);
    setEditRack(null);
    onClose();
  };

  return (
    <CustomDialog open={open} toogleDialog={handleClose} title='Editar Bodega' maxWidth='lg'>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmitWarehouse)}>
          <WarehouseForm isPending={warehousePending} />
        </form>
      </FormProvider>

      <Divider sx={{ my: 4 }} />

      <Typography variant='h6' sx={{ mb: 2 }}>
        Racks
      </Typography>

      <Box marginTop={8}>
        {showCreateRack ? (
          <CreateRack idWarehouse={warehouse.id} onSuccess={() => setShowCreateRack(false)} />
        ) : editRack ? (
          <UpdateRack rack={editRack} onSuccess={() => setEditRack(null)} />
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
    </CustomDialog>
  );
};

export default Update;
