"use client";

import { useMemo, useState, useTransition } from "react";

import { useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";

import { useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";

import useGetProductList from "@/hooks/product/useGetProductList";
import {
  getCostEstimateAction,
  registerProductPrice,
  updateSnapshotAction,
  type RegisterPricePayload
} from "@/api/costs/actions";
import type { ICostEstimate } from "@/types/pages/costs";
import { registerPriceSchema, type RegisterPriceFormValues } from "@/utils/schemas/costs";
import { applyMaterialQuantityChange, mapMaterialsToPriceInput } from "@/utils/costs";

export type ProductOption = {
  id: string;
  fullName?: string;
  name?: string;
};

export type UseEstimateOptions = {
  snapshotId?: number | null;
  onSaved?: () => void;
};

const useEstimate = ({ snapshotId = null, onSaved }: UseEstimateOptions = {}) => {
  const { productList } = useGetProductList();
  const queryClient = useQueryClient();

  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);
  const [quantityKg, setQuantityKg] = useState<number>(1);
  const [estimate, setEstimate] = useState<ICostEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEstimating, startEstimateTransition] = useTransition();

  const [selectedSnapshotId, setSelectedSnapshotId] = useState<number | null>(null);

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

    if (product?.id) {
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

  const handleRegisterPrice = methods.handleSubmit(async (values: RegisterPriceFormValues) => {
    if (!estimate || (snapshotId === null && !selectedProduct?.id)) {
      toast.error("Seleccione un producto y genere una estimación primero");

      return;
    }

    const isSnapshotUpdate = snapshotId !== null;

    const payload: RegisterPricePayload = {
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

  const derivedEstimate = useMemo(() => {
    if (!estimate) return null;

    //Costo produccion
    const totalCost = estimate.realTotalCostFeedstock + estimate.realTotalCostPackaging + estimate.totalCif;

    // Utilidad
    const price = Number(finalPrice);
    const costDifference = price > 0 ? price - estimate.totalCostWaste : 0;
    const utilityPct = price > 0 ? (costDifference / price) * 100 : 0;

    // Insumos
    const wasteValue = totalCost * (wastePct / 100);

    // Comisión
    const commissionValue = price * (commissionPct / 100);

    // Margen
    const defaultMarginValue = (estimate.totalCostWaste * 0.4) / 0.6;

    return {
      ...estimate,
      totalCost,
      wasteValue,
      wastePct,
      costDifference,
      utilityPct,
      defaultMarginValue,
      price: { ...estimate.price, commissionPct, commissionValue }
    };
  }, [estimate, wastePct, finalPrice, commissionPct]);

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
    handleEstimateEdit
  };
};

export default useEstimate;
