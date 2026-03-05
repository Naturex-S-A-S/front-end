'use client'

import Link from 'next/link'

import { Icon } from '@iconify/react'
import type { GridColDef } from '@mui/x-data-grid'

import { useAbility } from '@/hooks/casl/useAbility'
import { ABILITY_ACTIONS, ABILITY_FIELDS, ABILITY_SUBJECT } from '../constant'

export const columns = (): GridColDef[] => {
  const ability = useAbility()

  return [
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 100,
      renderCell: params => {
        return (
          <>
            {ability.can(
              ABILITY_ACTIONS.READ as any,
              ABILITY_SUBJECT.FINANCE_AND_ADMINISTRATION,
              ABILITY_FIELDS.SUPPLIERS
            ) && (
              <Link
                href={`/finanzas-y-administracion/proveedores/${params.id}`}
                onMouseDown={e => e.stopPropagation()}
                onClick={e => e.stopPropagation()}
              >
                <Icon icon='mdi:eye-outline' width={20} height={20} />
              </Link>
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
    { field: 'phone', headerName: 'Teléfono', width: 150 },
    { field: 'address', headerName: 'Dirección', width: 200 },
    { field: 'dateCreated', headerName: 'Fecha de Creación', width: 200 }
  ]
}
