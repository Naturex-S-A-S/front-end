// MUI Imports
import Grid from '@mui/material/Grid'

// Type Imports
import type { ProfileTabType } from '@/types/pages/profileTypes'

// Component Imports
import AboutOverview from './AboutOverview'

// import ProjectsTable from './ProjectsTables'

const ProfileTab = ({ data }: { data?: ProfileTabType }) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AboutOverview data={data} />
      </Grid>
    </Grid>
  )
}

export default ProfileTab
