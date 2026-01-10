// React imports
import { forwardRef } from 'react'

// MUI imports
import Paper from '@mui/material/Paper'
import Autocomplete from '@mui/material/Autocomplete'

const CustomAutocomplete = forwardRef((props: any, ref: any) => {
  const getKey = (opt: any) => opt?.id ?? opt?.value ?? null

  return (
    <Autocomplete
      {...props}
      value={props.value ?? null}
      getOptionLabel={(option: any) => option?.name || option?.label || ''}
      getOptionKey={(option: any) => option?.id || option?.value || ''}
      isOptionEqualToValue={(option: any, value: any) => getKey(option) === getKey(value)}
      ref={ref}
      PaperComponent={props => <Paper {...props} />}
    />
  )
}) as typeof Autocomplete

export default CustomAutocomplete
