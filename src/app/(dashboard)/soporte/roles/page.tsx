import List from '@/views/pages/soporte/roles/list'
import CustomBox from '@/@core/components/mui/Box'
import Create from '@/views/pages/soporte/roles/create'

export const metadata = {
  title: 'Roles - Naturex',
  description: ''
}

const Page = () => {
  return (
    <CustomBox title='Roles'>
      <Create />
      <List />
    </CustomBox>
  )
}

export default Page
