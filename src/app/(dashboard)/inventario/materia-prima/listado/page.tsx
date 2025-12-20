import CustomBox from '@/@core/components/mui/Box'
import Tabs from '@/views/pages/soporte/inventario/materia-prima/tabs'

export const metadata = {
  title: 'Materia prima - Naturex',
  description: ''
}

const Page = () => {
  return (
    <CustomBox title='Materia prima'>
      <Tabs />
    </CustomBox>
  )
}

export default Page
