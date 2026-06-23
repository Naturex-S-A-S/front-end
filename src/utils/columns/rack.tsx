"use client";

import { Icon } from "@iconify/react";
import { IconButton, Switch } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";

import { formatDate } from "../format";

type params = {
  handleEdit: (rack: any) => void;
  handleUpdateActive: (rack: any) => void;
};

export const useColumns = ({ handleEdit, handleUpdateActive }: params): GridColDef[] => {
  return [
    {
      field: "actions",
      headerName: "Acciones",
      width: 100,
      renderCell: params => (
        <>
          <IconButton onMouseDown={e => e.stopPropagation()} onClick={() => handleEdit(params.row)}>
            <Icon icon='mdi:eye-outline' width={20} height={20} />
          </IconButton>
        </>
      )
    },
    { field: "name", headerName: "Nombre", width: 200 },
    { field: "description", headerName: "Descripción", width: 300 },
    {
      field: "active",
      headerName: "Activo",
      width: 100,
      renderCell: params => <Switch checked={params.row.active} onChange={() => handleUpdateActive(params.row)} />
    },
    {
      field: "dateCreated",
      headerName: "Fecha de Creación",
      width: 180,
      renderCell: params => formatDate(params.row.dateCreated)
    }
  ];
};
