"use client";

import { useMemo, useState, useTransition, useCallback, useEffect } from "react";

import { useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";

import { useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";

import useCostConfig from "@/hooks/costs/useCostConfig";
import useDebouncedEstimate from "@/hooks/costs/useDebouncedEstimate";
import {
  getCostEstimateAction,
  registerProductPrice,
  updateSnapshotAction,
  saveDummyProductAction,
  updateDummySnapshotAction
} from "@/api/costs/actions";
import type { ICostEstimate, IDummySimulationRow, IMaterialPriceOption } from "@/types/pages/costs";
import { registerPriceSchema, type RegisterPriceFormValues } from "@/utils/schemas/costs";
import {
  applyMaterialQuantityChange,
  mapMaterialsToPriceInput,
  createEmptySimulation,
  buildDummyMaterialsPayload,
  applyCifOverride
} from "@/utils/costs";
import useGetProduct from "../product/useGetProduct";

export type ProductOption = {
  id: string;
  fullName?: string;
  name?: string;
  isTestProduct?: boolean;
};

export type UseEstimateOptions = {
  snapshotId?: number | null;
  onSaved?: () => void;
};

const useEstimate = ({ snapshotId = null, onSaved }: UseEstimateOptions = {}) => {
  const { product: productList } = useGetProduct({ includeTestProducts: true });
  const queryClient = useQueryClient();

  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);
  const [quantityKg, setQuantityKg] = useState<number>(1);
  const [estimate, setEstimate] = useState<ICostEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEstimating, startEstimateTransition] = useTransition();

  const [selectedSnapshotId, setSelectedSnapshotId] = useState<number | null>(null);

  const { costConfig } = useCostConfig();

  const {
    estimate: dummyEstimate,
    isEstimating: isDummyEstimating,
    error: dummyEstimateError,
    runEstimate,
    reset: resetDummyEstimate
  } = useDebouncedEstimate();

  const [dummyRows, setDummyRows] = useState<IDummySimulationRow[]>([]);
  const [cifOverride, setCifOverride] = useState<number | null>(null);
  const [units, setUnits] = useState<number | string>(1);
  const [unitGramsFinalProduct, setUnitGramsFinalProduct] = useState<number | string>(100);

  const isTestProduct = Boolean(selectedProduct?.isTestProduct);
  const effectiveCif = cifOverride ?? estimate?.totalCif ?? 0;

  const methods = useForm<RegisterPriceFormValues>({
    defaultValues: {
      wastePct: 0,
      comissionPct: 0,
      finalPrice: undefined,
      priceNotes: "",
      isDefinitive: false,
      materials: []
    },
    resolver: yupResolver(registerPriceSchema) as any
  });

  const wastePct = methods.watch("wastePct");
  const finalPrice = methods.watch("finalPrice");
  const commissionPct = methods.watch("comissionPct");

  const [isRegisteringPrice, startPriceTransition] = useTransition();

  const loadEstimate = (data: ICostEstimate) => {
    setEstimate(data);
    methods.reset({
      wastePct: data.wastePct,
      comissionPct: data?.price?.commissionPct ?? 0,
      finalPrice: data?.price?.finalPrice ?? 0,
      priceNotes: data.notes ?? "",
      isDefinitive: false,
      materials: mapMaterialsToPriceInput(data)
    });
  };

  const handleMaterialChange = (index: number, value: string) => {
    if (!estimate) return;

    const updated = applyMaterialQuantityChange(estimate, index, value);

    setEstimate(updated);
    methods.setValue("materials", mapMaterialsToPriceInput(updated), { shouldValidate: true });
  };

  const handleEstimateEdit = (updatedEstimate: Partial<ICostEstimate>) => {
    estimate && setEstimate({ ...estimate, ...updatedEstimate });
  };

  const handleQuantityChange = (quantity: number) => {
    setQuantityKg(quantity);
    setEstimate(null);
    setError(null);
  };

  const handleProductChange = (product: ProductOption | null) => {
    setSelectedProduct(product);
    setEstimate(null);
    methods.reset();
    setError(null);
    setDummyRows([]);
    setCifOverride(null);
    resetDummyEstimate();

    if (!product?.id) return;

    if (product.isTestProduct) {
      setEstimate(costConfig ? createEmptySimulation(product, costConfig) : createEmptySimulation(product));
    } else {
      handleEstimate(product.id);
    }
  };

  const handleEstimate = (productId: string) => {
    if (!productId) {
      setError("Seleccione un producto");

      return;
    }

    if (!quantityKg || quantityKg <= 0) {
      setError("Ingrese una cantidad válida");

      return;
    }

    setError(null);
    startEstimateTransition(async () => {
      const result = await getCostEstimateAction(productId, quantityKg);

      if (result.success) {
        setEstimate(result.data);
        methods.setValue("wastePct", result.data.wastePct);
        methods.setValue("materials", mapMaterialsToPriceInput(result.data));
      } else {
        toast.error(result.error);
        setEstimate(null);
      }
    });
  };

  const rowPriceFor = (materialType: "feedstock" | "packaging", option: IMaterialPriceOption) =>
    materialType === "feedstock" ? option.pricePerGram : option.pricePerUnit;

  const pushDummyEstimate = useCallback(() => {
    const grams = typeof unitGramsFinalProduct === "number" ? unitGramsFinalProduct : parseFloat(unitGramsFinalProduct);

    const unitCount = typeof units === "number" ? units : parseFloat(units);

    if (!Number.isFinite(grams) || grams <= 0 || !Number.isFinite(unitCount) || unitCount <= 0) return;
    if (buildDummyMaterialsPayload(dummyRows).length === 0) return;

    runEstimate({
      unitGramsFinalProduct: grams,
      units: Math.floor(unitCount),
      wastePct: Number(methods.getValues("wastePct")) || 0,
      commissionPct: Number(methods.getValues("comissionPct")) || 0,
      finalPrice: Number(methods.getValues("finalPrice")) || 0,
      isDefinitive: false,
      notes: methods.getValues("priceNotes") || "",
      materials: buildDummyMaterialsPayload(dummyRows)
    });
  }, [dummyRows, unitGramsFinalProduct, units, methods, runEstimate]);

  const handleAddRow = (materialType: "feedstock" | "packaging", option: IMaterialPriceOption) => {
    const price = rowPriceFor(materialType, option);

    setDummyRows(prev => [
      ...prev,
      {
        localId: `${materialType}-${option.id}-${Date.now()}`,
        materialType,
        idMaterial: option.id,
        materialName: option.name,
        unitCost: price && price > 0 ? price : "",
        quantity: "",
        isDraft: true
      }
    ]);
  };

  const handleRemoveRow = (localId: string) => {
    setDummyRows(prev => prev.filter(r => r.localId !== localId));
  };

  const handleRowChange = (localId: string, field: "unitCost" | "quantity", value: number | string) => {
    setDummyRows(prev => prev.map(r => (r.localId === localId ? { ...r, [field]: value } : r)));
  };

  useEffect(() => {
    if (!isTestProduct) return;
    pushDummyEstimate();
  }, [dummyRows, isTestProduct, pushDummyEstimate]);

  const handleUnitsChange = (value: number | string) => setUnits(value);
  const handleGramsChange = (value: number | string) => setUnitGramsFinalProduct(value);

  const handleCifOverrideChange = (value: number | null) => {
    setCifOverride(value === null || !Number.isFinite(value) || value < 0 ? null : value);
  };

  const handleCifOverrideReset = () => setCifOverride(null);

  const handleRegisterPrice = methods.handleSubmit(async (values: RegisterPriceFormValues) => {
    if (!estimate || (snapshotId === null && !selectedProduct?.id)) {
      toast.error("Seleccione un producto y genere una estimación primero");

      return;
    }

    const isSnapshotUpdate = snapshotId !== null;

    const payload: any = {
      idFinalProduct: isSnapshotUpdate ? estimate.idFinalProduct : selectedProduct!.id,
      units: isSnapshotUpdate ? estimate.units : quantityKg,
      wastePct: values.wastePct,
      commissionPct: values.comissionPct,
      finalPrice: values.finalPrice,
      isDefinitive: values.isDefinitive,
      notes: values.priceNotes,
      materials: values.materials
    };

    startPriceTransition(async () => {
      const result =
        isSnapshotUpdate && snapshotId !== null
          ? await updateSnapshotAction(estimate.idFinalProduct, snapshotId, payload)
          : selectedProduct?.id
            ? await registerProductPrice(selectedProduct.id, payload)
            : null;

      if (result?.success) {
        if (isSnapshotUpdate) {
          toast.success("Snapshot actualizado con éxito");
          onSaved?.();
        } else {
          toast.success("Precio final registrado con éxito");
          methods.reset();
          queryClient.invalidateQueries({ queryKey: ["current-price"] });
          queryClient.invalidateQueries({ queryKey: ["price-history"] });
          queryClient.invalidateQueries({ queryKey: ["product-snapshots"] });
          setEstimate(null);
        }
      } else {
        toast.error(result?.error || "Error al registrar el precio");
      }
    });
  });

  const handleRegisterDummyPrice = () => {
    void (async () => {
      // En modo dummy los materiales viven en `dummyRows`, no en el `materials` del
      // form, así que solo se validan los campos numéricos del registro de precio.
      const valid = await methods.trigger(["wastePct", "finalPrice", "priceNotes", "isDefinitive"]);

      if (!valid) return;

      const values = methods.getValues();

      const grams =
        typeof unitGramsFinalProduct === "number" ? unitGramsFinalProduct : parseFloat(unitGramsFinalProduct);

      const unitCount = typeof units === "number" ? units : parseFloat(units);

      if (!Number.isFinite(grams) || grams <= 0 || !Number.isFinite(unitCount) || unitCount <= 0) {
        toast.error("Ingrese unidades y gramos válidos");

        return;
      }

      const materials = buildDummyMaterialsPayload(dummyRows);

      if (materials.length === 0) {
        toast.error("Agregue al menos un material con precio y cantidad");

        return;
      }

      const payload = {
        unitGramsFinalProduct: grams,
        units: Math.floor(unitCount),
        wastePct: values.wastePct,
        commissionPct: values.comissionPct,
        finalPrice: values.finalPrice,
        isDefinitive: values.isDefinitive,
        notes: values.priceNotes,
        materials
      };

      startPriceTransition(async () => {
        const result =
          snapshotId !== null
            ? await updateDummySnapshotAction(snapshotId, payload)
            : await saveDummyProductAction(payload);

        if (result.success) {
          toast.success("Simulación guardada con éxito");
          queryClient.invalidateQueries({ queryKey: ["product-snapshots"] });
          onSaved?.();
        } else {
          toast.error(result.error || "Error al guardar la simulación");
        }
      });
    })();
  };

  const derivedEstimate = useMemo(() => {
    const raw = isTestProduct ? dummyEstimate ?? estimate : estimate;
    const base = raw ? applyCifOverride(raw, cifOverride) : null;

    if (!base) return null;

    const totalCost = base.realTotalCostFeedstock + base.realTotalCostPackaging + base.totalCif;
    const price = Number(finalPrice);
    const commissionValue = price * ((commissionPct ?? base.price?.commissionPct) / 100);
    const safeCommission = Number.isFinite(commissionValue) ? commissionValue : 0;
    const costDifference = price > 0 ? price - (base.totalCostWaste ?? totalCost) - safeCommission : 0;
    const utilityPct = price > 0 ? (costDifference / price) * 100 : 0;
    const wasteValue = totalCost * ((wastePct ?? base.wastePct) / 100);
    const defaultMarginValue = (base.totalCostWaste * 0.4) / 0.6;

    return {
      ...base,
      totalCost,
      wasteValue,
      wastePct: wastePct ?? base.wastePct,
      costDifference,
      utilityPct,
      defaultMarginValue,
      price: { ...base.price, commissionPct: commissionPct ?? base.price?.commissionPct, commissionValue }
    };
  }, [estimate, dummyEstimate, cifOverride, isTestProduct, wastePct, finalPrice, commissionPct]);

  const handleSnapshotDetail = (id: number) => setSelectedSnapshotId(id);
  const handleCloseSnapshotDetail = () => setSelectedSnapshotId(null);

  const handleRefreshSnapshots = () => {
    queryClient.invalidateQueries({ queryKey: ["product-snapshots"] });
  };

  return {
    methods,
    productList,
    selectedProduct,
    quantityKg,
    estimate: derivedEstimate,
    error,
    isEstimating,
    selectedSnapshotId,
    isRegisteringPrice,
    handleProductChange,
    handleQuantityChange,
    handleEstimate,
    handleRegisterPrice,
    handleMaterialChange,
    loadEstimate,
    handleSnapshotDetail,
    handleCloseSnapshotDetail,
    handleRefreshSnapshots,
    isTestProduct,
    units,
    unitGramsFinalProduct,
    dummyRows,
    cifOverride,
    effectiveCif,
    isDummyEstimating,
    dummyEstimateError,
    handleAddRow,
    handleRemoveRow,
    handleRowChange,
    handleUnitsChange,
    handleGramsChange,
    handleCifOverrideChange,
    handleCifOverrideReset,
    handleRegisterDummyPrice,
    handleEstimateEdit
  };
};

export default useEstimate;
