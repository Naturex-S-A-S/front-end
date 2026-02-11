'use client'
import type { SyntheticEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'

import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

import { Grid } from '@mui/material'

import CustomTabList from '@/@core/components/mui/TabList'
import { useAbility } from '@/hooks/casl/useAbility'
import Category from './category'
import { ABILITY_FIELDS, ABILITY_SUBJECT } from '@/utils/constant'

const Tabs = () => {
  const [activeTab, setActiveTab] = useState('1')

  const ability = useAbility()

  const tabs = useMemo(() => {
    return [
      {
        value: '1',
        label: ABILITY_FIELDS.CATEGORIES,
        icon: 'tabler-list',
        allow: ability.can('read', ABILITY_SUBJECT.GENERAL_PARAMETERS, ABILITY_FIELDS.CATEGORIES)
      }
    ]
  }, [ability])

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  useEffect(() => {
    if (activeTab !== '1') return

    const firstAllowedTab = tabs.find(tab => tab.allow)

    if (firstAllowedTab) {
      setActiveTab(firstAllowedTab.value)
    }
  }, [tabs, activeTab])

  return (
    <Grid container spacing={2}>
      <TabContext value={activeTab}>
        <Grid item xs={12} md={4}>
          <CustomTabList orientation='vertical' onChange={handleChange} className='is-full' pill='true'>
            {tabs.map(tab => {
              if (!tab.allow) return null

              return (
                <Tab
                  key={tab.value}
                  className='flex-row justify-start !min-is-full'
                  iconPosition='start'
                  label={
                    <div className='flex items-center gap-1.5'>
                      <i className={tab.icon} />
                      {tab.label}
                    </div>
                  }
                  value={tab.value}
                />
              )
            })}
          </CustomTabList>
        </Grid>
        <Grid item xs={12} md={8}>
          <TabPanel value='1'>
            <Category />
          </TabPanel>
        </Grid>
      </TabContext>
    </Grid>
  )
}

export default Tabs
