'use client'
import * as React from 'react'

import type { GridRowsProp, GridRowModesModel, GridColDef, GridRowId, GridRowModel } from '@mui/x-data-grid'
import { GridRowModes, GridActionsCellItem } from '@mui/x-data-grid'

import { Icon } from '@iconify/react'

import CustomDataGridEdit from '@/@core/components/mui/DataGridEdit'

const initialRows: GridRowsProp = [
  {
    id: 1,
    product: 'Pan',
    quantity: 25,
    cost: 100
  },
  {
    id: 2,
    product: 'Mantequilla',
    quantity: 36,
    cost: 150
  },
  {
    id: 3,
    product: 'Mantequilla',
    quantity: 19,
    cost: 80
  },
  {
    id: 4,
    product: 'Leche',
    quantity: 28,
    cost: 120
  },
  {
    id: 5,
    product: 'Pan',
    quantity: 23,
    cost: 100
  }
]

declare module '@mui/x-data-grid' {
  interface ToolbarPropsOverrides {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void
    setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void
  }
}

const Testing = () => {
  const [rows, setRows] = React.useState(initialRows)
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({})

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } })
  }

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } })
  }

  const handleDeleteClick = (id: GridRowId) => () => {
    setRows(rows.filter(row => row.id !== id))
  }

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true }
    })

    const editedRow = rows.find(row => row.id === id)

    if (editedRow!.isNew) {
      setRows(rows.filter(row => row.id !== id))
    }
  }

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false }

    setRows(rows.map(row => (row.id === newRow.id ? updatedRow : row)))

    return updatedRow
  }

  const columns: GridColDef[] = [
    {
      field: 'product',
      headerName: 'Producto',
      width: 180,
      editable: true,
      type: 'singleSelect',
      valueOptions: ['Mantequilla', 'Leche', 'Pan']
    },
    {
      field: 'quantity',
      headerName: 'Cantidad',
      type: 'number',
      width: 100,
      align: 'left',
      headerAlign: 'left',
      editable: true
    },
    {
      field: 'cost',
      headerName: 'Costo',
      type: 'number',
      width: 100,
      align: 'left',
      headerAlign: 'left',
      editable: true
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key={`save-${id}`}
              icon={<Icon icon='mdi:content-save' />}
              label='Save'
              sx={{
                color: 'primary.main'
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              key={`cancel-${id}`}
              icon={<Icon icon='mdi:cancel' />}
              label='Cancel'
              className='textPrimary'
              onClick={handleCancelClick(id)}
              color='inherit'
            />
          ]
        }

        return [
          <GridActionsCellItem
            key={`edit-${id}`}
            icon={<Icon icon='mdi:pen' />}
            label='Edit'
            className='textPrimary'
            onClick={handleEditClick(id)}
            color='inherit'
          />,
          <GridActionsCellItem
            key={`delete-${id}`}
            icon={<Icon icon='mdi:delete' />}
            label='Delete'
            onClick={handleDeleteClick(id)}
            color='inherit'
          />
        ]
      }
    }
  ]

  return <CustomDataGridEdit columns={columns} data={rows} isLoading={false} processRowUpdate={processRowUpdate} />
}

export default Testing
