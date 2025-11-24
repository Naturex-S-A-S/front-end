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

import type { Data } from '@/types/pages/profileTypes'

// Component Imports
import UserProfileHeader from './UserProfileHeader'
import CustomTabList from '@core/components/mui/TabList'
import { getProfile } from '@/api/user'

const tabs = [
  {
    value: 'account',
    label: 'Cuenta',
    icon: 'tabler-user-check'
  }

  /* {
    value: 'profile',
    label: 'Profile',
    icon: 'tabler-user-check'
  },

   {
    value: 'teams',
    label: 'Teams',
    icon: 'tabler-users'
  },
  {
    value: 'projects',
    label: 'Projects',
    icon: 'tabler-layout-grid'
  },
  {
    value: 'connections',
    label: 'Connections',
    icon: 'tabler-link'
  } */
]

const ProfileTab = dynamic(() => import('@views/pages/user-profile/profile'))
const TeamsTab = dynamic(() => import('@views/pages/user-profile/teams'))
const ProjectsTab = dynamic(() => import('@views/pages/user-profile/projects'))
const ConnectionsTab = dynamic(() => import('@views/pages/user-profile/connections'))
const AccountsTab = dynamic(() => import('@views/pages/user-profile/account'))

// Vars
const tabContentList = (data?: Data): { [key: string]: ReactElement } => ({
  profile: <ProfileTab data={data?.users.profile} />,
  teams: <TeamsTab data={data?.users.teams} />,
  projects: <ProjectsTab data={data?.users.projects} />,
  connections: <ConnectionsTab data={data?.users.connections} />,
  account: <AccountsTab />
})

const UserProfile = ({ data }: { data?: Data }) => {
  const [activeTab, setActiveTab] = useState('account')

  const { data: profile, isLoading } = useQuery({
    queryKey: ['getProfile'],
    queryFn: getProfile
  })

  console.log(profile)

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <UserProfileHeader data={data?.profileHeader} />
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
              {tabContentList(data)[activeTab]}
            </TabPanel>
          </TabContext>
        </Grid>
      )}
    </Grid>
  )
}

export default UserProfile
