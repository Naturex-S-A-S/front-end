"use client";

import { Icon } from "@iconify/react";
import { IconButton, Switch } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";

import { useAbility } from "@/hooks/casl/useAbility";
import { formatDate } from "../format";
import { ABILITY_ACTIONS, ABILITY_FIELDS, ABILITY_SUBJECT } from "@/utils/constant";

type params = {
  handleEdit: (warehouse: any) => void;
};

export const useColumns = ({ handleEdit }: params): GridColDef[] => {
  const ability = useAbility();

  return [
    {
      field: "actions",
      headerName: "Acciones",
      width: 80,
      renderCell: params => (
        <>
          {ability.can(ABILITY_ACTIONS.UPDATE as any, ABILITY_SUBJECT.GENERAL_PARAMETERS, ABILITY_FIELDS.BODEGAS) && (
            <IconButton onMouseDown={e => e.stopPropagation()} onClick={() => handleEdit(params.row)}>
              <Icon icon='mdi:pencil-outline' width={20} height={20} />
            </IconButton>
          )}
        </>
      )
    },
    { field: "name", headerName: "Nombre", width: 200 },
    { field: "address", headerName: "Dirección", width: 250 },
    { field: "phone", headerName: "Teléfono", width: 150 },
    {
      field: "active",
      headerName: "Activo",
      width: 100,
      renderCell: params => <Switch checked={params.row.active} disabled />
    },
    {
      field: "dateCreated",
      headerName: "Fecha de Creación",
      width: 180,
      renderCell: params => formatDate(params.row.dateCreated)
    }
  ];
};
