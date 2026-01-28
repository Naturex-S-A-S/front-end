'use client'

import { useState } from 'react'

import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

import type { ProfileData } from '@/types/pages/profile'

import UserProfileHeader from './UserProfileHeader'
import CustomTabList from '@core/components/mui/TabList'

import AccountsTab from '@views/pages/user-profile/account'
import ChangePasswordTab from '@views/pages/user-profile/password'

type Props = {
  profile: ProfileData
}

export default function UserProfile({ profile }: Props) {
  const [activeTab, setActiveTab] = useState('account')

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <UserProfileHeader data={profile} />
      </Grid>

      <Grid item xs={12}>
        <TabContext value={activeTab}>
          <CustomTabList onChange={(_, v) => setActiveTab(v)} variant='scrollable' pill='true'>
            <Tab value='account' label='Cuenta' />
            <Tab value='change-password' label='Contraseña' />
          </CustomTabList>

          <TabPanel value={activeTab}>
            {activeTab === 'account' && <AccountsTab data={profile} />}
            {activeTab === 'change-password' && <ChangePasswordTab />}
          </TabPanel>
        </TabContext>
      </Grid>
    </Grid>
  )
}
