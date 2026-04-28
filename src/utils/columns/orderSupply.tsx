import { useRouter } from 'next/navigation'

import type { GridColDef } from '@mui/x-data-grid'

import { Box, Chip, IconButton, Tooltip } from '@mui/material'
import { Icon } from '@iconify/react'

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
        <IconButton onClick={() => router.push(`/produccion/aprovisionamiento/${params.row.orderId}`)}>
          <Icon icon='mdi:eye-outline' width={20} height={20} />
        </IconButton>
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
      width: 160
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
