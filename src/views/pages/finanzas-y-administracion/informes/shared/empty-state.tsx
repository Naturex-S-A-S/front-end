"use client";

import { Stack, Typography } from "@mui/material";

import { Icon } from "@iconify/react";

export default function EmptyState() {
  return (
    <Stack alignItems='center' justifyContent='center' spacing={1} py={8}>
      <Icon icon='mdi:chart-box-outline' fontSize={48} color='text.secondary' />
      <Typography variant='body1' color='text.secondary'>
        No hay datos para los filtros seleccionados
      </Typography>
    </Stack>
  );
}
