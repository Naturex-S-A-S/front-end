import CustomDataGrid from '@/@core/components/mui/DataGrid'
import { columns } from '@/utils/columns/user'

const List = () => {
  const handleEdit = (id: string) => {
    console.log(id)
  }

  const handleDelete = (id: string) => {
    console.log(id)
  }

  return (
    <>
      {/*<Edit open={open} toogleDialog={handleDialog} defaultValues={userEdit} />*/}
      <CustomDataGrid columns={columns({ handleEdit, handleDelete })} data={[]} />
    </>
  )
}

export default List
