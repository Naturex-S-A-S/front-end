import { DotLoader, PulseLoader } from 'react-spinners'

import primaryColorConfig from '@/configs/primaryColorConfig'

export type Props = {
  type?: 'page' | 'component'
}

const Loader: React.FC<Props> = ({ type = 'page' }) => {
  const renderType = () => {
    switch (type) {
      case 'page':
        return (
          <div className='flex justify-center items-center h-full w-full'>
            <DotLoader size={80} color={primaryColorConfig[5].main} loading={true} />
          </div>
        )
      case 'component':
        return (
          <div className='flex justify-center items-center w-full h-full'>
            <PulseLoader size={20} color={primaryColorConfig[5].main} loading={true} />
          </div>
        )
      default:
        return null
    }
  }

  return <div className='flex justify-center items-center h-full w-full'>{renderType()}</div>
}

export default Loader
