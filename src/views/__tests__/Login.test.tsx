/* eslint-disable import/no-named-as-default */
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";

import { render, screen, waitFor } from "@/utils/tests/test-utils";
import Login from "@/views/Login";
import { createMockRouter, createMockSettings, createSignInResponse } from "@/utils/tests/mocks";

const mockRouter = createMockRouter();
const mockSignIn = vi.fn();

vi.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
  getSession: vi.fn()
}));

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter
}));

vi.mock("@core/hooks/useSettings", () => ({
  useSettings: () => createMockSettings()
}));

vi.mock("@core/hooks/useImageVariant", () => ({
  useImageVariant: () => "/images/illustrations/auth/naturex-logo.avif"
}));

function getSubmitButton() {
  return screen.getByRole("button", { name: /iniciar sesi/i });
}

function getPasswordInput() {
  const input = document.querySelector('input[name="password"]');

  if (!input) throw new Error("Password input not found");

  return input as HTMLInputElement;
}

async function selectDocumentType(user: ReturnType<typeof userEvent.setup>) {
  const combobox = screen.getByRole("combobox", { name: /Tipo de documento/i });

  await user.click(combobox);
  await user.keyboard("{ArrowDown}{Enter}");
}

async function fillLoginForm(user: ReturnType<typeof userEvent.setup>) {
  await selectDocumentType(user);
  await user.type(screen.getByRole("textbox", { name: /Documento de identidad/i }), "123456789");
  await user.type(getPasswordInput(), "password123");
}

describe("Login", () => {
  describe("Renderizado del formulario", () => {
    it("muestra todos los campos y el boton de envio", () => {
      render(<Login mode='light' />);

      expect(screen.getByText(/Bienvenido a Naturex/i)).toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: /Tipo de documento/i })).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: /Documento de identidad/i })).toBeInTheDocument();
      expect(getPasswordInput()).toBeInTheDocument();
      expect(getSubmitButton()).toBeInTheDocument();
    });
  });

  describe("Validacion del formulario", () => {
    it("muestra errores cuando se envia vacio", async () => {
      const user = userEvent.setup();

      render(<Login mode='light' />);

      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(screen.getByText(/Tipo de documento es requerido/i)).toBeInTheDocument();
        expect(screen.getByText(/Documento de identidad es requerido/i)).toBeInTheDocument();
        expect(getPasswordInput()).toHaveAttribute("aria-invalid", "true");
      });

      expect(mockSignIn).not.toHaveBeenCalled();
    });
  });

  describe("Autenticacion", () => {
    it("envia las credenciales al API y redirige al home en caso exitoso", async () => {
      const user = userEvent.setup();

      mockSignIn.mockResolvedValue(createSignInResponse("/home"));

      render(<Login mode='light' />);

      await fillLoginForm(user);
      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith("credentials", {
          document: "123456789",
          password: "password123",
          documentType: "cedula",
          redirect: false,
          callbackUrl: "/home"
        });
      });

      expect(mockRouter.replace).toHaveBeenCalledWith("/home");
    });

    it("no redirige cuando las credenciales son incorrectas", async () => {
      const user = userEvent.setup();

      mockSignIn.mockResolvedValue(createSignInResponse(null, "CredentialsSignin"));

      render(<Login mode='light' />);

      await fillLoginForm(user);
      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });

      expect(mockRouter.replace).not.toHaveBeenCalled();
    });
  });
});
