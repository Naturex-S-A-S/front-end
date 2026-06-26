import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import moment from "moment";

import CustomCard from "@/@core/components/mui/Card";
import type { IProductPrice } from "@/types/pages/costs";

interface Props {
  prices: IProductPrice[];
  formatCurrency: (v: number | null | undefined) => string;
}

const PriceHistory = ({ prices, formatCurrency }: Props) => {
  if (prices.length === 0) return null;

  return (
    <CustomCard
      title={
        <Box display='flex' alignItems='center' gap={2}>
          <Icon icon='mdi:history' fontSize={20} />
          <span>Historial de Precios ({prices.length})</span>
        </Box>
      }
    >
      <Box sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell align='right'>Precio Final</TableCell>
              <TableCell align='right'>Margen</TableCell>
              <TableCell>Vigente Desde</TableCell>
              <TableCell>Vigente Hasta</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Notas</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prices.map(price => (
              <TableRow key={price.id}>
                <TableCell>
                  <Typography variant='body2'>
                    {moment(price.dateCreated).format("DD/MM/YY HH:mm")}
                  </Typography>
                </TableCell>
                <TableCell align='right'>
                  <Typography variant='body2' fontWeight={600}>
                    {formatCurrency(price.finalPrice)}
                  </Typography>
                </TableCell>
                <TableCell align='right'>
                  <Typography
                    variant='body2'
                    color={price.marginWarning ? "warning.main" : "text.primary"}
                  >
                    {price.marginPct.toFixed(2)}%
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>
                    {moment(price.effectiveFrom).format("DD/MM/YYYY")}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>
                    {price.effectiveTo ? moment(price.effectiveTo).format("DD/MM/YYYY") : "—"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>{price.nameUser.split(" ")[0]}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body2' color='text.secondary' sx={{ maxWidth: 200 }} noWrap>
                    {price.notes || "—"}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </CustomCard>
  );
};

export default PriceHistory;
