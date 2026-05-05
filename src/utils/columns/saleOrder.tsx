import { useRouter } from 'next/navigation'

import type { GridColDef } from '@mui/x-data-grid'

import { ActionButton } from './components/ActionButton'
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
        <ActionButton
          icon='mdi:eye-outline'
          onClick={() => router.push(`/finanzas-y-administracion/ordenes-de-venta/${params.row.id}`)}
        />
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
      field: 'dateCreated',
      headerName: 'Fecha de creación',
      width: 200,
      renderCell: params => formatDate(params.row.dateCreated)
    }
  ]
}
