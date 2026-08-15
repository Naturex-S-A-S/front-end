import type { ChangeEvent } from "react";

import { Grid, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";

import CustomCard from "@/@core/components/mui/Card";
import CustomTextField from "@/@core/components/mui/TextField";
import type { ICostEstimate, ICostEstimateMaterial } from "@/types/pages/costs";
import { formatCurrency } from "@/utils/format";

interface Props {
  estimate: ICostEstimate;
  onMaterialChange?: (index: number, value: string) => void;
}

type MaterialEntry = { material: ICostEstimateMaterial; index: number };

const CostBreakdown = ({ estimate, onMaterialChange }: Props) => {
  const materialWithIndex = estimate.materials?.map((m, i) => ({ material: m, index: i })) ?? [];
  const feedstockMaterials = materialWithIndex.filter(m => m.material.materialType === "feedstock");
  const packagingMaterials = materialWithIndex.filter(m => m.material.materialType === "packaging");

  return (
    <Grid container spacing={4}>
      {feedstockMaterials.length > 0 && (
        <Grid item xs={12}>
          <CustomCard title='Materia Prima'>
            <MaterialTable materials={feedstockMaterials} type='feedstock' onMaterialChange={onMaterialChange} />
          </CustomCard>
        </Grid>
      )}

      {packagingMaterials.length > 0 && (
        <Grid item xs={12}>
          <CustomCard title='Material de Empaque'>
            <MaterialTable materials={packagingMaterials} type='packaging' onMaterialChange={onMaterialChange} />
          </CustomCard>
        </Grid>
      )}

      {estimate.cifDetails.length > 0 && (
        <Grid item xs={12}>
          <CustomCard title='Costos Indirectos de Fabricación (CIF)'>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tipo CIF</TableCell>
                  <TableCell align='right'>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {estimate.cifDetails.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align='right'>{formatCurrency(item.amount)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Totales</TableCell>
                  <TableCell align='right' sx={{ fontWeight: 700 }}>
                    {formatCurrency(estimate.cifDetails.reduce((acc, item) => acc + item.amount, 0))}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CustomCard>
        </Grid>
      )}
    </Grid>
  );
};

const MaterialTable = ({
  materials,
  type,
  onMaterialChange
}: {
  materials: MaterialEntry[];
  type?: "feedstock" | "packaging";
  onMaterialChange?: (index: number, value: string) => void;
}) => {
  const totalCost = materials.reduce((acc, { material: m }) => acc + (m.cost ?? 0), 0);
  const totalBaseCost = materials.reduce((acc, { material: m }) => acc + (m.baseCost ?? 0), 0);
  const totalRealUnitCost = materials.reduce((acc, { material: m }) => acc + (m.realUnitCost ?? 0), 0);

  const totalBaseQuantity = materials.reduce(
    (acc, { material: m }) => acc + (parseFloat(m.baseQuantity as string) || 0),
    0
  );

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Material</TableCell>
          <TableCell width={150} align='right'>
            {type === "feedstock" ? "Cantidad base (g)" : "Unidades base"}
          </TableCell>

          <TableCell width={150} align='right'>
            {type === "feedstock" ? "Costo x (g)" : "Costo x (unidad)"}
          </TableCell>
          {type === "feedstock" && <TableCell align='right'>Costo Base</TableCell>}
          <TableCell align='right'>Costo Unitario</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {materials.map(({ material: mat, index }) => (
          <TableRow key={index}>
            <TableCell>{mat.materialName}</TableCell>
            <TableCell align='right'>
              {onMaterialChange ? (
                <CustomTextField
                  type='text'
                  value={mat.baseQuantity ?? ""}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    onMaterialChange(index, e.target.value);
                  }}
                  InputProps={{ inputProps: { min: 0, step: "any" } }}
                  sx={{ width: 50 }}
                  size='small'
                />
              ) : (
                <Typography variant='body2'>{mat.baseQuantity ?? ""}</Typography>
              )}
            </TableCell>
            <TableCell align='right'>{formatCurrency(mat.cost)}</TableCell>
            {type === "feedstock" && <TableCell align='right'>{formatCurrency(mat.baseCost)}</TableCell>}
            <TableCell align='right'>{formatCurrency(mat.realUnitCost)}</TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell sx={{ fontWeight: 700 }}>Totales</TableCell>
          <TableCell align='left'>{totalBaseQuantity.toFixed(2)}</TableCell>
          <TableCell align='right'>{formatCurrency(totalCost)}</TableCell>
          {type === "feedstock" && (
            <TableCell align='right' sx={{ fontWeight: 700 }}>
              {formatCurrency(totalBaseCost)}
            </TableCell>
          )}
          <TableCell align='right' sx={{ fontWeight: 700 }}>
            {formatCurrency(totalRealUnitCost)}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default CostBreakdown;
