"use client";

import { useMemo, useState, useTransition } from "react";

import { useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";

import toast from "react-hot-toast";

import useGetProductList from "@/hooks/product/useGetProductList";
import {
  getCostEstimateAction,
  getCurrentPriceAction,
  getPriceHistoryAction,
  getProductSnapshotsAction,
  registerProductPrice
} from "@/api/costs/actions";
import type { ICostEstimate, ICostSnapshotSummary, IProductPrice } from "@/types/pages/costs";
import { registerPriceSchema, type RegisterPriceFormValues } from "@/utils/schemas/costs";
import { applyMaterialQuantityChange, mapMaterialsToPriceInput } from "@/utils/costs";
import { TAX_PERCENTAGE } from "@/utils/constant";

export type ProductOption = {
  id: string;
  fullName?: string;
  name?: string;
};

const useEstimate = () => {
  const { productList } = useGetProductList();

  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);
  const [quantityKg, setQuantityKg] = useState<number>(1);
  const [estimate, setEstimate] = useState<ICostEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEstimating, startEstimateTransition] = useTransition();

  const [snapshots, setSnapshots] = useState<ICostSnapshotSummary[]>([]);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<number | null>(null);
  const [isLoadingSnapshots, startSnapshotsTransition] = useTransition();

  const methods = useForm<RegisterPriceFormValues>({
    defaultValues: {
      wastePct: 0,
      taxPct: TAX_PERCENTAGE,
      applyTax: true,
      finalPrice: undefined,
      priceNotes: "",
      isDefinitive: false,
      materials: []
    },
    resolver: yupResolver(registerPriceSchema) as any
  });

  const wastePct = methods.watch("wastePct");
  const taxPct = methods.watch("taxPct");
  const applyTax = methods.watch("applyTax");
  const finalPrice = methods.watch("finalPrice");

  const [currentPrice, setCurrentPrice] = useState<IProductPrice | null>(null);
  const [priceHistory, setPriceHistory] = useState<IProductPrice[]>([]);
  const [lastSavedSnapshotId, setLastSavedSnapshotId] = useState<number | null>(null);
  const [isRegisteringPrice, startPriceTransition] = useTransition();

  const fetchSnapshots = (productId: string) => {
    startSnapshotsTransition(async () => {
      const result = await getProductSnapshotsAction(productId);

      if (result.success) {
        setSnapshots(result.data);
      } else {
        setSnapshots([]);
      }
    });
  };

  const fetchCurrentPrice = (productId: string) => {
    getCurrentPriceAction(productId).then(result => {
      setCurrentPrice(result.data);
    });
  };

  const fetchPriceHistory = (productId: string) => {
    getPriceHistoryAction(productId).then(result => {
      setPriceHistory(result.data);
    });
  };

  const handleMaterialChange = (index: number, value: string) => {
    if (!estimate) return;

    const updated = applyMaterialQuantityChange(estimate, index, value);

    setEstimate(updated);
    methods.setValue("materials", mapMaterialsToPriceInput(updated));
  };

  const handleQuantityChange = (quantity: number) => {
    setQuantityKg(quantity);
    setEstimate(null);
    setError(null);
    setLastSavedSnapshotId(null);
  };

  const handleProductChange = (product: ProductOption | null) => {
    setSelectedProduct(product);
    setEstimate(null);
    methods.reset();
    setError(null);
    setCurrentPrice(null);
    setPriceHistory([]);
    setLastSavedSnapshotId(null);

    if (product?.id) {
      fetchSnapshots(product.id);
      fetchCurrentPrice(product.id);
      fetchPriceHistory(product.id);
    } else {
      setSnapshots([]);
    }
  };

  const handleEstimate = () => {
    if (!selectedProduct?.id) {
      setError("Seleccione un producto");

      return;
    }

    if (!quantityKg || quantityKg <= 0) {
      setError("Ingrese una cantidad válida");

      return;
    }

    setError(null);
    startEstimateTransition(async () => {
      const result = await getCostEstimateAction(selectedProduct.id, quantityKg);

      console.log({ result });

      if (result.success) {
        setEstimate(result.data);
        methods.setValue("wastePct", result.data.wastePct);
        methods.setValue("taxPct", TAX_PERCENTAGE);
        methods.setValue("materials", mapMaterialsToPriceInput(result.data));
      } else {
        toast.error(result.error);
        setEstimate(null);
      }
    });
  };

  const handleRegisterPrice = methods.handleSubmit(async (values: RegisterPriceFormValues) => {
    if (!selectedProduct?.id || !estimate) {
      toast.error("Seleccione un producto y genere una estimación primero");

      return;
    }

    startPriceTransition(async () => {
      console.log({
        idFinalProduct: selectedProduct.id,
        units: quantityKg,
        wastePct: values.wastePct,
        taxPct: values.applyTax ? values.taxPct : 0,
        commissionPct: 0,
        finalPrice: values.finalPrice,
        isDefinitive: values.isDefinitive,
        notes: values.priceNotes,
        materials: values.materials
      });

      const result = await registerProductPrice(selectedProduct.id!, {
        idFinalProduct: selectedProduct.id,
        units: quantityKg,
        wastePct: values.wastePct,
        taxPct: values.applyTax ? values.taxPct : 0,
        commissionPct: 0,
        finalPrice: values.finalPrice,
        isDefinitive: values.isDefinitive,
        notes: values.priceNotes,
        materials: values.materials
      });

      console.log({ result });

      if (result.success) {
        toast.success("Precio final registrado con éxito");
        methods.reset();
        setLastSavedSnapshotId(null);
        fetchCurrentPrice(selectedProduct!.id);
        fetchPriceHistory(selectedProduct!.id);
        setEstimate(null);
      } else {
        console.log(result);
        toast.error(result.error || "Error al registrar el precio");
      }
    });
  });

  const waterfall = useMemo(() => {
    if (!estimate) return null;

    const costBase = estimate.costTotalKg;
    const effectiveTaxPct = applyTax ? taxPct : 0;
    const costWithWaste = costBase / (1 - wastePct / 100);
    const wasteAmount = costWithWaste - costBase;
    const taxAmount = costWithWaste * (effectiveTaxPct / 100);
    const costWithTax = costWithWaste * (1 + effectiveTaxPct / 100);

    return {
      costBase,
      wastePct,
      wasteAmount,
      costWithWaste,
      taxPct: effectiveTaxPct,
      taxAmount,
      costWithTax
    };
  }, [estimate, wastePct, taxPct, applyTax]);

  const profitMargin = useMemo(() => {
    const price = Number(finalPrice);

    if (!price || price <= 0 || !waterfall) return null;

    const cost = waterfall.costWithTax;
    const profit = price - cost;
    const marginPct = (profit / price) * 100;

    return { profit: Number(profit.toFixed(2)), marginPct: Number(marginPct.toFixed(2)) };
  }, [finalPrice, waterfall]);

  const handleSnapshotDetail = (id: number) => setSelectedSnapshotId(id);
  const handleCloseSnapshotDetail = () => setSelectedSnapshotId(null);

  const handleRefreshSnapshots = () => {
    if (selectedProduct?.id) {
      fetchSnapshots(selectedProduct.id);
    }
  };

  return {
    methods,
    productList,
    selectedProduct,
    quantityKg,
    setQuantityKg,
    estimate,
    error,
    isEstimating,
    snapshots,
    selectedSnapshotId,
    isLoadingSnapshots,
    currentPrice,
    priceHistory,
    lastSavedSnapshotId,
    isRegisteringPrice,
    waterfall,
    profitMargin,
    handleProductChange,
    handleQuantityChange,
    handleEstimate,
    handleRegisterPrice,
    handleMaterialChange,
    handleSnapshotDetail,
    handleCloseSnapshotDetail,
    handleRefreshSnapshots
  };
};

export default useEstimate;
