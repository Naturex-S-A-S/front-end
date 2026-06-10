/* eslint-disable import/no-named-as-default */
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { render, screen, waitFor } from "@/utils/tests/test-utils";
import Create from "@/views/pages/soporte/inventario/materia-prima/create";

const mockPostFeedstock = vi.fn();
const mockGetCategories = vi.fn();

vi.mock("@/api/feedstock", () => ({
  postFeedstock: (data: unknown) => mockPostFeedstock(data),
  getCategories: (...args: unknown[]) => mockGetCategories(...args)
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

function renderWithQueryClient(ui: React.ReactElement) {
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

async function openDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button"));
}

describe("Crear Materia Prima", () => {
  beforeEach(() => {
    queryClient.clear();
    mockGetCategories.mockResolvedValue([{ id: 1, name: "Cereal" }]);
  });

  describe.skip("Renderizado", () => {
    it("abre el dialogo con el formulario al hacer click en el boton +", async () => {
      const user = userEvent.setup();

      renderWithQueryClient(<Create />);

      await openDialog(user);

      expect(screen.getByText(/Crear Materia Prima/i)).toBeInTheDocument();
      expect(screen.getByRole("checkbox", { name: /al[eé]rgeno/i })).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: /nombre/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /guardar/i })).toBeInTheDocument();
    });
  });

  describe.skip("Validacion", () => {
    it("muestra error al enviar el formulario vacio", async () => {
      const user = userEvent.setup();

      renderWithQueryClient(<Create />);

      await openDialog(user);
      await user.click(screen.getByRole("button", { name: /guardar/i }));

      await waitFor(() => {
        expect(screen.getByText(/El nombre es requerido/i)).toBeInTheDocument();
      });

      expect(mockPostFeedstock).not.toHaveBeenCalled();
    });
  });
});
