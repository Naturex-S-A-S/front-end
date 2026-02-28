'use client'
import * as React from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import type { GridRowsProp, GridRowModesModel, GridEventListener, GridRowModel, GridSlotProps } from '@mui/x-data-grid'
import { GridRowModes, DataGrid, GridToolbarContainer, GridRowEditStopReasons } from '@mui/x-data-grid'
import { Icon } from '@iconify/react'

interface IProps {
  columns: any[]
  data: GridRowsProp
  isLoading?: boolean
  processRowUpdate: (newRow: GridRowModel) => any
}

declare module '@mui/x-data-grid' {
  interface ToolbarPropsOverrides {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void
    setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void
  }
}

function EditToolbar(props: GridSlotProps['toolbar']) {
  const { setRowModesModel } = props

  const handleClick = () => {
    const id = 1

    setRowModesModel(oldModel => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' }
    }))
  }

  return (
    <GridToolbarContainer>
      <Button color='primary' startIcon={<Icon icon='mdi:add' />} onClick={handleClick}>
        Add record
      </Button>
    </GridToolbarContainer>
  )
}

const CustomDataGridEdit: React.FC<IProps> = ({ columns, data, isLoading, processRowUpdate }) => {
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({})

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true
    }
  }

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel)
  }

  return (
    <Box
      sx={{
        height: 500,
        width: '100%',
        '& .actions': {
          color: 'text.secondary'
        },
        '& .textPrimary': {
          color: 'text.primary'
        }
      }}
    >
      <DataGrid
        rows={Array.isArray(data) ? [...data, { id: 0, name: '', age: '', role: '', isNew: true }] : []}
        columns={columns}
        loading={isLoading}
        editMode='row'
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        slots={{ toolbar: EditToolbar }}
        slotProps={{
          toolbar: { setRowModesModel }
        }}
      />
    </Box>
  )
}

export default CustomDataGridEdit
