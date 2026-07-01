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
                  <TableCell align='right'>Costo Estándar</TableCell>
                  <TableCell align='right'>Costo Real</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {estimate.cifItems.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.cifTypeName}</TableCell>
                    <TableCell align='right'>{formatCurrency(item.stdCost)}</TableCell>
                    <TableCell align='right'>{formatCurrency(item.realCost)}</TableCell>
                  </TableRow>
                ))}
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
}) => (
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Material</TableCell>
        <TableCell align='right'>Cantidad (Kg)</TableCell>
        <TableCell align='right'>Costo (Kg)</TableCell>
        <TableCell align='right'>Costo Total</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {materials.map((mat, idx) => (
        <TableRow key={idx}>
          <TableCell>{mat.materialName}</TableCell>
          <TableCell align='right'>{mat.realQuantity}</TableCell>
          <TableCell align='right'>{formatCurrency(mat.stdUnitCost)}</TableCell>
          <TableCell align='right'>{formatCurrency(mat.realTotalCost)}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default CostBreakdown;
