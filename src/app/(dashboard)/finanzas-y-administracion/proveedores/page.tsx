import CustomBox from '@/@core/components/mui/Box'
import Create from '@/views/pages/finanzas-y-administracion/proveedores/create'
import List from '@/views/pages/finanzas-y-administracion/proveedores/list'

export const metadata = {
  title: 'Proveedores - Naturex',
  description: ''
}

const Page = () => {
  return (
    <CustomBox title='Proveedores'>
      <Create />
      <List />
    </CustomBox>
  )
}

export default Page
