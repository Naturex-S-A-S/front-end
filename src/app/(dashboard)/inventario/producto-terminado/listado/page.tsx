import CustomBox from '@/@core/components/mui/Box'
import Tabs from '@/views/pages/soporte/inventario/producto/tabs'

export const metadata = {
  title: 'Producto - Naturex',
  description: ''
}

const Page = () => {
  return (
    <CustomBox title='Producto'>
      <Tabs />
    </CustomBox>
  )
}

export default Page
