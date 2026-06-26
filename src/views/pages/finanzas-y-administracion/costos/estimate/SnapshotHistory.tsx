import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import moment from "moment";

import CustomCard from "@/@core/components/mui/Card";
import CustomButton from "@/@core/components/mui/Button";
import { usePagination, PaginationBar } from "@/@core/components/pagination";
import type { ICostSnapshotSummary } from "@/types/pages/costs";

const ITEMS_PER_PAGE = 5;

interface Props {
  snapshots: ICostSnapshotSummary[];
  onViewDetail: (id: number) => void;
  formatCurrency: (v: number | null | undefined) => string;
}

const typeConfig: Record<string, { label: string; icon: string; color: string }> = {
  estimation: { label: "Estimación", icon: "mdi:calculator-variant-outline", color: "info.main" },
  order_close: { label: "Cierre de orden", icon: "mdi:package-variant-closed", color: "success.main" }
};

const SnapshotHistory = ({ snapshots, onViewDetail, formatCurrency }: Props) => {
  if (snapshots.length === 0) return null;

  const { paginatedData, page, setPage, pageCount } = usePagination(snapshots, ITEMS_PER_PAGE);

  return (
    <CustomCard
      title={
        <Box display='flex' alignItems='center' gap={2}>
          <Icon icon='mdi:history' fontSize={20} />
          <span>Historial de Snapshots ({snapshots.length})</span>
        </Box>
      }
    >
      <Box sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell align='right'>Cantidad (kg)</TableCell>
              <TableCell align='right'>Costo Total ($/kg)</TableCell>
              <TableCell>Notas</TableCell>
              <TableCell align='center' />
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map(snapshot => {
              const type = typeConfig[snapshot.snapshotType] ?? typeConfig.estimation;

              return (
                <TableRow key={snapshot.id}>
                  <TableCell>
                    <Typography variant='body2'>{moment(snapshot.dateSnapshot).format("DD/MM/YY HH:mm")}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box display='flex' alignItems='center' gap={1}>
                      <Icon icon={type.icon} fontSize={18} color={type.color} />
                      <Typography variant='body2'>{type.label}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align='right'>{snapshot.quantityKg}</TableCell>
                  <TableCell align='right'>{formatCurrency(snapshot.costTotalKg)}</TableCell>
                  <TableCell>
                    <Typography variant='body2' color='text.secondary' sx={{ maxWidth: 200 }} noWrap>
                      {snapshot.notes || "—"}
                    </Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <CustomButton size='small' onClick={() => onViewDetail(snapshot.id)}>
                      Ver detalle
                    </CustomButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <PaginationBar page={page} count={pageCount} onChange={setPage} />
    </CustomCard>
  );
};

export default SnapshotHistory;
