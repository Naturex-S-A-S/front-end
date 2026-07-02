import { Grid, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

import CustomCard from "@/@core/components/mui/Card";
import type { ICostEstimate, ICostEstimateMaterial } from "@/types/pages/costs";

interface Props {
  estimate: ICostEstimate;
  formatCurrency: (v: number | null | undefined) => string;
}

const CostBreakdown = ({ estimate, formatCurrency }: Props) => {
  const feedstockMaterials = estimate.materials?.filter(m => m.materialType === "feedstock") ?? [];
  const packagingMaterials = estimate.materials?.filter(m => m.materialType === "packaging") ?? [];

  const content = (
    <>
      {feedstockMaterials.length > 0 && (
        <Grid item xs={12}>
          <CustomCard title='Materia Prima'>
            <MaterialTable materials={feedstockMaterials} formatCurrency={formatCurrency} />
          </CustomCard>
        </Grid>
      )}

      {packagingMaterials.length > 0 && (
        <Grid item xs={12}>
          <CustomCard title='Material de Empaque'>
            <MaterialTable materials={packagingMaterials} formatCurrency={formatCurrency} />
          </CustomCard>
        </Grid>
      )}

      {estimate.cifItems.length > 0 && (
        <Grid item xs={12}>
          <CustomCard title='Costos Indirectos de Fabricación (CIF)'>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tipo CIF</TableCell>
                  <TableCell align='right'>Base</TableCell>
                  <TableCell align='right'>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {estimate.cifItems.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.cifTypeName}</TableCell>
                    <TableCell align='right'>{item.costBasis}</TableCell>
                    <TableCell align='right'>{formatCurrency(item.totalAmount)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Totales</TableCell>
                  <TableCell align='right' sx={{ fontWeight: 700 }}>
                    —
                  </TableCell>
                  <TableCell align='right' sx={{ fontWeight: 700 }}>
                    {formatCurrency(estimate.cifItems.reduce((acc, item) => acc + item.totalAmount, 0))}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CustomCard>
        </Grid>
      )}
    </>
  );

  return (
    <Grid container spacing={4}>
      {content}
    </Grid>
  );
};

const MaterialTable = ({
  materials,
  formatCurrency
}: {
  materials: ICostEstimateMaterial[];
  formatCurrency: (v: number | null | undefined) => string;
}) => {
  const totalRealQuantity = materials.reduce((acc, m) => acc + (m.realQuantity ?? 0), 0);
  const totalStdTotalCost = materials.reduce((acc, m) => acc + m.stdTotalCost, 0);

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Material</TableCell>
          <TableCell align='right'>Cantidad base (Kg)</TableCell>
          <TableCell align='right'>Costo base (Kg)</TableCell>
          <TableCell align='right'>Cantidad total (Kg)</TableCell>
          <TableCell align='right'>Costo Total</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {materials.map((mat, idx) => (
          <TableRow key={idx}>
            <TableCell>{mat.materialName}</TableCell>
            <TableCell align='right'>{mat.stdQuantity}</TableCell>
            <TableCell align='right'>{formatCurrency(mat.stdUnitCost)}</TableCell>
            <TableCell align='right'>{mat.realQuantity?.toFixed(2)}</TableCell>
            <TableCell align='right'>{formatCurrency(mat.stdTotalCost)}</TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell sx={{ fontWeight: 700 }}>Totales</TableCell>
          <TableCell />
          <TableCell />
          <TableCell align='right' sx={{ fontWeight: 700 }}>
            {totalRealQuantity.toFixed(2)}
          </TableCell>
          <TableCell align='right' sx={{ fontWeight: 700 }}>
            {formatCurrency(totalStdTotalCost)}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default CostBreakdown;
