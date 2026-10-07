import { describe, expect, it, vi } from "vitest";

import { fireEvent } from "@testing-library/react";

import { FormProvider, useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";

import { render, screen, waitFor } from "@/utils/tests/test-utils";
import { registerPriceSchema, type RegisterPriceFormValues } from "@/utils/schemas/costs";
import { createEmptySimulation } from "@/utils/costs";

import RegisterPriceCard from "../RegisterPriceCard";

const estimate = createEmptySimulation({ id: "TEST-1", isTestProduct: true });

const Harness = ({ onRegister, isTestProduct }: { onRegister: () => void; isTestProduct?: boolean }) => {
  const methods = useForm<RegisterPriceFormValues>({
    defaultValues: {
      wastePct: 0,
      comissionPct: 0,
      finalPrice: undefined,
      priceNotes: "",
      isDefinitive: false,
      materials: []
    },
    resolver: yupResolver(registerPriceSchema) as any
  });

  return (
    <FormProvider {...methods}>
      <RegisterPriceCard
        readonly={false}
        estimate={estimate}
        isRegisteringPrice={false}
        onRegister={onRegister}
        isTestProduct={isTestProduct}
      />
    </FormProvider>
  );
};

const submit = () => fireEvent.click(screen.getByRole("button", { name: /guardar precio/i }));

describe("RegisterPriceCard", () => {
  it("en modo dummy no exige el materials del form para disparar el guardado", async () => {
    const onRegister = vi.fn();

    render(<Harness onRegister={onRegister} isTestProduct />);

    submit();

    await waitFor(() => expect(onRegister).toHaveBeenCalledTimes(1));
  });

  it("en modo normal sigue exigiendo el materials del form", async () => {
    const onRegister = vi.fn();

    render(<Harness onRegister={onRegister} />);

    submit();

    await new Promise(resolve => setTimeout(resolve, 500));

    expect(onRegister).not.toHaveBeenCalled();
  });
});
