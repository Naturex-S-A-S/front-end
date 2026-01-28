/* eslint-disable import/order */
// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Type Imports
import type { ChildrenType } from '@core/types'

// Style Imports
import '@/app/globals.css'
import '@assets/iconify-icons/generated-icons.css'

import { Toaster } from 'react-hot-toast'

import 'react-datepicker/dist/react-datepicker.css'

export const metadata = {
  title: 'Naturex Admin Dashboard',
  description:
    'Naturex Admin Dashboard - is the most developer friendly & highly customizable Admin Dashboard Template based on MUI v5.'
}

const RootLayout = ({ children }: ChildrenType) => {
  // Vars
  const direction = 'ltr'

  return (
    <html id='__next' lang='en' dir={direction}>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        {children}
        <Toaster position='top-right' />
      </body>
    </html>
  )
}

export default RootLayout
