/* eslint-disable import/order */
// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Type Imports
import type { ChildrenType } from '@core/types'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'
import SessionProvider from '@/components/provider/SessionProvider'
import { AbilityProvider } from '@/components/provider/AbilityProvider'

import { Toaster } from 'react-hot-toast'

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
        <SessionProvider>
          <AbilityProvider>
            {children}
            <Toaster position='top-right' />
          </AbilityProvider>
        </SessionProvider>
      </body>
    </html>
  )
}

export default RootLayout
