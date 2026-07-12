"use client";

import { Icon } from "@iconify/react";
import { IconButton } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";

import { useAbility } from "@/hooks/casl/useAbility";
import { formatDate } from "../format";
import { ABILITY_ACTIONS, ABILITY_FIELDS, ABILITY_SUBJECT } from "../constant";
import type { Actions } from "@/types/next-auth";

type params = {
  handleEdit: (category: any) => void;
  handleDelete: (category: any) => void;
};

export const useColumns = ({ handleEdit, handleDelete }: params): GridColDef[] => {
  const ability = useAbility();

  const canEdit = ability.can(
    ABILITY_ACTIONS.CREATE as Actions,
    ABILITY_SUBJECT.GENERAL_PARAMETERS,
    ABILITY_FIELDS.CATEGORIES
  );

  const canDelete = ability.can(
    ABILITY_ACTIONS.DELETE as Actions,
    ABILITY_SUBJECT.GENERAL_PARAMETERS,
    ABILITY_FIELDS.CATEGORIES
  );

  return [
    {
      field: "actions",
      headerName: "Acciones",
      width: 100,
      renderCell: params => {
        return (
          <>
            {canEdit && (
              <IconButton onMouseDown={e => e.stopPropagation()} onClick={() => handleEdit(params.row)}>
                <Icon icon='mdi:pencil-outline' width={20} height={20} />
              </IconButton>
            )}
            {canDelete && (
              <IconButton
                onClick={() => {
                  handleDelete(params.row);
                }}
              >
                <Icon icon='mdi:delete-outline' width={20} height={20} />
              </IconButton>
            )}
          </>
        );
      }
    },
    {
      field: "name",
      headerName: "Nombre",
      width: 200
    },
    { field: "type", headerName: "Tipo", width: 200 },
    {
      field: "dateCreated",
      headerName: "Fecha de Creación",
      width: 200,
      renderCell: params => formatDate(params.row.dateCreated)
    }
  ];
};
