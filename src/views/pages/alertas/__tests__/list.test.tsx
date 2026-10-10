/* eslint-disable import/no-named-as-default */
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";

import { render, screen, waitFor } from "@/utils/tests/test-utils";
import type { IAlert } from "@/types/alert";
import List from "../list";

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace })
}));

const mockMarkAlertAsRead = vi.fn();
const mockMarkAllAlertsAsRead = vi.fn();

vi.mock("@/api/alert/actions", () => ({
  markAlertAsRead: (...args: unknown[]) => mockMarkAlertAsRead(...args),
  markAllAlertsAsRead: (...args: unknown[]) => mockMarkAllAlertsAsRead(...args)
}));

const makeAlert = (id: number, over: Partial<IAlert> = {}): IAlert => ({
  id,
  type: "alert",
  comment: `Alerta ${id}`,
  url: `/contenido/${id}`,
  date: "2025-11-11T19:08:31",
  readed: false,
  ...over
});

const makePage = (count: number, over: Partial<IAlert> = {}) =>
  Array.from({ length: count }, (_, i) => makeAlert(i + 1, over));

describe("Lista de alertas", () => {
  beforeEach(() => {
    mockMarkAlertAsRead.mockResolvedValue({ success: true });
    mockMarkAllAlertsAsRead.mockResolvedValue({ success: true });
  });

  it("muestra el comentario de cada alerta", () => {
    render(<List initialData={[makeAlert(1), makeAlert(2, { readed: true })]} onlyActive={false} />);

    expect(screen.getByText("Alerta 1")).toBeInTheDocument();
    expect(screen.getByText("Alerta 2")).toBeInTheDocument();
  });

  it("muestra estado vacio cuando no hay alertas", () => {
    render(<List initialData={[]} onlyActive={false} />);

    expect(screen.getByText(/no hay alertas/i)).toBeInTheDocument();
  });

  it("al clickear una alerta no leida la marca como leida y navega a su url", async () => {
    const user = userEvent.setup();

    render(<List initialData={[makeAlert(1)]} onlyActive={false} />);

    await user.click(screen.getByText("Alerta 1"));

    await waitFor(() => {
      expect(mockMarkAlertAsRead).toHaveBeenCalledWith(1);
    });
    expect(mockPush).toHaveBeenCalledWith("/contenido/1");
  });

  it("al clickear una alerta ya leida solo navega", async () => {
    const user = userEvent.setup();

    render(<List initialData={[makeAlert(1, { readed: true })]} onlyActive={false} />);

    await user.click(screen.getByText("Alerta 1"));

    expect(mockMarkAlertAsRead).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/contenido/1");
  });

  it("marcar todo como leido usa solo los ids no leidos", async () => {
    const user = userEvent.setup();

    render(
      <List initialData={[makeAlert(1), makeAlert(2), makeAlert(3, { readed: true })]} onlyActive={false} />
    );

    await user.click(screen.getByRole("button", { name: /marcar todo como le[ií]do/i }));

    await waitFor(() => {
      expect(mockMarkAllAlertsAsRead).toHaveBeenCalledWith([1, 2]);
    });
  });

  it("pagina la lista localmente y muestra solo la pagina actual", async () => {
    const user = userEvent.setup();

    render(<List initialData={makePage(30)} onlyActive={false} />);

    expect(screen.getByText("Alerta 15")).toBeInTheDocument();
    expect(screen.queryByText("Alerta 16")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Go to page 2" }));

    expect(screen.getByText("Alerta 16")).toBeInTheDocument();
    expect(screen.queryByText("Alerta 1")).not.toBeInTheDocument();
  });

  it("no muestra paginacion cuando hay una sola pagina", () => {
    render(<List initialData={makePage(5)} onlyActive={false} />);

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("pagina tambien la vista de solo no leidas", async () => {
    const user = userEvent.setup();

    render(<List initialData={makePage(20)} onlyActive={true} />);

    expect(screen.getByText("Alerta 15")).toBeInTheDocument();
    expect(screen.queryByText("Alerta 16")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Go to page 2" }));

    expect(screen.getByText("Alerta 16")).toBeInTheDocument();
  });

  it("el toggle a no leidas reemplaza la url con onlyActive=true", async () => {
    const user = userEvent.setup();

    render(<List initialData={[]} onlyActive={false} />);

    await user.click(screen.getByRole("button", { name: /no le[ií]das/i }));

    expect(mockReplace).toHaveBeenCalledWith("/alertas?onlyActive=true");
  });

  it("el toggle a todas quita el filtro onlyActive", async () => {
    const user = userEvent.setup();

    render(<List initialData={[]} onlyActive={true} />);

    await user.click(screen.getByRole("button", { name: /todas/i }));

    expect(mockReplace).toHaveBeenCalledWith("/alertas");
  });
});