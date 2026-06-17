"use client";

import { Icon } from "@iconify/react";
import { IconButton } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";

import { formatDate } from "../format";

type params = {
  handleEdit: (rack: any) => void;
  handleDelete: (rack: any) => void;
};

export const useColumns = ({ handleEdit, handleDelete }: params): GridColDef[] => {
  return [
    {
      field: "actions",
      headerName: "Acciones",
      width: 100,
      renderCell: params => (
        <>
          <IconButton onMouseDown={e => e.stopPropagation()} onClick={() => handleEdit(params.row)}>
            <Icon icon='mdi:pencil-outline' width={20} height={20} />
          </IconButton>
          <IconButton onMouseDown={e => e.stopPropagation()} onClick={() => handleDelete(params.row)}>
            <Icon icon='mdi:delete-outline' width={20} height={20} />
          </IconButton>
        </>
      )
    },
    { field: "name", headerName: "Nombre", width: 200 },
    { field: "description", headerName: "Descripción", width: 300 },
    {
      field: "dateCreated",
      headerName: "Fecha de Creación",
      width: 180,
      renderCell: params => formatDate(params.row.dateCreated)
    }
  ];
};
