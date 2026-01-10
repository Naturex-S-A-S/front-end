'use client'
import type { SyntheticEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'

import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

import CustomTabList from '@/@core/components/mui/TabList'
import CustomCard from '@/@core/components/mui/Card'
import { useAbility } from '@/hooks/casl/useAbility'
import Create from './create'
import List from './list'

const ABILITY_SUBJECT = 'Material de empaque'

const ABILITY_FIELDS = {
  LISTADO: 'Listado',
  ENTRADAS: 'Control de entradas',
  SALIDAS: 'Control de salidas',
  MOVIMIENTOS: 'Historial de movimientos'
}

const Tabs = () => {
  const [activeTab, setActiveTab] = useState('1')

  const ability = useAbility()

  const canCreate = ability.can('create', ABILITY_SUBJECT, ABILITY_FIELDS.LISTADO)

  const tabs = useMemo(() => {
    return [
      {
        value: '1',
        label: ABILITY_FIELDS.LISTADO,
        icon: 'tabler-list',
        allow: ability.can('read', ABILITY_SUBJECT, ABILITY_FIELDS.LISTADO)
      },
      {
        value: '2',
        label: 'Entradas',
        icon: 'tabler-plus',
        allow: ability.can('create', ABILITY_SUBJECT, ABILITY_FIELDS.ENTRADAS)
      },
      {
        value: '3',
        label: 'Salidas',
        icon: 'tabler-minus',
        allow: ability.can('create', ABILITY_SUBJECT, ABILITY_FIELDS.SALIDAS)
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

  useEffect(() => {
    if (activeTab !== '1') return

    const firstAllowedTab = tabs.find(tab => tab.allow)

    if (firstAllowedTab) {
      setActiveTab(firstAllowedTab.value)
    }
  }, [tabs, activeTab])

  return (
    <>
      {canCreate && <Create />}
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
          <TabPanel value='2'>entradaas</TabPanel>
          <TabPanel value='3'>salidass</TabPanel>
          <TabPanel value='4'>movimientos</TabPanel>
        </TabContext>
      </CustomCard>
    </>
  )
}

export default Tabs
