import type { ChangeEvent } from "react";

import { Grid, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

import CustomCard from "@/@core/components/mui/Card";
import CustomTextField from "@/@core/components/mui/TextField";
import type { ICostEstimate, ICostEstimateMaterial } from "@/types/pages/costs";

interface Props {
  estimate: ICostEstimate;
  formatCurrency: (v: number | null | undefined) => string;
  onMaterialChange?: (index: number, field: "stdQuantity" | "stdUnitCost", value: number) => void;
}

type MaterialEntry = { material: ICostEstimateMaterial; index: number };

const CostBreakdown = ({ estimate, formatCurrency, onMaterialChange }: Props) => {
  const materialWithIndex = estimate.materials?.map((m, i) => ({ material: m, index: i })) ?? [];
  const feedstockMaterials = materialWithIndex.filter(m => m.material.materialType === "feedstock");
  const packagingMaterials = materialWithIndex.filter(m => m.material.materialType === "packaging");

  return (
    <Grid container spacing={4}>
      {feedstockMaterials.length > 0 && (
        <Grid item xs={12}>
          <CustomCard title='Materia Prima'>
            <MaterialTable
              materials={feedstockMaterials}
              formatCurrency={formatCurrency}
              type='feedstock'
              onMaterialChange={onMaterialChange}
            />
          </CustomCard>
        </Grid>
      )}

      {packagingMaterials.length > 0 && (
        <Grid item xs={12}>
          <CustomCard title='Material de Empaque'>
            <MaterialTable
              materials={packagingMaterials}
              formatCurrency={formatCurrency}
              type='packaging'
              onMaterialChange={onMaterialChange}
            />
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
    </Grid>
  );
};

const MaterialTable = ({
  materials,
  formatCurrency,
  type,
  onMaterialChange
}: {
  materials: MaterialEntry[];
  formatCurrency: (v: number | null | undefined) => string;
  type?: "feedstock" | "packaging";
  onMaterialChange?: (index: number, field: "stdQuantity" | "stdUnitCost", value: number) => void;
}) => {
  const totalRealQuantity = materials.reduce((acc, { material: m }) => acc + (m.realQuantity ?? 0), 0);
  const totalStdTotalCost = materials.reduce((acc, { material: m }) => acc + m.stdTotalCost, 0);

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Material</TableCell>
          <TableCell width={150} align='right'>
            {type === "feedstock" ? "Cantidad (Kg)" : "Unidades base"}
          </TableCell>
          <TableCell width={150} align='right'>
            {type === "feedstock" ? "Costo base (Kg)" : "Costo base"}
          </TableCell>
          <TableCell align='right'>{type === "feedstock" ? "Cantidad (Kg)" : "Total unidades"}</TableCell>
          <TableCell align='right'>Costo Total</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {materials.map(({ material: mat, index }) => (
          <TableRow key={index}>
            <TableCell>{mat.materialName}</TableCell>
            <TableCell align='right'>
              <CustomTextField
                type='number'
                value={mat.stdQuantity}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onMaterialChange?.(index, "stdQuantity", Number(e.target.value))
                }
                InputProps={{ inputProps: { min: 0, step: "any" } }}
                sx={{ width: 50 }}
                size='small'
              />
            </TableCell>
            <TableCell align='right'>
              <CustomTextField
                type='number'
                value={mat.stdUnitCost}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onMaterialChange?.(index, "stdUnitCost", Number(e.target.value))
                }
                InputProps={{ inputProps: { min: 0, step: "any" } }}
                sx={{ width: 50 }}
                size='small'
              />
            </TableCell>
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
