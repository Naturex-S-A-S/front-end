import CustomBox from '@/@core/components/mui/Box'
import Tabs from '@/views/pages/soporte/inventario/material-empaque/tabs'

export const metadata = {
  title: 'Material de empaque - Naturex',
  description: ''
}

const Page = () => {
  return (
    <CustomBox title='Material de empaque'>
      <Tabs />
    </CustomBox>
  )
}

export default Page
