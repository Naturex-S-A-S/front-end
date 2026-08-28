"use client";

import { Box, Grid } from "@mui/material";
import { Icon } from "@iconify/react";

import CustomCard from "@/@core/components/mui/Card";
import CostBreakdown from "./CostBreakdown";
import CostSummaryCards from "./CostSummaryCards";
import RegisterPriceCard from "./RegisterPriceCard";
import type { ICostEstimate } from "@/types/pages/costs";

interface Props {
  estimate: ICostEstimate;
  title?: string;
  readOnly?: boolean;
  isRegisteringPrice?: boolean;
  onMaterialChange?: (index: number, value: string) => void;
  onRegisterPrice?: () => void;
  onEstimateEdit?: (updatedEstimate: Partial<ICostEstimate>) => void;
}

const EstimateResultCard = ({
  estimate,
  title = "Estimación de Costos",
  readOnly = false,
  isRegisteringPrice,
  onMaterialChange,
  onRegisterPrice,
  onEstimateEdit
}: Props) => {
  return (
    <Grid item xs={12}>
      <CustomCard
        title={
          <Box display='flex' alignItems='center' gap={2}>
            <Icon icon='mdi:calculator-variant-outline' fontSize={20} />
            <span>{title}</span>
          </Box>
        }
      >
        <Grid container spacing={4}>
          <CostSummaryCards estimate={estimate} />

          <Grid item xs={12} md={8}>
            <CostBreakdown
              estimate={estimate}
              onMaterialChange={readOnly ? undefined : onMaterialChange}
              onEstimateEdit={onEstimateEdit}
            />
          </Grid>
          {estimate && (
            <Grid item xs={12} md={4}>
              <RegisterPriceCard
                readonly={readOnly}
                estimate={estimate}
                isRegisteringPrice={isRegisteringPrice ?? false}
                onRegister={onRegisterPrice ?? (() => {})}
              />
            </Grid>
          )}
        </Grid>
      </CustomCard>
    </Grid>
  );
};

export default EstimateResultCard;
