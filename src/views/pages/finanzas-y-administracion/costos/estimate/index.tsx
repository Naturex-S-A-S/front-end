"use client";

import { Box, Grid, Typography } from "@mui/material";
import { Icon } from "@iconify/react";

import { FormProvider } from "react-hook-form";

import Loader from "@/@core/components/react-spinners";
import useEstimate from "./useEstimate";
import EstimateForm from "./EstimateForm";
import EstimateResultCard from "./EstimateResultCard";
import CurrentPriceCard from "./CurrentPriceCard";
import PriceHistory from "./PriceHistory";
import SnapshotHistory from "./SnapshotHistory";
import SnapshotDetailDialog from "./SnapshotDetailDialog";
import { formatCurrency } from "@/utils/format";

const EstimateView = () => {
  const {
    methods,
    productList,
    selectedProduct,
    quantityKg,
    estimate,
    error,
    isEstimating,
    snapshots,
    selectedSnapshotId,
    isLoadingSnapshots,
    currentPrice,
    priceHistory,
    isRegisteringPrice,
    waterfall,
    profitMargin,
    handleProductChange,
    handleQuantityChange,
    handleEstimate,
    handleRegisterPrice,
    handleMaterialChange,
    handleSnapshotDetail,
    handleCloseSnapshotDetail,
    handleRefreshSnapshots
  } = useEstimate();

  return (
    <FormProvider {...methods}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <EstimateForm
            productList={productList}
            selectedProduct={selectedProduct}
            quantityKg={quantityKg}
            error={error}
            isEstimating={isEstimating}
            onProductChange={handleProductChange}
            onQuantityChange={handleQuantityChange}
            onEstimate={handleEstimate}
          />
        </Grid>

        {selectedProduct && currentPrice && (
          <Grid item xs={12}>
            <CurrentPriceCard price={currentPrice} formatCurrency={formatCurrency} />
          </Grid>
        )}

        {estimate && waterfall && (
          <EstimateResultCard
            estimate={estimate}
            waterfall={waterfall}
            profitMargin={profitMargin}
            isRegisteringPrice={isRegisteringPrice}
            onMaterialChange={handleMaterialChange}
            onRegisterPrice={handleRegisterPrice}
          />
        )}

        {error && (
          <Grid item xs={12}>
            <Box display='flex' alignItems='center' gap={2} p={2} bgcolor='error.light' borderRadius={1}>
              <Icon icon='mdi:alert-circle-outline' fontSize={20} color='error' />
              <Typography color='error'>{error}</Typography>
            </Box>
          </Grid>
        )}

        {selectedProduct && priceHistory.length > 0 && (
          <Grid item xs={12}>
            <PriceHistory prices={priceHistory} formatCurrency={formatCurrency} />
          </Grid>
        )}

        {selectedProduct && (
          <Grid item xs={12}>
            {isLoadingSnapshots ? (
              <Box py={4}>
                <Loader type='component' />
              </Box>
            ) : (
              <SnapshotHistory
                snapshots={snapshots}
                onViewDetail={handleSnapshotDetail}
                formatCurrency={formatCurrency}
              />
            )}
          </Grid>
        )}

        <SnapshotDetailDialog
          snapshotId={selectedSnapshotId}
          open={selectedSnapshotId !== null}
          onClose={handleCloseSnapshotDetail}
          onSaved={handleRefreshSnapshots}
        />
      </Grid>
    </FormProvider>
  );
};

export default EstimateView;
