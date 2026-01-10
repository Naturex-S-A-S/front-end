import { Box, Chip, Switch, Tooltip } from '@mui/material'

import Loader from '@/@core/components/react-spinners'

type Props = {
  id: string
  name: string
  description?: string
  createdAt?: string
  active?: boolean
  handleActive: (id: any, name: string, active: boolean, validate?: boolean) => void
  canUpdate?: boolean
  isPending?: boolean
  quantity?: number
}

const Header: React.FC<Props> = ({
  id,
  name,
  description,
  handleActive,
  active,
  createdAt,
  canUpdate,
  isPending,
  quantity
}) => {
  return (
    <Box display={'flex'} flexDirection='row' justifyContent={'space-between'}>
      <div>
        <h1>
          <span>
            #{id} - {name}
          </span>
        </h1>
        {description && <p>{description}</p>}
        {createdAt && <p className='text-textSecondary'>Fecha de creación: {createdAt}</p>}
      </div>
      <div className='flex items-center gap-4'>
        {quantity !== undefined && (
          <Chip
            label={quantity > 0 ? `${quantity} en stock` : 'Sin stock'}
            size='medium'
            color={quantity > 0 ? 'success' : 'error'}
          />
        )}

        {active !== undefined &&
          canUpdate &&
          (isPending ? (
            <Loader type='component' />
          ) : (
            <Chip
              color={active ? 'success' : 'error'}
              label={
                <>
                  {active ? 'Activo' : 'Inactivo'}
                  <Tooltip title={active ? 'Desactivar' : 'Activar'}>
                    <Switch
                      checked={active}
                      onChange={() => handleActive(id, name, active, false)}
                      color={active ? 'success' : 'error'}
                      {...(active ? { slotProps: { input: { 'aria-label': 'controlled' } } } : {})}
                    />
                  </Tooltip>
                </>
              }
            />
          ))}
      </div>
    </Box>
  )
}

export default Header
