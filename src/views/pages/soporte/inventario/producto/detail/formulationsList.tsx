import { useState } from 'react'

import { Box, Drawer, IconButton, Typography } from '@mui/material'

import { Icon } from '@iconify/react'

import useGetFormulationByProductId from '@/hooks/formulation/useGetFormuationByProductId'
import CustomDataGrid from '@/@core/components/mui/DataGrid'
import { columns } from '@/utils/columns/productFormulations'
import Versions from '@/views/pages/produccion/formulacion/detail/versions'

interface Props {
  productId: string
}

const FormulationsList = ({ productId }: Props) => {
  const { formulations, isLoading } = useGetFormulationByProductId(productId)
  const [open, setOpen] = useState(false)
  const [selectedFormulationId, setSelectedFormulationId] = useState<number | null>(null)

  const toggleDrawer = (newOpen: boolean, formulationId: number | null) => {
    setOpen(newOpen)
    setSelectedFormulationId(formulationId)
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <CustomDataGrid columns={columns({ toggleDrawer })} data={formulations} />
      <Drawer anchor='right' open={open} onClose={() => toggleDrawer(false, null)}>
        <Box
          sx={{
            display: { xs: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 }
          }}
        >
          {selectedFormulationId && (
            <Box padding={5}>
              <Box display='flex' justifyContent='space-between'>
                <Typography variant='h5'>{formulations?.find(f => f.id === selectedFormulationId)?.name}</Typography>
                <IconButton>
                  <Icon icon='mdi:close' onClick={() => toggleDrawer(false, null)} />
                </IconButton>
              </Box>
              <Versions
                data={formulations?.find(f => f.id === selectedFormulationId)?.versions}
                formulationId={selectedFormulationId}
                isDetail={false}
              />
            </Box>
          )}
        </Box>
      </Drawer>
    </div>
  )
}

export default FormulationsList
