import { useRouter } from 'next/navigation'

import type { GridColDef } from '@mui/x-data-grid'

import { Box, Chip, Tooltip } from '@mui/material'

import { ActionButton } from './components/ActionButton'
import { formatDate } from '../format'

const STATUS_COLOR: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
  en_proceso: 'warning',
  completado: 'success',
  cancelado: 'error'
}

const STATUS_LABEL: Record<string, string> = {
  en_proceso: 'En proceso',
  completado: 'Completado',
  cancelado: 'Cancelado'
}

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
          onClick={() => router.push(`/produccion/ordenes/${params.row.orderId}`)}
        />
      )
    },
    {
      field: 'orderId',
      headerName: '#',
      width: 70
    },
    {
      field: 'batch',
      headerName: 'Lote',
      width: 130
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 130,
      renderCell: params => (
        <Box className='flex items-center' style={{ height: '100%' }}>
          <Chip
            label={STATUS_LABEL[params.row.status] ?? params.row.status}
            color={STATUS_COLOR[params.row.status] ?? 'default'}
            size='small'
          />
        </Box>
      )
    },
    {
      field: 'quantityExpected',
      headerName: 'Cantidad esperada',
      width: 150,
      renderCell: params => (
        <Box className='flex items-center' style={{ height: '100%' }}>
          {params.row.quantityExpected}
        </Box>
      )
    },
    {
      field: 'productNames',
      headerName: 'Productos',
      flex: 1,
      minWidth: 200,
      renderCell: params => {
        const names: string[] = params.row.productNames ?? []
        const visible = names.slice(0, 2)
        const remaining = names.slice(2)

        return (
          <div className='flex gap-2 items-center' style={{ height: '100%' }}>
            {visible.map((name, i) => (
              <Tooltip key={i} title={name}>
                <Chip label={name.length > 14 ? `${name.slice(0, 14)}…` : name} variant='outlined' size='small' />
              </Tooltip>
            ))}
            {remaining.length > 0 && (
              <Tooltip
                title={
                  <div>
                    {remaining.map((name, i) => (
                      <div key={i}>{name}</div>
                    ))}
                  </div>
                }
              >
                <Chip label={`+${remaining.length}`} variant='outlined' size='small' />
              </Tooltip>
            )}
          </div>
        )
      }
    },
    {
      field: 'dateCreated',
      headerName: 'Fecha de creación',
      width: 200,
      renderCell: params => formatDate(params.row.dateCreated)
    }
  ]
}
