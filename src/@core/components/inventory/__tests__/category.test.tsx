/* eslint-disable import/no-named-as-default */
import { describe, it, expect, vi, beforeEach } from "vitest";

import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { render, screen } from "@/utils/tests/test-utils";

import Category from "../category";

describe("Category", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra solo la primera categoria", () => {
    render(
      <Category
        data={[
          { id: "c1", name: "Actual" },
          { id: "c9", name: "Ignorada" }
        ]}
        list={[]}
        update={vi.fn()}
      />
    );

    expect(screen.getByText("Actual")).toBeInTheDocument();
    expect(screen.queryByText("Ignorada")).not.toBeInTheDocument();
  });

  it("muestra Sin categoria cuando no hay ninguna", () => {
    render(<Category data={[]} list={[]} update={vi.fn()} />);

    expect(screen.getByText("Sin categoria")).toBeInTheDocument();
  });

  it("cambiar envia la nueva categoria como array de un elemento", async () => {
    const user = userEvent.setup();
    const update = vi.fn();

    render(
      <Category data={[{ id: "c1", name: "Actual" }]} list={[{ id: "c2", name: "Nueva" }]} update={update} />
    );

    await user.click(screen.getByRole("button", { name: /cambiar/i }));

    const dialog = screen.getByRole("dialog");

    await user.click(within(dialog).getByRole("combobox"));
    await user.click(screen.getByText("Nueva"));
    await user.click(within(dialog).getByRole("button", { name: /guardar/i }));

    expect(update).toHaveBeenCalledWith(["c2"]);
  });

  it("el dialogo abre con la categoria actual seleccionada", async () => {
    const user = userEvent.setup();

    render(
      <Category
        data={[{ id: "c1", name: "Actual" }]}
        list={[
          { id: "c1", name: "Actual" },
          { id: "c2", name: "Nueva" }
        ]}
        update={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /cambiar/i }));

    expect(within(screen.getByRole("dialog")).getByRole("combobox")).toHaveValue("Actual");
  });

  it("no permite quitar la categoria", () => {
    render(<Category data={[{ id: "c1", name: "Actual" }]} list={[]} update={vi.fn()} />);

    expect(screen.queryByTestId("CancelIcon")).not.toBeInTheDocument();
  });
});
