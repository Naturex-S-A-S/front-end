import { describe, it, expect, vi } from "vitest";

import { fireEvent } from "@testing-library/react";

import { render, screen } from "@/utils/tests/test-utils";
import CustomButton from "@/@core/components/mui/Button";

// pnpm run test:run -t "CustomButton"
describe("CustomButton", () => {
  describe("Renderizado", () => {
    it("muestra el texto cuando se pasa la prop text", () => {
      render(<CustomButton text='Guardar' />);

      expect(screen.getByRole("button", { name: /guardar/i })).toBeInTheDocument();
    });

    it("muestra children cuando se pasa como prop", () => {
      render(<CustomButton>Eliminar</CustomButton>);

      expect(screen.getByRole("button", { name: /eliminar/i })).toBeInTheDocument();
    });

    it("prioriza children sobre text", () => {
      render(<CustomButton text='Guardar'>Cancelar</CustomButton>);

      const button = screen.getByRole("button");

      expect(button).toHaveTextContent("Cancelar");
      expect(button).not.toHaveTextContent("Guardar");
    });

    it("usa variante contained por defecto", () => {
      render(<CustomButton text='Guardar' />);

      expect(screen.getByRole("button")).toHaveClass("MuiButton-contained");
    });
  });

  describe("Estado de carga (isLoading)", () => {
    it("muestra CircularProgress cuando isLoading es true", () => {
      render(<CustomButton text='Guardar' isLoading />);

      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("deshabilita el botón cuando isLoading es true", () => {
      render(<CustomButton text='Guardar' isLoading />);

      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("no muestra el texto mientras esta cargando", () => {
      render(<CustomButton text='Guardar' isLoading />);

      expect(screen.queryByText(/guardar/i)).not.toBeInTheDocument();
    });
  });

  describe("Deshabilitado", () => {
    it("deshabilita el botón cuando disabled es true", () => {
      render(<CustomButton text='Guardar' disabled />);

      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("no llama onClick cuando está deshabilitado", () => {
      const handleClick = vi.fn();

      render(<CustomButton text='Guardar' disabled onClick={handleClick} />);

      fireEvent.click(screen.getByRole("button"));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});
