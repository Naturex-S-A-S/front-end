"use client";

import { Box, Grid, Typography } from "@mui/material";
import { Icon } from "@iconify/react";

import { FormProvider } from "react-hook-form";

import useEstimate from "./useEstimate";
import EstimateForm from "./EstimateForm";
import EstimateResultCard from "./EstimateResultCard";
import CurrentPriceCard from "./CurrentPriceCard";
import PriceHistory from "./PriceHistory";
import SnapshotHistory from "./SnapshotHistory";
import SnapshotDetailDialog from "./SnapshotDetailDialog";

const EstimateView = () => {
  const {
    methods,
    productList,
    selectedProduct,
    quantityKg,
    estimate,
    error,
    isEstimating,
    selectedSnapshotId,
    isRegisteringPrice,
    handleProductChange,
    handleQuantityChange,
    handleRegisterPrice,
    handleMaterialChange,
    handleSnapshotDetail,
    handleCloseSnapshotDetail,
    handleRefreshSnapshots,
    handleEstimateEdit
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
          />
        </Grid>

        {selectedProduct && (
          <Grid item xs={12}>
            <CurrentPriceCard productId={selectedProduct.id} />
          </Grid>
        )}

        {estimate && (
          <EstimateResultCard
            estimate={estimate}
            isRegisteringPrice={isRegisteringPrice}
            onMaterialChange={handleMaterialChange}
            onRegisterPrice={handleRegisterPrice}
            onEstimateEdit={handleEstimateEdit}
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

        {selectedProduct && (
          <Grid item xs={12}>
            <PriceHistory productId={selectedProduct.id} />
          </Grid>
        )}

        {selectedProduct && (
          <Grid item xs={12}>
            <SnapshotHistory productId={selectedProduct.id} onViewDetail={handleSnapshotDetail} />
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
