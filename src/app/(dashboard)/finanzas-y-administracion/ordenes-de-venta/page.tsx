import CustomBox from '@/@core/components/mui/Box'
import Create from '@/views/pages/finanzas-y-administracion/ordenes-de-venta/create'
import List from '@/views/pages/finanzas-y-administracion/ordenes-de-venta/list'

export const metadata = {
  title: 'Órdenes de Venta - Naturex',
  description: ''
}

const Page = () => {
  return (
    <CustomBox title='Órdenes de Venta'>
      <Create />
      <List />
    </CustomBox>
  )
}

export default Page
