'use client'
import Link from 'next/link'

import type { GridColDef } from '@mui/x-data-grid'

import { Icon } from '@iconify/react'

import { Box, Chip } from '@mui/material'

import { formatDate } from '../format'

interface Params {
  toggleDrawer: (newOpen: boolean, formulationId: number) => void
}

export const columns = ({ toggleDrawer }: Params): GridColDef[] => {
  return [
    {
      field: 'id',
      headerName: 'Id',
      width: 80,
      renderCell: params => (
        <Link href={`/produccion/formulacion/detail/${params.row.id}`} className='text-blue-500 hover:text-blue-400'>
          # {params.row.id}
        </Link>
      )
    },
    { field: 'name', headerName: 'Nombre', width: 200 },
    {
      field: 'activeVersion',
      headerName: 'Version Actual',
      width: 120,
      renderCell: params => (
        <Box className='flex justify-center items-center' style={{ height: '100%' }}>
          {Array.isArray(params.row.versions) && (
            <Chip
              label={`v${params.row.versions?.find((version: any) => version.active)?.sequentialNumber}`}
              color={'default'}
              variant='outlined'
            />
          )}
        </Box>
      )
    },

    /*{
      field: 'status',
      headerName: 'Estado',
      width: 120,
      renderCell: params => (
        <Box className='flex justify-center items-center' style={{ height: '100%' }}>
          <Chip label={!params.row.status ? 'Activo' : 'Inactivo'} color={!params.row.status ? 'success' : 'error'} />
        </Box>
      )
    },*/
    {
      field: 'versions',
      headerName: 'Versiones',
      width: 120,
      renderCell: params => (
        <span
          className='flex items-center gap-2 cursor-pointer hover:text-blue-500'
          onClick={() => toggleDrawer(true, params.row.id)}
        >
          <Icon icon='mdi:eye' /> Versiones
        </span>
      )
    },
    {
      field: 'dateCreated',
      headerName: 'Fecha de creación',
      width: 150,
      renderCell: params => formatDate(params.row.dateCreated)
    }
  ]
}
