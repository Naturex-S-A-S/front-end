"use client";
import { useState } from "react";

import { useRouter } from "next/navigation";

import { useMutation } from "@tanstack/react-query";

import toast from "react-hot-toast";

import CustomCard from "@/@core/components/mui/Card";
import CustomDataGrid from "@/@core/components/mui/DataGrid";
import { deleteUser } from "@/api/user";
import { useColumns } from "@/utils/columns/user";
import Edit from "./edit";
import { alertMessageErrors } from "@/utils/messages";
import type { IUser } from "@/types/pages/user";
import Swal from "@/lib/swal";

type Props = {
  initialData: IUser[];
};

const List = ({ initialData }: Props) => {
  const [userEdit, setUserEdit] = useState(undefined);
  const [open, setOpen] = useState(false);

  const router = useRouter();

  const { mutate: deleteUserMutation } = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      router.refresh();
      toast.success("Usuario eliminado con éxito");
    },
    onError: (error: any) => {
      alertMessageErrors(error, "Error al eliminar el usuario");
    }
  });

  const handleDialog = () => {
    setOpen(!open);
    setUserEdit(undefined);
  };

  const handleEdit = (user: any) => {
    handleDialog();
    setUserEdit(user);
  };

  const handleDelete = (userId: string) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Eliminar el usuario, no se puede deshacer",
      icon: "warning",
      confirmButtonText: "Eliminar"
    }).then(result => {
      if (result.isConfirmed) {
        deleteUserMutation(userId);
      }
    });
  };

  const colDefs = useColumns({ handleEdit, handleDelete });

  return (
    <CustomCard title=''>
      <Edit open={open} toogleDialog={handleDialog} defaultValues={userEdit} />
      <CustomDataGrid columns={colDefs} data={initialData} />
    </CustomCard>
  );
};

export default List;
