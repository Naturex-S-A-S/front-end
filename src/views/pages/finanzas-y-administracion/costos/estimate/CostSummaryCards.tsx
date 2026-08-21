"use client";

import { Box, Grid, Typography } from "@mui/material";

import CustomCard from "@/@core/components/mui/Card";
import type { ICostEstimate } from "@/types/pages/costs";
import { formatCurrency } from "@/utils/format";

interface Props {
  estimate: ICostEstimate;
}

const CostSummaryCards = ({ estimate }: Props) => {
  console.log({ estimate });

  return (
    <>
      <Grid item xs={12} sm={6} md={4}>
        <CustomCard>
          <Box textAlign='center' py={2}>
            <Typography variant='caption' color='text.secondary'>
              Costo por Kg
            </Typography>
            <Typography variant='h5' fontWeight={600} color='primary.main'>
              {formatCurrency(estimate.totalCost)}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Material: {formatCurrency(estimate.stdCostMaterialKg)} | CIF: {formatCurrency(estimate.costCifKg)}
            </Typography>
          </Box>
        </CustomCard>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <CustomCard>
          <Box textAlign='center' py={2}>
            <Typography variant='caption' color='text.secondary'>
              Costo por Unidad
            </Typography>
            <Typography variant='h5' fontWeight={600} color='primary.main'>
              {formatCurrency(estimate.costTotalUnit)}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Material: {formatCurrency(estimate.stdCostMaterialUnit)} | CIF: {formatCurrency(estimate.costCifUnit)}
            </Typography>
          </Box>
        </CustomCard>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <CustomCard>
          <Box textAlign='center' py={2}>
            <Typography variant='caption' color='text.secondary'>
              Costo Total por Kg
            </Typography>
            <Typography variant='h5' fontWeight={600} color='primary.main'>
              {formatCurrency(estimate.costTotalKg * estimate.quantityKg)}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Material: {formatCurrency(estimate.stdCostMaterialKg * estimate.quantityKg)} | CIF:{" "}
              {formatCurrency(estimate.costCifKg * estimate.quantityKg)}
            </Typography>
          </Box>
        </CustomCard>
      </Grid>
    </>
  );
};

export default CostSummaryCards;
