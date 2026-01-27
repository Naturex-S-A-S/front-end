'use client'

import { Icon } from '@iconify/react'
import { IconButton } from '@mui/material'
import type { GridColDef } from '@mui/x-data-grid'

import { useAbility } from '@/hooks/casl/useAbility'

type params = {
  handleEdit: (category: any) => void
  handleDelete: (categoryId: any) => void
}

export const columns = ({ handleEdit, handleDelete }: params): GridColDef[] => {
  const ability = useAbility()

  return [
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 100,
      renderCell: params => {
        return (
          <>
            {ability.can('update', 'Soporte', 'Usuarios') && (
              <IconButton onClick={() => handleEdit(params.row)}>
                <Icon icon='mdi:pencil-outline' width={20} height={20} />
              </IconButton>
            )}
            {ability.can('delete', 'Soporte', 'Usuarios') && (
              <IconButton
                onClick={() => {
                  handleDelete(params.row.id)
                }}
              >
                <Icon icon='mdi:delete-outline' width={20} height={20} />
              </IconButton>
            )}
          </>
        )
      }
    },
    {
      field: 'name',
      headerName: 'Nombre',
      width: 200
    },
    { field: 'typeName', headerName: 'Tipo', width: 150 }
  ]
}
