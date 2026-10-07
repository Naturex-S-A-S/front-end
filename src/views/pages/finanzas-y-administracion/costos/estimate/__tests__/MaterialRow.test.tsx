import { describe, expect, it, vi } from "vitest";

import { fireEvent } from "@testing-library/react";

import { render, screen } from "@/utils/tests/test-utils";
import type { IDummySimulationRow } from "@/types/pages/costs";

import MaterialRow from "../MaterialRow";

const row: IDummySimulationRow = {
  localId: "feedstock-F-1-1",
  materialType: "feedstock",
  idMaterial: "F-1",
  materialName: "Glicina",
  unitCost: 0.5,
  quantity: "",
  isDraft: true
};

const renderRow = (onChange = vi.fn()) => {
  render(
    <table>
      <tbody>
        <MaterialRow row={row} isPending={false} onChange={onChange} onRemove={vi.fn()} />
      </tbody>
    </table>
  );

  return onChange;
};

describe("MaterialRow", () => {
  it("digitar no propaga el cambio hasta salir del campo", () => {
    const onChange = renderRow();

    fireEvent.change(screen.getByLabelText("Cantidad base (g)"), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText("Cantidad base (g)"), { target: { value: "100" } });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("al salir del campo propaga cantidad y precio", () => {
    const onChange = renderRow();

    fireEvent.change(screen.getByLabelText("Cantidad base (g)"), { target: { value: "100" } });
    fireEvent.blur(screen.getByLabelText("Cantidad base (g)"));

    fireEvent.change(screen.getByLabelText("Costo x (g)"), { target: { value: "0.75" } });
    fireEvent.blur(screen.getByLabelText("Costo x (g)"));

    expect(onChange).toHaveBeenCalledWith("feedstock-F-1-1", "quantity", 100);
    expect(onChange).toHaveBeenCalledWith("feedstock-F-1-1", "unitCost", 0.75);
  });

  it("salir sin cambios no propaga nada", () => {
    const onChange = renderRow();

    fireEvent.blur(screen.getByLabelText("Cantidad base (g)"));
    fireEvent.blur(screen.getByLabelText("Costo x (g)"));

    expect(onChange).not.toHaveBeenCalled();
  });
});
