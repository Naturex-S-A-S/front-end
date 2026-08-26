"use client";

import { Box, Grid, Typography } from "@mui/material";

import CustomCard from "@/@core/components/mui/Card";
import type { ICostEstimate } from "@/types/pages/costs";
import { formatCurrency } from "@/utils/format";

interface Props {
  estimate: ICostEstimate;
}

const divide = (value: number, divisor: number) => (divisor > 0 ? value / divisor : 0);

const CostSummaryCards = ({ estimate }: Props) => {
  const materialCost = estimate.realTotalCostFeedstock + estimate.realTotalCostPackaging;

  return (
    <>
      <Grid item xs={12} sm={6} md={4}>
        <CustomCard>
          <Box textAlign='center' py={2}>
            <Typography variant='caption' color='text.secondary'>
              Costo por Kg
            </Typography>
            <Typography variant='h5' fontWeight={600} color='primary.main'>
              {formatCurrency(divide(estimate.totalCost, estimate.quantityKg))}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Material: {formatCurrency(divide(materialCost, estimate.quantityKg))} | CIF:{" "}
              {formatCurrency(divide(estimate.totalCif, estimate.quantityKg))}
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
              {formatCurrency(divide(estimate.totalCost, estimate.units))}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Material: {formatCurrency(divide(materialCost, estimate.units))} | CIF:{" "}
              {formatCurrency(divide(estimate.totalCif, estimate.units))}
            </Typography>
          </Box>
        </CustomCard>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <CustomCard>
          <Box textAlign='center' py={2}>
            <Typography variant='caption' color='text.secondary'>
              Costo Total del Lote
            </Typography>
            <Typography variant='h5' fontWeight={600} color='primary.main'>
              {formatCurrency(estimate.totalCost)}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Material: {formatCurrency(materialCost)} | CIF: {formatCurrency(estimate.totalCif)}
            </Typography>
          </Box>
        </CustomCard>
      </Grid>
    </>
  );
};

export default CostSummaryCards;
