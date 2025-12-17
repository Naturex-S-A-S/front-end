import CustomBox from '@/@core/components/mui/Box'
import Create from '@/views/pages/soporte/usuarios/create'
import List from '@/views/pages/soporte/usuarios/list'

export const metadata = {
  title: 'Usuarios - Naturex',
  description: ''
}

const Page = () => {
  return (
    <CustomBox title='Usuarios'>
      <Create />
      <List />
    </CustomBox>
  )
}

export default Page
