import type { FC } from "react";

import { useRouter } from "next/navigation";

import type { GridColDef } from "@mui/x-data-grid";

import { Box, Chip, Tooltip } from "@mui/material";

import { ActionButton } from "./components/ActionButton";
import { formatDate } from "../format";
import { STATUS_COLOR, STATUS_LABEL } from "../constant";

const MAX_VISIBLE = 2;
const MAX_LABEL_LENGTH = 14;

const ChipsList: FC<{ values: string[] }> = ({ values }) => {
  if (!Array.isArray(values)) return null;

  const visible = values.slice(0, MAX_VISIBLE);
  const remaining = values.slice(MAX_VISIBLE);

  return (
    <div className='flex gap-2 items-center' style={{ height: "100%" }}>
      {visible.map((value, i) => (
        value ? <Tooltip key={i} title={value}>
          <Chip
            label={value.length > MAX_LABEL_LENGTH ? `${value.slice(0, MAX_LABEL_LENGTH)}…` : value}
            variant='outlined'
          />
        </Tooltip> : null
      ))}
      {remaining?.length > 0 && (
        <Tooltip
          title={
            <div>
              {remaining.map((value, i) => (
                <div key={i}>{value}</div>
              ))}
            </div>
          }
        >
          <Chip label={`+${remaining.length}`} variant='outlined' />
        </Tooltip>
      )}
    </div>
  );
};

export const useColumns = (): GridColDef[] => {
  const router = useRouter();

  return [
    {
      field: "actions",
      headerName: "Acciones",
      width: 80,
      sortable: false,
      renderCell: params => (
        <ActionButton icon='mdi:eye-outline' onClick={() => router.push(`/produccion/ordenes/${params.row.orderId}`)} />
      )
    },
    {
      field: "orderId",
      headerName: "#",
      width: 70
    },
    {
      field: "batch",
      headerName: "Lote",
      width: 130
    },
    {
      field: "status",
      headerName: "Estado",
      width: 130,
      renderCell: params => (
        <Box className='flex items-center' style={{ height: "100%" }}>
          <Chip
            label={params.row.statusName ?? STATUS_LABEL[params.row.status]}
            color={STATUS_COLOR[params.row.status] ?? "default"}
            variant='outlined'
          />
        </Box>
      )
    },
    {
      field: "quantityExpected",
      headerName: "Cantidad esperada (Kg)",
      width: 180
    },
    {
      field: "quantityProduced",
      headerName: "Cantidad producida (Kg)",
      width: 180
    },
    {
      field: "lossPercentage",
      headerName: "Faltante %",
      width: 150
    },
    {
      field: "productNames",
      headerName: "Productos",
      flex: 1,
      minWidth: 200,
      renderCell: params => <ChipsList values={params.row.productNames ?? []} />
    },
    {
      field: "lots",
      headerName: "Lotes",
      flex: 1,
      minWidth: 200,
      renderCell: params => <ChipsList values={(params.row.lots ?? [])} />
    },
    {
      field: "dateCreated",
      headerName: "Fecha de creación",
      width: 200,
      renderCell: params => formatDate(params.row.dateCreated)
    }
  ];
};
