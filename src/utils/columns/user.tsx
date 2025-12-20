'use client'

import { Icon } from '@iconify/react'
import { IconButton } from '@mui/material'
import type { GridColDef } from '@mui/x-data-grid'

import { useAbility } from '@/hooks/casl/useAbility'

type params = {
  handleEdit: (user: any) => void
  handleDelete: (userId: any) => void
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
      headerName: 'Nombre completo',
      width: 200,
      renderCell: params => {
        return `${params.row.name} ${params.row.lastName}`
      }
    },
    { field: 'role', headerName: 'Rol', width: 150, renderCell: params => params.row.role.name },
    { field: 'dni', headerName: 'DNI', width: 100 },
    { field: 'dniType', headerName: 'Tipo DNI', width: 100 },
    { field: 'email', headerName: 'Correo Electrónico', width: 200 },
    { field: 'phone', headerName: 'Teléfono', width: 150 },
    { field: 'address', headerName: 'Dirección', width: 200 }
  ]
}
