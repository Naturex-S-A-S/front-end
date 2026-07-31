import { Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";

import type { MaterialTypeKey } from "@/utils/enum";

type Props = {
  title: string;
  type: MaterialTypeKey;
  items: { name: string; quantityFormulation: number; quantityTotalOrder: number; type: MaterialTypeKey | string }[];
  quantityLabel?: string;
};

const MaterialTable = ({ title, type, items = [], quantityLabel = "Cantidad" }: Props) => {
  const filtered = items.filter((m: any) => m.type === type);
  const sumQuantity = filtered.reduce((acc: number, item: any) => acc + (Number(item.quantityFormulation) || 0), 0);
  const sumTotal = filtered.reduce((acc: number, item: any) => acc + (Number(item.quantityTotalOrder) || 0), 0);

  return (
    <Card sx={{ width: "100%" }}>
      <CardContent>
        <Typography variant='h6' sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Descripcion</TableCell>
              <TableCell>{quantityLabel}</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((item: any, index: number) => (
              <TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.quantityFormulation}</TableCell>
                <TableCell>{item.quantityTotalOrder}</TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ "& td": { fontWeight: 700, borderTop: "2px solid" } }}>
              <TableCell>Total</TableCell>
              <TableCell>{sumQuantity}</TableCell>
              <TableCell>{sumTotal}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default MaterialTable;
