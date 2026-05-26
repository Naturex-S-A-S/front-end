import CustomBox from '@/@core/components/mui/Box'
import Create from '@/views/order/create'
import List from '@/views/pages/produccion/ordenes/list'

export const metadata = {
  title: 'Órdenes - Naturex',
  description: ''
}

const OrderPage = () => {
  return (
    <CustomBox title='Órdenes'>
      <Create />
      <List />
    </CustomBox>
  )
}

export default OrderPage
