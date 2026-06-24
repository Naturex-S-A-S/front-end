import { Suspense } from "react";

import { Grid, Typography } from "@mui/material";

import Loader from "@/@core/components/react-spinners";
import PageHeader from "@/@core/components/page-header";

export default function CifLayout({ children, detail }: { children: React.ReactNode; detail: React.ReactNode }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <PageHeader title={<Typography variant='h4'>Costos Indirectos</Typography>} />
      </Grid>
      <Grid item xs={12}>
        <Typography variant='body2' color='text.secondary'>
          CIF (Costos Indirectos de Fabricación). Se refiere a los costos que no se pueden atribuir directamente a la
          producción de un bien o servicio.
        </Typography>
      </Grid>
      <Grid item xs={12} lg={4}>
        <Suspense fallback={<Loader type='component' />}>{children}</Suspense>
      </Grid>
      <Grid item xs={12} lg={8}>
        <Suspense fallback={<Loader type='component' />}>{detail}</Suspense>
      </Grid>
    </Grid>
  );
}
