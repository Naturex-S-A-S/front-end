import { useEffect } from "react";

import { describe, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";

import { FormProvider, useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { render, screen, waitFor } from "@/utils/tests/test-utils";
import { orderSupplySchema } from "@/utils/schemas/orderSupply";

import Form from "../form";

vi.mock("@/hooks/product/useGetProductList", () => ({
  default: () => ({ productList: [{ id: "P-1", fullName: "Producto 1" }], isLoading: false, error: null })
}));

vi.mock("@/api/product", () => ({
  getProductList: vi.fn().mockResolvedValue([]),
  getProductsRelated: vi.fn().mockResolvedValue([{ id: "PR-1", fullName: "Presentación 1" }])
}));

const Harness = ({ orderCalculate }: { orderCalculate: () => Promise<boolean> }) => {
  const methods = useForm({
    defaultValues: { products: [], presentations: [], calculatedData: null },
    resolver: yupResolver(orderSupplySchema) as any
  });

  useEffect(() => {
    methods.setValue("products", [{ id: "P-1", fullName: "Producto 1" }]);
  }, [methods]);

  return (
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } })}
    >
      <FormProvider {...methods}>
        <Form
          isPending={false}
          isChanged={false}
          setIsChanged={() => {}}
          orderCalculate={orderCalculate}
          isPendingOrderCalculate={false}
        />
      </FormProvider>
    </QueryClientProvider>
  );
};

describe("aprovisionamiento form - QA-11 feedback de Calcular", () => {
  it("con presentación vacía muestra el error y no ejecuta el cálculo", async () => {
    const orderCalculate = vi.fn().mockResolvedValue(true);

    render(<Harness orderCalculate={orderCalculate} />);

    await waitFor(() => expect(screen.getByPlaceholderText(/unidades a producir/i)).toBeTruthy());

    fireEvent.click(screen.getByRole("button", { name: /calcular/i }));

    // helperText del campo + Alert resumen muestran el mismo mensaje
    await waitFor(() => expect(screen.getAllByText("La cantidad debe ser un número")).toHaveLength(2));
    expect(orderCalculate).not.toHaveBeenCalled();
  });
});
