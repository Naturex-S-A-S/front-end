import { useRouter } from 'next/navigation'

import { Icon } from '@iconify/react'

import { Avatar, IconButton, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material'

import type { IProduct } from '@/types/pages/formulation'
import { formatDate } from '@/utils/format'

interface Props {
  products: IProduct[]
}

const Products = ({ products }: Props) => {
  const router = useRouter()

  const handleViewDetail = (productId: string) => {
    router.push(`/inventario/producto-terminado/detail/${productId}`)
  }

  return (
    <List>
      {products.map(product => (
        <ListItem
          key={product.id}
          secondaryAction={
            <IconButton edge='end' aria-label='Ver detalle' onClick={() => handleViewDetail(product.idFinalProduct)}>
              <Icon icon='mdi:eye' />
            </IconButton>
          }
        >
          <ListItemAvatar>
            <Avatar>
              <Icon icon='mdi:package-variant' />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={product.finalProduct.name}
            secondary={`Fecha asignada: ${formatDate(product.dateAssigned.toString())}`}
          />
        </ListItem>
      ))}
    </List>
  )
}

export default Products
