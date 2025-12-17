'use client'

// React Imports
import { useState } from 'react'
import type { ReactElement, SyntheticEvent } from 'react'

// MUI Imports
import dynamic from 'next/dynamic'

import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

// Type Imports
import { useQuery } from '@tanstack/react-query'

// Component Imports
import UserProfileHeader from './UserProfileHeader'
import CustomTabList from '@core/components/mui/TabList'
import { getProfile } from '@/api/user/profile'
import type { ProfileData } from '@/types/pages/profile'
import Loader from '@/@core/components/react-spinners'

const tabs = [
  {
    value: 'account',
    label: 'Cuenta',
    icon: 'tabler-user-check'
  },
  {
    value: 'change-password',
    label: 'Contraseña',
    icon: 'tabler-key'
  }
]

const AccountsTab = dynamic(() => import('@views/pages/user-profile/account'))
const ChangePasswordTab = dynamic(() => import('@views/pages/user-profile/password'))

const tabContentList = (data: ProfileData): { [key: string]: ReactElement } => ({
  account: <AccountsTab data={data} />,
  'change-password': <ChangePasswordTab />
})

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('account')

  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: ['getProfile'],
    queryFn: getProfile
  })

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  if (isLoading) return <Loader />

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <UserProfileHeader data={profile} />
      </Grid>
      {activeTab === undefined ? null : (
        <Grid item xs={12} className='flex flex-col gap-6'>
          <TabContext value={activeTab}>
            <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
              {tabs.map(tab => (
                <Tab
                  key={tab.value}
                  label={
                    <div className='flex items-center gap-1.5'>
                      <i className={tab.icon} />
                      {tab.label}
                    </div>
                  }
                  value={tab.value}
                />
              ))}
            </CustomTabList>

            <TabPanel value={activeTab} className='p-0'>
              {profile && tabContentList(profile)[activeTab]}
            </TabPanel>
          </TabContext>
        </Grid>
      )}
    </Grid>
  )
}

export default UserProfile
