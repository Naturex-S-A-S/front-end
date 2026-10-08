"use client";

import { Grid } from "@mui/material";

import SnapshotHistory from "./estimate/SnapshotHistory";
import SnapshotDetailDialog from "./estimate/SnapshotDetailDialog";
import useEstimate from "../../../../hooks/costs/useEstimate";

const Snapshot = () => {
  const {
    selectedProduct,
    selectedSnapshotId,
    handleSnapshotDetail,
    handleCloseSnapshotDetail,
    handleRefreshSnapshots
  } = useEstimate();

  return (
    <Grid container spacing={4}>
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
