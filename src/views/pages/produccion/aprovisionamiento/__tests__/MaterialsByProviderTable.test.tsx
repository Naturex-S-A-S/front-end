import { describe, expect, it } from "vitest";

import { render, screen } from "@/utils/tests/test-utils";
import type { IOrderSupplyMaterialsByProvider } from "@/types/pages/order";

import MaterialsByProviderTable from "../MaterialsByProviderTable";

const items: IOrderSupplyMaterialsByProvider[] = [
  {
    providerId: "1",
    providerName: "Botánicos del Valle",
    providerAddress: null,
    providerPhone: null,
    materials: [
      {
        id: "MP-001",
        name: "Extracto de caléndula",
        quantityAvailable: 1200,
        quantityMissing: 3800,
        quantityTotalOrder: 5000,
        totalCost: 100,
        quantityReceived: 2000,
        quantityPending: 3000
      },
      {
        id: "MP-014",
        name: "Aceite de almendras",
        quantityAvailable: 0,
        quantityMissing: 1000,
        quantityTotalOrder: 1000,
        totalCost: 50,
        quantityReceived: 1050,
        quantityPending: 0
      },
      {
        id: "ME-005",
        name: "Frasco ámbar",
        quantityAvailable: 0,
        quantityMissing: 10,
        quantityTotalOrder: 10,
        totalCost: 20,
        quantityReceived: 0,
        quantityPending: 10
      }
    ]
  }
];

const headers = () => screen.getAllByRole("columnheader").map(h => h.textContent?.trim());

describe("MaterialsByProviderTable", () => {
  it("muestra el código como primera columna de datos", () => {
    render(<MaterialsByProviderTable items={items} />);

    const inner = headers().slice(4);

    expect(inner[0]).toBe("Código");
    expect(inner[1]).toBe("Nombre");
    expect(screen.getByText("MP-001")).toBeTruthy();
  });

  it("sin showReceived no muestra Ingresada, Pendiente ni Estado (pantalla de cálculo)", () => {
    render(<MaterialsByProviderTable items={items} />);

    expect(screen.queryByText("Cant. Ingresada")).toBeNull();
    expect(screen.queryByText("Cant. Pendiente")).toBeNull();
    expect(screen.queryByText("Estado")).toBeNull();
  });

  it("con showReceived muestra lo ingresado, lo pendiente y el estado de cada material", () => {
    render(<MaterialsByProviderTable items={items} showReceived showCost />);

    expect(headers()).toEqual(
      expect.arrayContaining(["Cant. Total Pedido", "Cant. Ingresada", "Cant. Pendiente", "Estado", "Costo Total"])
    );
    expect(screen.getByText("Parcial")).toBeTruthy();
    expect(screen.getByText("Completo")).toBeTruthy();
    expect(screen.getByText("Sin ingresos")).toBeTruthy();
  });
});
