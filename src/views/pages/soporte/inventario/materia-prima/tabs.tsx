'use client'
import type { SyntheticEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'

import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

import CustomTabList from '@/@core/components/mui/TabList'
import Create from './create'
import List from './list'
import History from './history'
import CustomCard from '@/@core/components/mui/Card'
import { useAbility } from '@/hooks/casl/useAbility'
import Input from './input'
import Output from './output'

const Tabs = () => {
  const [activeTab, setActiveTab] = useState('1')

  const ability = useAbility()

  const tabs = useMemo(() => {
    return [
      {
        value: '1',
        label: 'Listado',
        icon: 'tabler-list',
        allow: ability.can('read', 'Materia prima', 'Listado')
      },
      {
        value: '2',
        label: 'Entradas',
        icon: 'tabler-plus',
        allow: ability.can('create', 'Materia prima', 'Entradas')
      },
      {
        value: '3',
        label: 'Salidas',
        icon: 'tabler-minus',
        allow: ability.can('create', 'Materia prima', 'Control de salidas')
      },
      {
        value: '4',
        label: 'Movimientos',
        icon: 'tabler-history',
        allow: ability.can('read', 'Materia prima', 'Historial de movimientos')
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
      <Create />
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
            <List />
          </TabPanel>
          <TabPanel value='2'>
            <Input />
          </TabPanel>
          <TabPanel value='3'>
            <Output />
          </TabPanel>
          <TabPanel value='4'>
            <History />
          </TabPanel>
        </TabContext>
      </CustomCard>
    </>
  )
}

export default Tabs
