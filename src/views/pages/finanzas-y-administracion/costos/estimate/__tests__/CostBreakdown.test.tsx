import { useRef, useState } from "react";

import { describe, expect, it, vi } from "vitest";

import { fireEvent, within } from "@testing-library/react";

import { render, screen } from "@/utils/tests/test-utils";
import type {
  ICostEstimate,
  ICostEstimateMaterial,
  IDummySimulationRow,
  IMaterialPriceOption
} from "@/types/pages/costs";
import { createEmptySimulation } from "@/utils/costs";
import { formatCurrency } from "@/utils/format";

import CostBreakdown from "../CostBreakdown";

const MAX_EDITS = 5;

let editCalls = 0;

const buildEstimateWithMaterial = (): ICostEstimate => ({
  ...createEmptySimulation({ id: "P1" }),
  materials: [
    {
      idMaterial: 1,
      materialName: "Materia prima",
      materialType: "feedstock",
      cost: 1,
      baseQuantity: 10,
      baseCost: 10,
      stdQuantity: 10,
      stdTotalCost: 10,
      realUnitCost: 10,
      realQuantity: 10,
      realTotalCost: 10
    }
  ]
});

// Reproduce el ciclo real de useEstimate: handleEstimateEdit siempre llama
// setEstimate({ ...estimate, ...parcial }), generando un objeto nuevo en cada llamada.
// El tope MAX_EDITS corta el bucle para que el test falle en lugar de colgar.
const Harness = () => {
  const [estimate, setEstimate] = useState<ICostEstimate>(buildEstimateWithMaterial);
  const editCount = useRef(0);

  const handleEstimateEdit = (updatedEstimate: Partial<ICostEstimate>) => {
    editCount.current += 1;
    editCalls = editCount.current;

    if (editCount.current >= MAX_EDITS) return;

    setEstimate(prev => ({ ...prev, ...updatedEstimate }));
  };

  return <CostBreakdown estimate={estimate} onEstimateEdit={handleEstimateEdit} />;
};

describe("CostBreakdown", () => {
  it("empuja los totales de materiales una sola vez al montar, sin entrar en bucle de actualizaciones", () => {
    editCalls = 0;

    render(<Harness />);

    expect(screen.getByText("Materia Prima")).toBeInTheDocument();
    expect(editCalls).toBe(1);
  });

  describe("modo dummy", () => {
    const serverMaterial = {
      idMaterial: "F-1",
      materialName: "Glicina",
      materialType: "feedstock",
      cost: 0.5,
      baseQuantity: 100,
      baseCost: 50,
      stdQuantity: 100,
      stdTotalCost: 50,
      realUnitCost: 50,
      realQuantity: 100,
      realTotalCost: 50
    } as unknown as ICostEstimateMaterial;

    const dummyRow: IDummySimulationRow = {
      localId: "feedstock-F-1-1",
      materialType: "feedstock",
      idMaterial: "F-1",
      materialName: "Glicina",
      unitCost: 0.5,
      quantity: 100,
      isDraft: true
    };

    const dummyEstimate: ICostEstimate = {
      ...createEmptySimulation({ id: "TEST-1", isTestProduct: true }),
      materials: [serverMaterial]
    };

    const renderDummy = (onRowChange = vi.fn()) => {
      render(
        <CostBreakdown
          estimate={dummyEstimate}
          isTestProduct
          dummyRows={[dummyRow]}
          feedstockPrices={[]}
          packagingPrices={[]}
          onRowChange={onRowChange}
        />
      );

      return onRowChange;
    };

    it("usa las mismas columnas calculadas que el modo normal", () => {
      renderDummy();

      expect(screen.getByRole("columnheader", { name: "Cantidad base (g)" })).toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: "Costo x (g)" })).toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: "Costo Base" })).toBeInTheDocument();
      expect(screen.getByRole("columnheader", { name: "Costo Unitario" })).toBeInTheDocument();
    });

    it("muestra los valores calculados por el servidor", () => {
      renderDummy();

      expect(screen.getAllByText(formatCurrency(50)).length).toBeGreaterThan(0);
    });

    it("editar cantidad y precio propaga al row dummy para recalcular", () => {
      const onRowChange = renderDummy();

      fireEvent.change(screen.getByLabelText("Cantidad base (g)"), { target: { value: "150" } });
      fireEvent.blur(screen.getByLabelText("Cantidad base (g)"));
      fireEvent.change(screen.getByLabelText("Costo x (g)"), { target: { value: "0.75" } });
      fireEvent.blur(screen.getByLabelText("Costo x (g)"));

      expect(onRowChange).toHaveBeenCalledWith("feedstock-F-1-1", "quantity", 150);
      expect(onRowChange).toHaveBeenCalledWith("feedstock-F-1-1", "unitCost", 0.75);
    });

    describe("selector de materiales", () => {
      const priceOptions: IMaterialPriceOption[] = [
        { id: "F-1", name: "Glicina", pricePerGram: 0.5, pricePerUnit: null },
        { id: "F-2", name: "Harina", pricePerGram: 0.25, pricePerUnit: null }
      ];

      const renderPicker = (onAddRow = vi.fn()) => {
        render(
          <CostBreakdown
            estimate={dummyEstimate}
            isTestProduct
            dummyRows={[dummyRow]}
            feedstockPrices={priceOptions}
            packagingPrices={[]}
            onAddRow={onAddRow}
          />
        );

        return onAddRow;
      };

      const openPicker = () => {
        fireEvent.mouseDown(screen.getByRole("combobox", { name: "Agregar materia prima" }));

        return screen.getByRole("listbox");
      };

      it("no lleva botón agregar redundante", () => {
        renderPicker();

        expect(screen.queryByRole("button", { name: /agregar material/i })).not.toBeInTheDocument();
      });

      it("excluye los materiales ya agregados y muestra el precio de referencia", () => {
        renderPicker();

        const listbox = within(openPicker());

        expect(listbox.queryByText(/Glicina/)).not.toBeInTheDocument();
        expect(listbox.getByText(/Harina/)).toBeInTheDocument();
        expect(listbox.getByText(/\$0,25\/g/)).toBeInTheDocument();
      });

      it("seleccionar agrega el material automáticamente", () => {
        const onAddRow = renderPicker();

        fireEvent.click(within(openPicker()).getByText(/Harina/));

        expect(onAddRow).toHaveBeenCalledWith("feedstock", priceOptions[1]);
      });
    });
  });
});
