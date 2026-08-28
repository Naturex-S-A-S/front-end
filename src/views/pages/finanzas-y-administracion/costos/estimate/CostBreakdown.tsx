/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, type ChangeEvent } from "react";

import { Grid, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

import CustomCard from "@/@core/components/mui/Card";
import CustomTextField from "@/@core/components/mui/TextField";
import type { ICostEstimate, ICostEstimateMaterial } from "@/types/pages/costs";
import { formatCurrency } from "@/utils/format";

interface Props {
  estimate: ICostEstimate;
  onMaterialChange?: (index: number, value: string) => void;
  onEstimateEdit?: (updatedEstimate: Partial<ICostEstimate>) => void;
}

type MaterialEntry = { material: ICostEstimateMaterial; index: number };

const CostBreakdown = ({ estimate, onMaterialChange, onEstimateEdit }: Props) => {
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
              estimate={estimate}
              type='feedstock'
              onMaterialChange={onMaterialChange}
              onEstimateEdit={onEstimateEdit}
            />
          </CustomCard>
        </Grid>
      )}

      {packagingMaterials.length > 0 && (
        <Grid item xs={12}>
          <CustomCard title='Material de Empaque'>
            <MaterialTable
              materials={packagingMaterials}
              estimate={estimate}
              type='packaging'
              onMaterialChange={onMaterialChange}
              onEstimateEdit={onEstimateEdit}
            />
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
                  <TableCell align='right'>Costo x (kg)</TableCell>
                  <TableCell align='right'>Costo Promedio</TableCell>
                  <TableCell align='right'>Costo Unitario</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {estimate.cifDetails.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align='right'>{formatCurrency(item.amountPerKg)}</TableCell>
                    <TableCell align='right'>{formatCurrency(item.amount)}</TableCell>
                    <TableCell align='right'>{formatCurrency(item.totalAmount)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Totales</TableCell>
                  <TableCell align='right' sx={{ fontWeight: 700 }}>
                    {formatCurrency(estimate.cifDetails.reduce((acc, item) => acc + item.amountPerKg, 0))}
                  </TableCell>
                  <TableCell align='right' sx={{ fontWeight: 700 }}>
                    {formatCurrency(estimate.cifDetails.reduce((acc, item) => acc + item.amount, 0))}
                  </TableCell>
                  <TableCell align='right' sx={{ fontWeight: 700 }}>
                    {formatCurrency(estimate.cifDetails.reduce((acc, item) => acc + item.totalAmount, 0))}
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
  onMaterialChange,
  onEstimateEdit,
  estimate
}: {
  materials: MaterialEntry[];
  type?: "feedstock" | "packaging";
  onMaterialChange?: (index: number, value: string) => void;
  onEstimateEdit?: (updatedEstimate: Partial<ICostEstimate>) => void;
  estimate: ICostEstimate;
}) => {
  const totalCost = materials.reduce((acc, { material: m }) => acc + (m.cost ?? 0), 0);
  const totalBaseCost = materials.reduce((acc, { material: m }) => acc + (m.baseCost ?? 0), 0);
  const totalRealUnitCost = materials.reduce((acc, { material: m }) => acc + (m.realUnitCost ?? 0), 0);

  const totalBaseQuantity = materials.reduce(
    (acc, { material: m }) => acc + (parseFloat(m.baseQuantity as string) || 0),
    0
  );

  useEffect(() => {
    if (onEstimateEdit && estimate) {
      const realTotalCostFeedstock = type === "feedstock" ? totalRealUnitCost : estimate.realTotalCostFeedstock;
      const realTotalCostPackaging = type === "packaging" ? totalRealUnitCost : estimate.realTotalCostPackaging;

      onEstimateEdit({
        realTotalCostFeedstock,
        realTotalCostPackaging,
        realCostMaterialUnit: realTotalCostFeedstock + realTotalCostPackaging
      });
    }
  }, [totalRealUnitCost, type]);

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
              <CustomTextField
                type='text'
                disabled={!onMaterialChange}
                value={mat.baseQuantity ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  onMaterialChange && onMaterialChange(index, e.target.value);
                }}
                InputProps={{ inputProps: { min: 0, step: "any" } }}
                sx={{ width: 50 }}
                size='small'
              />
            </TableCell>
            <TableCell align='right'>{formatCurrency(mat.cost)}</TableCell>
            {type === "feedstock" && <TableCell align='right'>{formatCurrency(mat.baseCost)}</TableCell>}
            <TableCell align='right'>{formatCurrency(mat.realTotalCost)}</TableCell>
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
