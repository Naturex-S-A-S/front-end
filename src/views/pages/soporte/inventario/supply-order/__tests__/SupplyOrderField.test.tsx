import type { ReactNode } from "react";

import { describe, expect, it } from "vitest";
import { useForm } from "react-hook-form";

import { render, screen } from "@/utils/tests/test-utils";
import type { IOpenSupplyOrder } from "@/types/pages/order";

import SupplyOrderField, { supplyOrderOptionLabel, toSupplyOrderOptions } from "../SupplyOrderField";
import SupplyIncomingAlert, { supplyIncoming } from "../SupplyIncomingAlert";

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
  children?: ReactNode;
};

const Harness = ({ options, materialSelected = true, selected }: HarnessProps) => {
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

  it("no muestra el pendiente después de la entrada ni la sobre-entrega dentro del campo", () => {
    render(<Harness options={[open]} selected={open} />);

    expect(screen.queryByText(/Después de esta entrada/)).toBeNull();
    expect(screen.queryByText(/supera lo pendiente/)).toBeNull();
  });
});

describe("mensaje de la cantidad a ingresar", () => {
  it("sin orden o sin cantidad no hay mensaje", () => {
    expect(supplyIncoming(undefined, 10)).toBeNull();
    expect(supplyIncoming(open, undefined)).toBeNull();
    expect(supplyIncoming(open, 0)).toBeNull();
  });

  it("hasta lo pendiente calcula lo que quedará pendiente", () => {
    expect(supplyIncoming(open, 1000)).toEqual({ kind: "pending", pendingAfter: 2000 });
    expect(supplyIncoming(open, 3000)).toEqual({ kind: "pending", pendingAfter: 0 });
  });

  it("por encima de lo pendiente es sobre-entrega", () => {
    expect(supplyIncoming(open, 3500)).toEqual({ kind: "overDelivery", excess: 500 });
  });

  it("muestra en verde lo que quedará pendiente", () => {
    render(<SupplyIncomingAlert incoming={{ kind: "pending", pendingAfter: 1 }} unitLabel='und' />);

    const alert = screen.getByRole("alert");

    expect(alert.textContent).toContain("Después de esta entrada: 1 und pendiente");
    expect(alert.className).toMatch(/Success/);
  });

  it("muestra en amarillo la sobre-entrega", () => {
    render(<SupplyIncomingAlert incoming={{ kind: "overDelivery", excess: 1 }} unitLabel='und' />);

    const alert = screen.getByRole("alert");

    expect(alert.textContent).toContain(
      "La cantidad supera lo pendiente de la orden en 1 und. Se registrará como sobre-entrega."
    );
    expect(alert.className).toMatch(/Warning/);
  });
});
