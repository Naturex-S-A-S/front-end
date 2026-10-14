"use client";

import { useState } from "react";

import { Grid } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";

import CurrentSnapshotsHistory from "./estimate/CurrentSnapshotsHistory";
import SnapshotDetailDialog from "./estimate/SnapshotDetailDialog";

const Snapshot = () => {
  const queryClient = useQueryClient();
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<number | null>(null);

  const handleSnapshotDetail = (id: number) => setSelectedSnapshotId(id);
  const handleCloseSnapshotDetail = () => setSelectedSnapshotId(null);

  const handleRefreshSnapshots = () => {
    queryClient.invalidateQueries({ queryKey: ["current-snapshots"] });
  };

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <CurrentSnapshotsHistory onViewDetail={handleSnapshotDetail} />
      </Grid>

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
