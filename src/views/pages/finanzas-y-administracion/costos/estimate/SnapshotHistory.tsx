"use client";

import { useMemo } from "react";

import { Box, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import type { GridColDef } from "@mui/x-data-grid";

import CustomCard from "@/@core/components/mui/Card";
import CustomDataGrid from "@/@core/components/mui/DataGrid";
import Loader from "@/@core/components/react-spinners";
import { formatCurrency } from "@/utils/format";
import { getProductSnapshotsAction } from "@/api/costs/actions";
import { ActionButton } from "@/utils/columns/components/ActionButton";

interface Props {
  productId: string;
  onViewDetail: (id: number) => void;
}

const SnapshotHistory = ({ productId, onViewDetail }: Props) => {
  const { data: snapshots, isLoading } = useQuery({
    queryKey: ["product-snapshots", productId],
    queryFn: () => getProductSnapshotsAction(productId),
    select: result => (result.success ? result.data.map((item, i) => ({ ...item, id: item?.id ?? i })) : []),
    enabled: !!productId
  });

  const cifDetailNames = useMemo(() => {
    if (!snapshots) return [];

    const seen = new Set<string>();

    for (const item of snapshots) {
      for (const detail of item?.cifDetails) {
        if (detail?.name) {
          seen.add(detail.name);
        }
      }
    }

    return Array.from(seen);
  }, [snapshots]);

  const cifDetailNamesTotal = useMemo(() => {
    if (!snapshots) return [];

    const seen = new Set<string>();

    for (const item of snapshots) {
      for (const detail of item?.cifDetails) {
        if (detail?.name) {
          seen.add(`Total ${detail.name}`);
        }
      }
    }

    return Array.from(seen);
  }, [snapshots]);

  const columns: GridColDef[] = useMemo(() => {
    const baseColumns: GridColDef[] = [
      /*{
        field: "productId",
        headerName: "Codigo",
        flex: 1,
        minWidth: 120
      },
      {
        field: "productFullName",
        headerName: "Producto",
        flex: 1,
        minWidth: 200
      }, */

      {
        field: "inventoryUnits",
        headerName: "Unidades",
        flex: 1,
        minWidth: 100
      },
      {
        field: "totalCostWithWaste",
        headerName: "Costo",
        flex: 1,
        minWidth: 120,
        renderCell: params => <>{formatCurrency(params.value)}</>
      },
      {
        field: "wastePct",
        headerName: "Desperdicio %",
        width: 110,
        type: "number",
        renderCell: params => <>{params.value ? `${params.value} %` : "-"}</>
      },
      {
        field: "wasteValue",
        headerName: "Desperdicio",
        width: 150,
        type: "number",
        renderCell: params => <>{formatCurrency(params.value)}</>
      },
      {
        field: "finalPrice",
        headerName: "Precio Venta",
        width: 140,
        type: "number",
        renderCell: params => <>{formatCurrency(params.value)}</>
      },
      {
        field: "costDifference",
        headerName: "Diferencia",
        width: 120,
        type: "number",
        renderCell: params => <>{formatCurrency(params.value)}</>
      },
      {
        field: "utilityPct",
        headerName: "Utilidad",
        width: 120,
        type: "string",
        renderCell: params => (
          <Typography variant='caption' color={params.row.marginWarning ? "warning.main" : "success.main"}>
            {params.value ? `${params.value.toFixed(2)} %` : "-"}
          </Typography>
        )
      },
      {
        field: "totalInventoryCost",
        headerName: "Total a Costo",
        width: 140,
        type: "number",
        renderCell: params => <>{formatCurrency(params.value)}</>
      },
      {
        field: "totalInventoryFinalPrice",
        headerName: "Total a PV",
        width: 140,
        type: "number",
        renderCell: params => <>{formatCurrency(params.value)}</>
      },
      {
        field: "totalInventoryCostWaste",
        headerName: "Total Desperdicio",
        width: 150,
        type: "number",
        renderCell: params => <>{formatCurrency(params.value)}</>
      },
      {
        field: "totalInventoryMarginAmount",
        headerName: "Total Diferencia",
        width: 140,
        type: "number",
        renderCell: params => <>{formatCurrency(params.value)}</>
      },
      {
        field: "totalInventoryKgProduced",
        headerName: "Total Kg Producidos",
        width: 140,
        type: "number",
        renderCell: params => <>{formatCurrency(params.value)}</>
      }
    ];

    const cifColumns: GridColDef[] = cifDetailNames.map(name => ({
      field: `cif_${name}`,
      headerName: name,
      width: 150,
      type: "number",
      renderCell: params => {
        const detail = params.row.cifDetails?.find((d: { name: string }) => d.name === name);

        return <>{formatCurrency(detail?.totalAmount)}</>;
      }
    }));

    const cifTotalColumns: GridColDef[] = cifDetailNamesTotal.map(name => ({
      field: `cif_${name}`,
      headerName: name,
      width: 150,
      type: "number",
      renderCell: params => {
        const detail = params.row.cifDetails?.find((d: { name: string }) => `Total ${d.name}` === name);

        return <>{formatCurrency(detail?.totalInventoryAmount)}</>;
      }
    }));

    const actionColumn: GridColDef = {
      field: "actions",
      headerName: "Acciones",
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: params => (
        <ActionButton icon='mdi:eye-outline' size='small' onClick={() => onViewDetail(params.row.id)} />
      )
    };

    return [actionColumn, ...baseColumns, ...cifColumns, ...cifTotalColumns];
  }, [cifDetailNames, onViewDetail, cifDetailNamesTotal]);

  if (isLoading) {
    return (
      <Box py={4} display='flex' justifyContent='center'>
        <Loader type='component' />
      </Box>
    );
  }

  if (!snapshots || snapshots.length === 0) return null;

  return (
    <CustomCard
      title={
        <Box display='flex' alignItems='center' gap={2}>
          <Icon icon='mdi:history' fontSize={20} />
          <span>Historial de Snapshots ({snapshots.length})</span>
        </Box>
      }
    >
      <CustomDataGrid columns={columns} data={snapshots} />
    </CustomCard>
  );
};

export default SnapshotHistory;
