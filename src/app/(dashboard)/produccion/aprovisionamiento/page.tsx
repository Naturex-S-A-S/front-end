import { Suspense } from 'react'

import dynamic from 'next/dynamic'

import CustomBox from '@/@core/components/mui/Box'

import Create from '@/views/aprovisionamiento/create'

const List = dynamic(
  () => import('@/views/pages/produccion/aprovisionamiento/list'),
  {
    ssr: false,
    loading: () => (
      <CustomBox title=''>
        <div className='animate-pulse h-48 bg-gray-100 rounded-lg' />
      </CustomBox>
    )
  }
)

export const metadata = {
  title: 'Aprovisionamiento - Naturex',
  description: ''
}

const Page = () => {
  return (
    <CustomBox title='Aprovisionamiento'>
      <Create />
      <Suspense fallback={<div className='animate-pulse h-48 bg-gray-100 rounded-lg' />}>
        <List />
      </Suspense>
    </CustomBox>
  )
}

export default Page
