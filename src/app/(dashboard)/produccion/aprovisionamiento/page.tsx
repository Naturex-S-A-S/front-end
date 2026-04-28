import CustomBox from '@/@core/components/mui/Box'
import Create from '@/views/aprovisionamiento/create'
import List from '@/views/pages/produccion/aprovisionamiento/list'

export const metadata = {
  title: 'Aprovisionamiento - Naturex',
  description: ''
}

const Page = () => {
  return (
    <CustomBox title='Aprovisionamiento'>
      <Create />
      <List />
    </CustomBox>
  )
}

export default Page
