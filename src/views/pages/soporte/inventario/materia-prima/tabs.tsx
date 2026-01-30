'use client'
import type { SyntheticEvent } from 'react'
import { useMemo, useState } from 'react'

import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

import CustomTabList from '@/@core/components/mui/TabList'
import Create from './create'
import List from './list'
import Movements from '../movements'
import CustomCard from '@/@core/components/mui/Card'
import { useAbility } from '@/hooks/casl/useAbility'
import Input from './input'
import Output from './output'
import { MaterialType } from '@/utils/enum'

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
        allow: ability.can('create', 'Materia prima', 'Control de entradas')
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

  const allowedTabs = useMemo(() => tabs.filter(t => t.allow), [tabs])

  const validActive = useMemo(() => {
    if (allowedTabs.some(t => t.value === activeTab)) return activeTab

    return allowedTabs[0]?.value ?? ''
  }, [allowedTabs, activeTab])

  return (
    <>
      <Create />
      <CustomCard title=''>
        <TabContext value={validActive}>
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
            <Movements materialType={MaterialType.FEEDSTOCK} />
          </TabPanel>
        </TabContext>
      </CustomCard>
    </>
  )
}

export default Tabs
