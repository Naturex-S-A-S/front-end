/* eslint-disable lines-around-comment */
'use client'

import { useRouter } from 'next/navigation'

import { Switch, Tooltip } from '@mui/material'
import type { GridColDef } from '@mui/x-data-grid'

import { useAbility } from '@/hooks/casl/useAbility'
import Loader from '@/@core/components/react-spinners'
import { ActionButton } from './components/ActionButton'
import { PATHS } from '../paths'
import { ABILITY_ACTIONS, ABILITY_FIELDS, ABILITY_SUBJECT } from '../constant'

type params = {
  handleStatus: (id: any, name: string, active: boolean) => void
  isPending: boolean
}

export const columns = ({ handleStatus, isPending }: params): GridColDef[] => {
  const ability = useAbility()
  const router = useRouter()

  return [
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 80,
      renderCell: params => {
        return (
          <>
            {ability.can(ABILITY_ACTIONS.READ as any, ABILITY_SUBJECT.PRODUCT, ABILITY_FIELDS.LISTADO) && (
              <ActionButton
                icon='hugeicons:view'
                onClick={() => router.push(`${PATHS.PRODUCT_DETAIL}/${params.row.id}`)}
              />
            )}
          </>
        )
      }
    },
    { field: 'id', headerName: 'Código', width: 100 },
    { field: 'name', headerName: 'Nombre', width: 200 },
    {
      field: 'measurement',
      headerName: `Medida`,
      width: 100,
      renderCell: params => Number(params.row.measurement).toFixed(2)
    },
    {
      field: 'unit',
      headerName: 'Unidad',
      width: 150
    },
    {
      field: 'minimumStandard',
      headerName: `Stock mínimo`,
      width: 150
    },
    {
      field: 'active',
      headerName: 'Activo',
      width: 80,
      renderCell: params => (
        <div className='flex justify-center items-center' style={{ height: '100%' }}>
          <Tooltip title={params.row.active ? 'Desactivar' : 'Activar'}>
            {isPending ? (
              <Loader type='component' />
            ) : (
              <Switch
                checked={params.row.active}
                onChange={() => handleStatus(params.row.id, params.row.name, params.row.active)}
                color={params.row.active ? 'success' : 'error'}
                // {...(params.row.active ? { 'data-testid': 'active-switch' } : {})}
                {...(ability.can('update', 'Soporte', 'Usuarios') ? { disabled: false } : { disabled: true })}
                {...(params.row.active ? { slotProps: { input: { 'aria-label': 'controlled' } } } : {})}
              />
            )}
          </Tooltip>
        </div>
      )
    }
  ]
}
