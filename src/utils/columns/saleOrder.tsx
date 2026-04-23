import { useRouter } from 'next/navigation'

import { Icon } from '@iconify/react'
import { IconButton } from '@mui/material'
import type { GridColDef } from '@mui/x-data-grid'

import { formatDate } from '../format'

export const columns = (): GridColDef[] => {
  const router = useRouter()

  return [
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 80,
      sortable: false,
      renderCell: params => (
        <IconButton onClick={() => router.push(`/finanzas-y-administracion/ordenes-de-venta/${params.row.id}`)}>
          <Icon icon='mdi:eye-outline' width={20} height={20} />
        </IconButton>
      )
    },
    {
      field: 'fileName',
      headerName: 'Nombre del archivo',
      flex: 1,
      minWidth: 200
    },
    {
      field: 'type',
      headerName: 'Tipo',
      width: 150
    },
    {
      field: 'quantity',
      headerName: 'Cantidad',
      width: 100
    },
    {
      field: 'charge',
      headerName: 'Cargo',
      width: 100
    },
    {
      field: 'userFullName',
      headerName: 'Nombre del usuario',
      width: 200
    },
    {
      field: 'fileDate',
      headerName: 'Fecha del archivo',
      width: 200,
      renderCell: params => formatDate(params.row.fileDate)
    },
    {
      field: 'dateCreated',
      headerName: 'Fecha de creación',
      width: 200,
      renderCell: params => formatDate(params.row.dateCreated)
    }
  ]
}
