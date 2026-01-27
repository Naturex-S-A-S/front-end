'use client'
import type { SyntheticEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'

import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

import CustomTabList from '@/@core/components/mui/TabList'
import CustomCard from '@/@core/components/mui/Card'
import { useAbility } from '@/hooks/casl/useAbility'
import Category from './category'

const Tabs = () => {
  const [activeTab, setActiveTab] = useState('1')

  const ability = useAbility()

  const tabs = useMemo(() => {
    return [
      {
        value: '1',
        label: 'Categorias',
        icon: 'tabler:category',
        allow: ability.can('read', 'Materia prima', 'Listado')
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
    <>
      <CustomCard title=''>
        <TabContext value={activeTab}>
          <CustomTabList onChange={handleChange} variant='standard' centered pill='true' sx={{ width: '100%' }}>
            {tabs.map(tab => {
              if (!tab.allow) return null

              return (
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
              )
            })}
          </CustomTabList>
          <TabPanel value='1'>
            <Category />
          </TabPanel>
          <TabPanel value='2'>test</TabPanel>
          <TabPanel value='3'>dd</TabPanel>
          <TabPanel value='4'>gg</TabPanel>
        </TabContext>
      </CustomCard>
    </>
  )
}

export default Tabs
