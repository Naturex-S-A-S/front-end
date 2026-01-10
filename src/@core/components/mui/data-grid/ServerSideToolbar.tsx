// ** React Imports
import type { ChangeEvent } from 'react'
import React from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'

// ** Custom Component Import
// import ExcelExport from '../export-data/Excel'

import { Icon } from '@iconify/react'
import { TextField } from '@mui/material'

interface Props {
  value: string
  clearSearch: () => void
  onChange: (e: ChangeEvent) => void
  data: any[]
}

const ServerSideToolbar: any = (props: Props) => {
  return (
    <Box
      sx={{
        gap: 2,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: theme => theme.spacing(2, 5, 4, 5)
      }}
    >
      <Box>{/*<ExcelExport data={props.data} />*/}</Box>
      <Box sx={{ gap: 2 }}>
        <TextField
          color='warning'
          size='small'
          value={props.value}
          placeholder={'Search...'}
          onChange={props.onChange}
          InputProps={{
            startAdornment: (
              <Box sx={{ mr: 2, display: 'flex' }}>
                <Icon fontSize='1.25rem' icon='tabler:search' />
              </Box>
            ),
            endAdornment: (
              <IconButton size='small' title='Clear' aria-label='Clear' onClick={props.clearSearch}>
                <Icon fontSize='1.25rem' icon='tabler:x' />
              </IconButton>
            )
          }}
          sx={{
            width: {
              xs: 1,
              sm: 'auto'
            },
            '& .MuiInputBase-root > svg': {
              mr: 2
            }
          }}
        />
      </Box>
    </Box>
  )
}

export default ServerSideToolbar
