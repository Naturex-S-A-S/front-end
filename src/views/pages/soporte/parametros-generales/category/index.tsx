import { useQuery } from '@tanstack/react-query'

import { Grid, List, ListItem, ListItemText, Paper } from '@mui/material'

import { Icon } from '@iconify/react'

import CustomDataGrid from '@/@core/components/mui/DataGrid'
import Create from './create'
import { columns } from '@/utils/columns/category'
import { getCategories } from '@/api/general-parameters'

const Category = () => {
  const { data } = useQuery({
    queryKey: ['getCategories'],
    queryFn: getCategories
  })

  const handleEdit = (category: any) => {
    alert('edit ' + category.name)
  }

  const handleDelete = (category: any) => {
    alert('delete ' + category.name)
  }

  return (
    <div className='flex flex-col items-center gap-2'>
      <Create />
      <div className='w-full'>
        <CustomDataGrid columns={columns({ handleEdit, handleDelete })} data={data} />
      </div>
      <Grid container spacing={2}>
        {data?.map((category: any) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Paper elevation={2} className='p-4'>
              <ListItem
                secondaryAction={
                  <div className='flex gap-1'>
                    <Icon icon='mdi:pencil-outline' />
                    <Icon icon='mdi:delete-outline' />
                  </div>
                }
              >
                <ListItemText primary={category.name} secondary={category.typeName} />
              </ListItem>
            </Paper>
          </Grid>
        ))}

        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={2} className='w-full p-4'>
            <List>
              {data?.map((category: any) => (
                <ListItem
                  key={category.id}
                  secondaryAction={
                    <div className='flex gap-1'>
                      <Icon icon='mdi:pencil-outline' />
                      <Icon icon='mdi:delete-outline' />
                    </div>
                  }
                >
                  <Icon icon='mdi:circle' />
                  <ListItemText primary={category.name} secondary={category.typeName} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default Category
