"use client";

import { Alert, Box, Grid } from "@mui/material";
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

          {(estimate.materialIncomplete || estimate.cifIncomplete) && (
            <Grid item xs={12}>
              <Box display='flex' flexDirection='column' gap={1}>
                {estimate.materialIncomplete && (
                  <Alert severity='warning' icon={<Icon icon='mdi:alert-outline' />}>
                    Algunos materiales no tienen costo registrado. La estimación puede estar incompleta.
                  </Alert>
                )}
                {estimate.cifIncomplete && (
                  <Alert severity='warning' icon={<Icon icon='mdi:alert-outline' />}>
                    El costo CIF no está incluido en la estimación.
                  </Alert>
                )}
              </Box>
            </Grid>
          )}

          <Grid item xs={12} md={!readOnly && estimate ? 8 : 12}>
            <CostBreakdown
              estimate={estimate}
              onMaterialChange={readOnly ? undefined : onMaterialChange}
              onEstimateEdit={onEstimateEdit}
            />
          </Grid>
          {!readOnly && estimate && (
            <Grid item xs={12} md={4}>
              <RegisterPriceCard
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
