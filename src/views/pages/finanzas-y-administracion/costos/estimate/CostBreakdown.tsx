/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, type ChangeEvent } from "react";

import {
  Grid,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";

import CustomCard from "@/@core/components/mui/Card";
import CustomTextField from "@/@core/components/mui/TextField";
import MaterialRow from "./MaterialRow";
import type { ICostEstimate, ICostEstimateMaterial, IDummySimulationRow, IMaterialPriceOption } from "@/types/pages/costs";
import { formatCurrency } from "@/utils/format";

interface Props {
  estimate: ICostEstimate;
  isTestProduct?: boolean;
  dummyRows?: IDummySimulationRow[];
  feedstockPrices?: IMaterialPriceOption[];
  packagingPrices?: IMaterialPriceOption[];
  isDummyEstimating?: boolean;
  onRowChange?: (localId: string, field: "unitCost" | "quantity", value: number | string) => void;
  onRemoveRow?: (localId: string) => void;
  onAddRow?: (materialType: "feedstock" | "packaging", option: IMaterialPriceOption) => void;
  onMaterialChange?: (index: number, value: string) => void;
  onEstimateEdit?: (updatedEstimate: Partial<ICostEstimate>) => void;
}

type MaterialEntry = { material: ICostEstimateMaterial; index: number };

type DummyComputedMatch = { row: IDummySimulationRow; computed: ICostEstimateMaterial | null };

// Empareja cada fila local con su material calculado por el servidor
// (por tipo + id de material, en orden) para mostrar las columnas calculadas.
const matchComputedMaterials = (
  rows: IDummySimulationRow[],
  computed: ICostEstimateMaterial[]
): DummyComputedMatch[] => {
  const pool = [...computed];

  return rows.map(row => {
    const index = pool.findIndex(
      material => material.materialType === row.materialType && String(material.idMaterial) === String(row.idMaterial)
    );

    const found = index >= 0 ? pool.splice(index, 1)[0] : null;

    return { row, computed: found };
  });
};

const CostBreakdown = ({ estimate, isTestProduct, dummyRows, feedstockPrices, packagingPrices, isDummyEstimating, onRowChange, onRemoveRow, onAddRow, onMaterialChange, onEstimateEdit }: Props) => {
  const materialWithIndex = estimate.materials?.map((m, i) => ({ material: m, index: i })) ?? [];
  const feedstockMaterials = materialWithIndex.filter(m => m.material.materialType === "feedstock");
  const packagingMaterials = materialWithIndex.filter(m => m.material.materialType === "packaging");

  return (
    <Grid container spacing={4}>
      {isTestProduct ? (
        <Grid item xs={12}>
          <CustomCard title='Materia Prima' sx={{ mb: 4 }}>
            <DummyMaterialTable
              rows={dummyRows ?? []}
              type="feedstock"
              computed={feedstockMaterials.map(entry => entry.material)}
              options={feedstockPrices ?? []}
              isPending={isDummyEstimating}
              onRowChange={onRowChange}
              onRemoveRow={onRemoveRow}
              onAddRow={onAddRow}
            />
          </CustomCard>
          <CustomCard title='Material de Empaque'>
            <DummyMaterialTable
              rows={dummyRows ?? []}
              type="packaging"
              computed={packagingMaterials.map(entry => entry.material)}
              options={packagingPrices ?? []}
              isPending={isDummyEstimating}
              onRowChange={onRowChange}
              onRemoveRow={onRemoveRow}
              onAddRow={onAddRow}
            />
          </CustomCard>
        </Grid>
      ) : (
        <>
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
        </>
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

const DummyMaterialTable = ({
  rows,
  type,
  computed = [],
  options,
  isPending,
  onAddRow,
  onRowChange,
  onRemoveRow
}: {
  rows: IDummySimulationRow[];
  type: "feedstock" | "packaging";
  computed?: ICostEstimateMaterial[];
  options: IMaterialPriceOption[];
  isPending?: boolean;
  onAddRow?: (materialType: "feedstock" | "packaging", option: IMaterialPriceOption) => void;
  onRowChange?: (localId: string, field: "unitCost" | "quantity", value: number | string) => void;
  onRemoveRow?: (localId: string) => void;
}) => {
  const filtered = rows.filter(row => row.materialType === type);

  const matched = matchComputedMaterials(
    filtered,
    computed.filter(material => material.materialType === type)
  );

  const priceLabel = type === "feedstock" ? "Costo x (g)" : "Costo x (unidad)";
  const qtyLabel = type === "feedstock" ? "Cantidad base (g)" : "Unidades base";

  const totalCost = matched.reduce((acc, { computed: material }) => acc + (material?.cost ?? 0), 0);
  const totalBaseCost = matched.reduce((acc, { computed: material }) => acc + (material?.baseCost ?? 0), 0);
  const totalRealUnitCost = matched.reduce((acc, { computed: material }) => acc + (material?.realUnitCost ?? 0), 0);

  const totalBaseQuantity = matched.reduce(
    (acc, { computed: material }) => acc + (parseFloat(material?.baseQuantity as string) || 0),
    0
  );

  const availableOptions = options.filter(
    option => !rows.some(row => String(row.idMaterial) === String(option.id))
  );

  const pickerHint =
    options.length === 0
      ? "Sin precios de referencia para este tipo de material"
      : availableOptions.length === 0
        ? "Ya agregaste todos los materiales disponibles"
        : undefined;

  const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = availableOptions.find(option => String(option.id) === event.target.value);

    if (selected) onAddRow?.(type, selected);
  };

  return (
    <>
      <TextField
        select
        size="small"
        fullWidth
        label={type === "feedstock" ? "Agregar materia prima" : "Agregar material de empaque"}
        value=""
        onChange={handleSelect}
        disabled={isPending || availableOptions.length === 0}
        helperText={pickerHint}
        sx={{ maxWidth: 380, mb: 3 }}
      >
        <MenuItem value="" disabled>
          Seleccione un material
        </MenuItem>
        {availableOptions.map(option => {
          const price = type === "feedstock" ? option.pricePerGram : option.pricePerUnit;

          return (
            <MenuItem key={option.id} value={String(option.id)}>
              {option.name} — {price && price > 0 ? `${formatCurrency(price)}/${type === "feedstock" ? "g" : "u"}` : "sin precio"}
            </MenuItem>
          );
        })}
      </TextField>

      {filtered.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Todavia no agregaste materiales de {type === "feedstock" ? "materia prima" : "empaque"}.
        </Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Material</TableCell>
              <TableCell width={150} align='right'>
                {qtyLabel}
              </TableCell>
              <TableCell width={150} align='right'>
                {priceLabel}
              </TableCell>
              {type === "feedstock" && <TableCell align='right'>Costo Base</TableCell>}
              <TableCell align='right'>Costo Unitario</TableCell>
              <TableCell width={60} />
            </TableRow>
          </TableHead>
          <TableBody>
            {matched.map(({ row, computed: material }) => (
              <MaterialRow
                key={row.localId}
                row={row}
                computed={material}
                isPending={Boolean(isPending)}
                onChange={onRowChange ?? (() => { })}
                onRemove={onRemoveRow ?? (() => { })}
              />
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
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      )}
    </>
  );
};

export default CostBreakdown;
