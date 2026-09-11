"use client";
import { Typography } from "@mui/material";

import type { ISaleOrderKardex } from "@/types/pages/saleOrder";
import CustomDataGrid from "@/@core/components/mui/DataGrid";
import { columns } from "@/utils/columns/saleOrderKardex";
import CustomCard from "@/@core/components/mui/Card";

interface IProps {
  data: ISaleOrderKardex[];
}

const Kardex: React.FC<IProps> = ({ data }) => {
  return (
    <CustomCard>
      <Typography variant='h6' mb={2}>
        Movimientos
      </Typography>
      {data.length === 0 ? (
        <Typography variant='body2' color='textSecondary'>
          No hay movimientos registrados
        </Typography>
      ) : (
        <CustomDataGrid columns={columns()} data={data} />
      )}
    </CustomCard>
  );
};

export default Kardex;
