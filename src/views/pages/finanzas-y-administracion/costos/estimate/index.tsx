"use client";

import { Alert, Box, Grid, Typography } from "@mui/material";
import { Icon } from "@iconify/react";

import { FormProvider } from "react-hook-form";

import useEstimate from "../../../../../hooks/costs/useEstimate";
import useMaterialPrices from "../../../../../hooks/costs/useMaterialPrices";
import EstimateForm from "./EstimateForm";
import EstimateResultCard from "./EstimateResultCard";
import CurrentPriceCard from "./CurrentPriceCard";
import SnapshotHistory from "./SnapshotHistory";
import SnapshotDetailDialog from "./SnapshotDetailDialog";
import PriceHistory from "./PriceHistory";

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
    handleEstimateEdit,
    isTestProduct,
    units,
    unitGramsFinalProduct,
    isDummyEstimating,
    handleUnitsChange,
    handleGramsChange,
    dummyRows,
    cifOverride,
    dummyEstimateError,
    handleAddRow,
    handleRemoveRow,
    handleRowChange,
    handleCifOverrideChange,
    handleCifOverrideReset,
    handleRegisterDummyPrice,
  } = useEstimate();

  const { feedstockPrices, packagingPrices } = useMaterialPrices();

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
            isTestProduct={isTestProduct}
            units={units}
            unitGramsFinalProduct={unitGramsFinalProduct}
            isEstimatingDummy={isDummyEstimating}
            onProductChange={handleProductChange}
            onQuantityChange={handleQuantityChange}
            onUnitsChange={handleUnitsChange}
            onGramsChange={handleGramsChange}
          />
        </Grid>

        {isTestProduct && (
          <Grid item xs={12}>
            <Alert severity='info'>
              Está en modo simulación: elija libremente los materiales y la presentación.
            </Alert>
          </Grid>
        )}

        {dummyEstimateError && (
          <Grid item xs={12}>
            <Alert severity='error'>{dummyEstimateError}</Alert>
          </Grid>
        )}

        {selectedProduct && !isTestProduct && (
          <Grid item xs={12}>
            <CurrentPriceCard productId={selectedProduct.id} />
          </Grid>
        )}

        {estimate && (
          <EstimateResultCard
            estimate={estimate}
            isRegisteringPrice={isRegisteringPrice}
            isTestProduct={isTestProduct}
            dummyRows={dummyRows}
            feedstockPrices={feedstockPrices}
            packagingPrices={packagingPrices}
            isDummyEstimating={isDummyEstimating}
            cifOverride={cifOverride}
            onMaterialChange={handleMaterialChange}
            onRowChange={handleRowChange}
            onRemoveRow={handleRemoveRow}
            onAddRow={handleAddRow}
            onRegisterPrice={isTestProduct ? handleRegisterDummyPrice : handleRegisterPrice}
            onEstimateEdit={handleEstimateEdit}
            onCifOverrideChange={handleCifOverrideChange}
            onCifOverrideReset={handleCifOverrideReset}
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
