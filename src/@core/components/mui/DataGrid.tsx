/* eslint-disable lines-around-comment */
import { useState, type ChangeEvent } from 'react'

// MUI
import { DataGrid } from '@mui/x-data-grid'
import { Card } from '@mui/material'

// Toolbar
import ServerSideToolbar from './data-grid/ServerSideToolbar'

interface Props {
  columns: any[]
  data: any[] | undefined
  getRowClassName?: any
  isLoading?: boolean
}

const CustomDataGrid: React.FC<Props> = ({ columns, data, getRowClassName, isLoading }) => {
  const [searchValue, setSearchValue] = useState('')
  const [filteredData, setFilteredData] = useState<any[]>([])

  const handleSearch = (searchText: string) => {
    if (!data) {
      return
    }

    setSearchValue(searchText)

    if (!searchText) {
      setFilteredData([])

      return
    }

    const fields = columns.map(column => column.field)

    const filteredData = data.filter(row => {
      return fields.some(field => {
        const value = row[field]

        // Filtrar por números
        if (typeof value === 'number') {
          return value.toString().includes(searchText)
        }

        // Filtrar por strings
        if (typeof value === 'string') {
          return value.toString().toLowerCase().includes(searchText.toLowerCase())
        }

        // Filtrar por string[]
        if (Array.isArray(value)) {
          return value.some(item => item.toString().toLowerCase().includes(searchText.toLowerCase()))
        }

        return false
      })
    })

    setFilteredData(filteredData)
  }

  /* const ToolbarWrapper = () => (
    <ServerSideToolbar
      value={searchValue}
      onChange={(e: ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
      clearSearch={() => handleSearch('')}
      data={data}
    />
  ) */

  return (
    <Card sx={{ mt: 3, overflow: 'visible' }}>
      <DataGrid
        rows={searchValue ? filteredData : data ?? []}
        columns={columns}
        loading={isLoading}
        getRowClassName={getRowClassName}
        disableRowSelectionOnClick
        pageSizeOptions={[5, 10, 15, 20]}
        className='px-2'
        initialState={{
          pagination: {
            paginationModel: {
              page: 0,
              pageSize: 10
            }
          }
        }}
        slots={{
          toolbar: ServerSideToolbar
        }}
        slotProps={{
          toolbar: {
            value: searchValue,
            onChange: (e: ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value),
            clearSearch: () => handleSearch(''),
            data
          } as any
        }}
      />
    </Card>
  )
}

export default CustomDataGrid
