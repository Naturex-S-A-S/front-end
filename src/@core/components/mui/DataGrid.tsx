import { DataGrid } from '@mui/x-data-grid'

interface Props {
  columns: any[]
  data: any[] | undefined
}

const CustomDataGrid: React.FC<Props> = ({ columns, data }) => {
  return (
    <DataGrid
      rows={data}
      columns={columns}
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 10
          }
        }
      }}
      pageSizeOptions={[5]}
      disableRowSelectionOnClick
    />
  )
}

export default CustomDataGrid
