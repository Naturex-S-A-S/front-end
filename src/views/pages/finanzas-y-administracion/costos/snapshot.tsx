"use client";

import { Icon } from "@iconify/react";

import { Box, Grid } from "@mui/material";

import CustomAutocomplete from "@/@core/components/mui/Autocomplete";
import CustomCard from "@/@core/components/mui/Card";
import CustomTextField from "@/@core/components/mui/TextField";

import type { ProductOption } from "../../../../hooks/costs/useEstimate";
import SnapshotHistory from "./estimate/SnapshotHistory";
import SnapshotDetailDialog from "./estimate/SnapshotDetailDialog";
import useEstimate from "../../../../hooks/costs/useEstimate";

const Snapshot = () => {
  const {
    productList,
    selectedProduct,
    selectedSnapshotId,
    handleProductChange,
    handleSnapshotDetail,
    handleCloseSnapshotDetail,
    handleRefreshSnapshots
  } = useEstimate();

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <CustomCard
          title={
            <Box display='flex' alignItems='center' gap={2}>
              <Icon icon='mdi:history' fontSize={20} />
              <span>Historial de Snapshots</span>
            </Box>
          }
        >
          <Grid container spacing={4} alignItems='flex-end'>
            <Grid item xs={12} sm={6} md={4}>
              <CustomAutocomplete
                value={selectedProduct}
                options={productList}
                getOptionLabel={(option: ProductOption) => option?.fullName || option?.name || ""}
                onChange={(_: any, v: ProductOption | null) => handleProductChange(v)}
                renderInput={(params: any) => (
                  <CustomTextField {...params} label='Producto' placeholder='Seleccione un producto' />
                )}
              />
            </Grid>
          </Grid>
        </CustomCard>
      </Grid>

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
  );
};

export default Snapshot;
