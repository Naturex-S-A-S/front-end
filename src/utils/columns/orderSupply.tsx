import { Box, Chip } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";

import { ActionsCell, ProductNamesCell, QuantityCell, DateCell } from "./orderSupplyCells";
import { STATUS_COLOR, STATUS_LABEL } from "../constant";

export const columns = (): GridColDef[] => [
  {
    field: "actions",
    headerName: "Acciones",
    width: 80,
    sortable: false,
    renderCell: params => <ActionsCell orderId={params.row.orderId} />
  },
  {
    field: "orderId",
    headerName: "#",
    width: 70
  },
  {
    field: "batch",
    headerName: "Lote",
    width: 160
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
          size='small'
        />
      </Box>
    )
  },
  {
    field: "quantityExpected",
    headerName: "Cantidad esperada (Kg)",
    width: 150,
    renderCell: params => <QuantityCell value={params.row.quantityExpected} />
  },
  {
    field: "productNames",
    headerName: "Productos",
    flex: 1,
    minWidth: 200,
    renderCell: params => <ProductNamesCell productNames={params.row.productNames ?? []} />
  },
  {
    field: "dateCreated",
    headerName: "Fecha de creación",
    width: 200,
    renderCell: params => <DateCell value={params.row.dateCreated} />
  }
];
