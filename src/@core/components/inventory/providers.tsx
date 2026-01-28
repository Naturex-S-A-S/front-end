import type { FC } from 'react'

import { List, ListItem, ListItemText } from '@mui/material'

import { Icon } from '@iconify/react'

import CustomCard from '@/@core/components/mui/Card'

interface Props {
  data: {
    id: string
    name: string
    phone: string
  }[]
}

const Providers: FC<Props> = ({ data }) => {
  return (
    <CustomCard title='Proveedores'>
      {Array.isArray(data) && data.length === 0 && <span>No hay proveedores disponibles</span>}

      <List className='p-0'>
        {data.map(provider => (
          <ListItem key={provider.id} className='p-0 mb-2'>
            <ListItemText
              primary={
                <div className='font-semibold flex items-center gap-2'>
                  <Icon icon='mdi:account' /> {provider.name}
                </div>
              }
              secondary={
                <div className='flex items-center gap-2 ml-2'>
                  {provider.phone && (
                    <>
                      <Icon icon='mdi:phone' /> {provider.phone}
                    </>
                  )}
                </div>
              }
            />
          </ListItem>
        ))}
      </List>
    </CustomCard>
  )
}

export default Providers
