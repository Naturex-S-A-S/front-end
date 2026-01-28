'use client'
import type { SyntheticEvent } from 'react'
import { useMemo, useState } from 'react'

import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

import CustomTabList from '@/@core/components/mui/TabList'
import CustomCard from '@/@core/components/mui/Card'
import { useAbility } from '@/hooks/casl/useAbility'
import Create from './create'
import List from './list'
import Input from './input'
import Output from './output'
import { ABILITY_FIELDS, ABILITY_SUBJECT } from '@/utils/constant'

const Tabs = () => {
  const [activeTab, setActiveTab] = useState('1')

  const ability = useAbility()

  const canCreate = ability.can('create', ABILITY_SUBJECT.PACKAGING, ABILITY_FIELDS.LISTADO)

  const tabs = useMemo(() => {
    return [
      {
        value: '1',
        label: ABILITY_FIELDS.LISTADO,
        icon: 'tabler-list',
        allow: ability.can('read', ABILITY_SUBJECT.PACKAGING, ABILITY_FIELDS.LISTADO)
      },
      {
        value: '2',
        label: 'Entradas',
        icon: 'tabler-plus',
        allow: ability.can('create', ABILITY_SUBJECT.PACKAGING, ABILITY_FIELDS.ENTRADAS)
      },
      {
        value: '3',
        label: 'Salidas',
        icon: 'tabler-minus',
        allow: ability.can('create', ABILITY_SUBJECT.PACKAGING, ABILITY_FIELDS.SALIDAS)
      },
      {
        value: '4',
        label: 'Movimientos',
        icon: 'tabler-history',
        allow: ability.can('read', ABILITY_SUBJECT, ABILITY_FIELDS.MOVIMIENTOS)
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
      {canCreate && <Create />}
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
          <TabPanel value='4'>movimientos</TabPanel>
        </TabContext>
      </CustomCard>
    </>
  )
}

export default Tabs
