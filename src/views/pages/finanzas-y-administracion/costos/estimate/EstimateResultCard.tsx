"use client";

import { useEffect, useRef } from "react";

import { Alert, Box, Grid } from "@mui/material";
import { Icon } from "@iconify/react";

import CustomCard from "@/@core/components/mui/Card";
import CostBreakdown from "./CostBreakdown";
import CostSummaryCards from "./CostSummaryCards";
import RegisterPriceCard from "./RegisterPriceCard";
import type { ICostEstimate } from "@/types/pages/costs";
import { formatCurrency } from "@/utils/format";

interface Props {
  estimate: ICostEstimate;
  title?: string;
  readOnly?: boolean;
  scrollOnChange?: boolean;
  waterfall?: {
    costBase: number;
    wastePct: number;
    wasteAmount: number;
    costWithWaste: number;
    taxPct: number;
    taxAmount: number;
    costWithTax: number;
  } | null;
  profitMargin?: { profit: number; marginPct: number } | null;
  isRegisteringPrice?: boolean;
  onMaterialChange?: (index: number, value: string) => void;
  onRegisterPrice?: () => void;
}

const EstimateResultCard = ({
  estimate,
  title = "Estimación de Costos",
  readOnly = false,
  scrollOnChange = true,
  waterfall,
  profitMargin,
  isRegisteringPrice,
  onMaterialChange,
  onRegisterPrice
}: Props) => {
  const costBreakdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (estimate && scrollOnChange && costBreakdownRef.current) {
      costBreakdownRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [estimate, scrollOnChange]);

  return (
    <Grid item xs={12} ref={costBreakdownRef}>
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

          <Grid item xs={12} md={!readOnly && waterfall ? 8 : 12}>
            <CostBreakdown
              estimate={estimate}
              formatCurrency={formatCurrency}
              onMaterialChange={readOnly ? undefined : onMaterialChange}
            />
          </Grid>
          {!readOnly && waterfall && (
            <Grid item xs={12} md={4}>
              <RegisterPriceCard
                waterfall={waterfall}
                profitMargin={profitMargin ?? null}
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
