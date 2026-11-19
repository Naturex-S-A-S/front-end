import type { ReactNode } from "react";

import { describe, expect, it } from "vitest";
import { useForm } from "react-hook-form";

import { render, screen } from "@/utils/tests/test-utils";
import type { IOpenSupplyOrder } from "@/types/pages/order";

import SupplyOrderField, { supplyOrderOptionLabel, toSupplyOrderOptions } from "../SupplyOrderField";

const open: IOpenSupplyOrder = {
  orderId: 41,
  batch: "OA-41",
  dateCreated: "2026-11-10T09:00:00",
  quantityTotal: 5000,
  quantityReceived: 2000,
  quantityPending: 3000
};

type HarnessProps = {
  options: IOpenSupplyOrder[];
  materialSelected?: boolean;
  selected?: IOpenSupplyOrder;
  incoming?: number;
  children?: ReactNode;
};

const Harness = ({ options, materialSelected = true, selected, incoming }: HarnessProps) => {
  const { control } = useForm({
    defaultValues: { supplyOrder: selected ? toSupplyOrderOptions([selected])[0] : undefined }
  });

  return (
    <SupplyOrderField
      control={control}
      options={options}
      isLoading={false}
      materialSelected={materialSelected}
      unitLabel='g'
      incomingQuantity={incoming}
    />
  );
};

describe("SupplyOrderField", () => {
  it("la opción muestra el lote, la fecha y lo pendiente, o Completo", () => {
    expect(supplyOrderOptionLabel(open, "g")).toMatch(/^OA-41 · .+ · Pendiente: 3\.000 g$/);
    expect(supplyOrderOptionLabel({ ...open, quantityPending: 0 }, "g")).toMatch(/· Completo$/);
  });

  it("sin órdenes en proceso para el material muestra el aviso", () => {
    render(<Harness options={[]} />);

    expect(screen.getByText("No hay órdenes de aprovisionamiento en proceso para este material.")).toBeTruthy();
  });

  it("sin material no muestra el aviso", () => {
    render(<Harness options={[]} materialSelected={false} />);

    expect(screen.queryByText(/No hay órdenes de aprovisionamiento/)).toBeNull();
  });

  it("con la orden elegida muestra total, ingresado y pendiente", () => {
    render(<Harness options={[open]} selected={open} />);

    expect(screen.getByText("5.000 g")).toBeTruthy();
    expect(screen.getByText("2.000 g")).toBeTruthy();
    expect(screen.getByText("3.000 g")).toBeTruthy();
  });

  it("una cantidad mayor a lo pendiente avisa la sobre-entrega sin bloquear", () => {
    render(<Harness options={[open]} selected={open} incoming={3500} />);

    expect(screen.getByText(/supera lo pendiente de la orden en 500 g/)).toBeTruthy();
  });

  it("una cantidad dentro de lo pendiente no avisa", () => {
    render(<Harness options={[open]} selected={open} incoming={1000} />);

    expect(screen.queryByText(/supera lo pendiente/)).toBeNull();
  });
});
