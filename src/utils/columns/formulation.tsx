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
      width: 100,
      renderCell: params => {
        return (
          <IconButton onClick={() => router.push(`/produccion/formulacion/detail/${params.row.id}`)}>
            <Icon icon='mdi:eye-outline' width={20} height={20} />
          </IconButton>
        )
      }
    },
    { field: 'name', headerName: 'Nombre', width: 150 },
    {
      field: 'activeVersion',
      headerName: 'Version Actual',
      width: 120,
      renderCell: params => (
        <Box className='flex justify-center items-center' style={{ height: '100%' }}>
          {params.row.activeVersion && (
            <Chip label={`v${params.row.activeVersion}`} color={'default'} variant='outlined' />
          )}
        </Box>
      )
    },
    {
      field: 'totalVersions',
      headerName: 'Total de versiones',
      width: 150,
      renderCell: params => (
        <Box className='flex justify-center items-center' style={{ height: '100%' }}>
          {params.row.totalVersions}
        </Box>
      )
    },
    {
      field: 'products',
      headerName: 'Productos',
      width: 200,
      renderCell: params => {
        const visible = params.row.products.slice(0, 1)
        const remaining = params.row.products.slice(1)

        return (
          <div className='flex gap-2 justify-center items-center' style={{ height: '100%' }}>
            {visible.map((category: any) => (
              <Tooltip key={category.id ?? category.name} title={category.name}>
                <Chip
                  key={category.id ?? category.name}
                  label={`${category.name.slice(0, 10)} ${category.name.length > 10 ? '...' : ''}`}
                  variant='outlined'
                />
              </Tooltip>
            ))}

            {remaining.length > 0 && (
              <Tooltip
                title={
                  <div>
                    {remaining.map((c: any, i: number) => (
                      <div key={c.id ?? `${c.name}-${i}`}>{c.name.slice(0, 10)}</div>
                    ))}
                  </div>
                }
              >
                <Chip label={`+${remaining.length}`} variant='outlined' />
              </Tooltip>
            )}
          </div>
        )
      }
    },
    {
      field: 'dateCreated',
      headerName: 'Fecha de movimiento',
      width: 150,
      renderCell: params => formatDate(params.row.dateCreated)
    }
  ]
}
