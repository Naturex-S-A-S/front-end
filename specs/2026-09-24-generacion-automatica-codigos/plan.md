# Categoría single-select + contrato de códigos automáticos (+ categorías de lote y órdenes) — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adecuar el frontend al plan backend de generación automática de códigos: categoría de única selección (obligatoria en producto/empaque, opcional en materia prima), id/código auto-generado (sin campo manual), nuevas categorías de lote, y órdenes de producción sin fecha de vencimiento desde el cliente.

**Architecture:** Cambios acotados al contrato existente — la API mantiene **arrays** para categorías (`["id"]`, máx. 1 elemento). Tres frentes: (A) formularios de creación producto/empaque/materia prima + detalle de categorías (componente compartido `Categories`), (B) CRUD de categorías con campos nuevos por tipo + tipo nuevo "Categoría de lote", (C) orden de producción create/detail. No se tocan tablas ni migraciones (son del repo backend).

**Tech Stack:** Next.js 14, React 18, TypeScript, MUI v5, react-hook-form + yup 1.7, TanStack Query v5, vitest.

**Spec:** [`./spec.md`](./spec.md) — sección "Cambios sugeridos en el frontend". Esa spec es de **alcance backend** (migraciones, adapters JDBC, use cases) y se conserva acá por referencia de contrato; lo que ejecuta este repo es únicamente lo que esa sección prescribe. Ver también [`QA.md`](./QA.md).

Decisiones de contrato confirmadas con el usuario: (1) payload de categorías en **arrays** (`["id"]`, y `[]` al eliminar en detalle); (2) idType provisional del tipo "Categoría de lote" = `"4"` (confirmar con backend); (3) alcance A+B+C+D.

## Global Constraints

- La API **mantiene** el contrato de arreglo para categorías: `List<String>` con `@Size(min=1,max=1)` en producto/empaque, `@Size(max=1)` en materia prima. NUNCA enviar id suelto ni `null` — siempre arrays.
- Los DTOs de creación de Producto/Empaque/Materia prima ya **no aceptan `id`** (auto-generado). No enviar `id`/`code` en el POST.
- Producto: categoría **obligatoria** + nuevo campo `lotCategoryId` **obligatorio**. Empaque: categoría **obligatoria** + `productCode` obligatorio solo si la categoría tiene `dependsOnProduct=true`. Materia prima: categoría **opcional**.
- `category` en los formularios de creación es un objeto único `{id, name}` (o `null`); se envía como `["id"]` (1 elemento) o `[]`.
- yup v1: los schemas rechazan `null` por defecto; usar `.nullable()` explícito donde se admita.
- El detalle de orden: `OrderDetailDTO` expone `expirationLabel` y `lots: [{idFinalProduct, batchLot}]`; `order.batch` pasa a ser el consecutivo crudo.
- Orden de creación de producción: sin `date_expiration` en el payload; el backend calcula vencimiento y lote.
- Prettier: comillas dobles, sin trailing commas, `arrowParens: avoid`. ESLint: `no-unused-vars: error`.
- **Sin commits**: el plan no incluye pasos de `git commit`/`git add` por tarea; el trabajo queda en el working tree para revisión.

---

### Task 1: API + hook de categorías de lote

**Files:**
- Create: `src/api/general-parameters/categories-lot/index.ts`
- Create: `src/hooks/product/useGetLotCategory.ts`

**Interfaces:**
- Consumes: `API()` de `@/api/instances` (patrón de `src/api/general-parameters/categories-product/index.ts`).
- Produces:
  - `getCategoriesLot(): Promise<{id: string; name: string; lotFormat: string}[]>`
  - `postCategoryLot(data: { name: string; lotFormat: string; idType?: string }): Promise<any>`
  - `putCategoryLot(id: string, data: { name: string; lotFormat: string }): Promise<any>`
  - `deleteCategoryLot(id: string): Promise<any>`
  - `useGetLotCategory(): { lotCategories: {id,name,lotFormat}[]; isLoading: boolean }` (usado por el formulario de producto, Task 2)

- [ ] **Step 1: Escribir el archivo de API**

```ts
import { API } from "@/api/instances";

export const getCategoriesLot = async () => {
  const response = await API().get(`/categories/lot`);

  return response.data;
};

export const postCategoryLot = async (data: any) => {
  const response = await API().post(`/categories/lot`, data);

  return response.data;
};

export const putCategoryLot = async (id: string, data: any) => {
  const response = await API().put(`/categories/lot/${id}`, data);

  return response.data;
};

export const deleteCategoryLot = async (id: string) => {
  const response = await API().delete(`/categories/lot/${id}`);

  return response.data;
};
```

- [ ] **Step 2: Escribir el hook**

```ts
import { useQuery } from "@tanstack/react-query";

import { getCategoriesLot } from "@/api/general-parameters/categories-lot";

const useGetLotCategory = () => {
  const { data: lotCategories, isLoading } = useQuery({
    queryKey: ["getCategoriesLot"],
    queryFn: getCategoriesLot
  });

  return {
    lotCategories: lotCategories || [],
    isLoading
  };
};

export default useGetLotCategory;
```

- [ ] **Step 3: Verificar typescript y lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: sin errores.



---

### Task 2: Formulario de creación de Producto (categoría única + lotCategory + sin id)

**Files:**
- Modify: `src/views/pages/soporte/inventario/producto/create/form.tsx`
- Modify: `src/views/pages/soporte/inventario/producto/create/index.tsx`
- Modify: `src/utils/schemas/inventory/product.ts`
- Modify: `src/types/pages/product.ts`
- Test: `src/views/pages/soporte/inventario/producto/create/__tests__/productSchema.test.ts` (nuevo)

**Interfaces:**
- Consumes: `useGetLotCategory()` (Task 1); `ICreateProduct` actualizado.
- Produces: POST `/product` con body `{ name, categories: string[], measurement, unit, minimumStandard, lotCategoryId }` (sin `id`).

- [ ] **Step 1: Escribir el test que falla (schema)**

```ts
import { describe, it, expect } from "vitest";

import { productSchema } from "@/utils/schemas/inventory/product";

describe("productSchema", () => {
  it("requiere categoria y lotCategory como objetos unicos", async () => {
    await expect(
      productSchema.validate({
        name: "A",
        measurement: 100,
        unit: { id: "g", name: "g" },
        minimumStandard: 1,
        category: { id: "c1", name: "Cat" },
        lotCategory: { id: "l1", name: "Alimentos" }
      })
    ).resolves.toBeTruthy();
  });

  it("rechaza sin lotCategory", async () => {
    await expect(
      productSchema.validate({
        name: "A",
        measurement: 100,
        unit: { id: "g", name: "g" },
        minimumStandard: 1,
        category: { id: "c1", name: "Cat" },
        lotCategory: null
      })
    ).rejects.toThrow("La categoría de lote es requerida");
  });

  it("rechaza sin categoria", async () => {
    await expect(
      productSchema.validate({
        name: "A",
        measurement: 100,
        unit: { id: "g", name: "g" },
        minimumStandard: 1,
        category: null,
        lotCategory: { id: "l1", name: "Alimentos" }
      })
    ).rejects.toThrow("La categoría es requerida");
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `pnpm vitest run src/views/pages/soporte/inventario/producto/create/__tests__/productSchema.test.ts`
Expected: FAIL (schema aún valida `category` como array y no conoce `lotCategory`).

- [ ] **Step 3: Actualizar `productSchema`**

```ts
import * as yup from "yup";

export const productSchema = yup
  .object({
    name: yup.string().required("El nombre es requerido"),
    minimumStandard: yup
      .number()
      .min(0, "El minimo estandar debe ser mayor o igual a 0")
      .typeError("El minimo estandar debe ser un número")
      .required("El minimo estandar es requerido"),
    unit: yup.object().shape({
      name: yup.string().required("La etiqueta de la medida es requerida"),
      id: yup.string().required("La medida es requerida")
    }),
    measurement: yup.number().typeError("La medida debe ser un número").required("La unidad es requerida"),
    category: yup
      .object({
        id: yup.string().required("La categoría es requerida")
      })
      .required("La categoría es requerida"),
    lotCategory: yup
      .object({
        id: yup.string().required("La categoría de lote es requerida")
      })
      .required("La categoría de lote es requerida")
  })
  .required();

export const updateProductSchema = productSchema.omit(["category", "lotCategory"]);
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `pnpm vitest run src/views/pages/soporte/inventario/producto/create/__tests__/productSchema.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Actualizar el tipo `ICreateProduct`**

En `src/types/pages/product.ts`, reemplazar:

```ts
export interface ICreateProduct {
  id: string;
  name: string;
  categories: string[];
  measurement: number;
  unit: string;
  minimumStandard: number;
}
```

por:

```ts
export interface ICreateProduct {
  name: string;
  categories: string[];
  measurement: number;
  unit: string;
  minimumStandard: number;
  lotCategoryId: string;
}
```

`IProduct.categories` e `IUpdateProduct.categories` se mantienen como `string[]` (contrato de arrays).

- [ ] **Step 6: Actualizar `form.tsx`** — quitar el campo `id`, quitar `multiple` de categoría, agregar `lotCategory`

Reemplazar el bloque del campo `id` (líneas ~28-38) por nada, y añadir el Autocomplete de categoría de lote y el single-select de categoría. El `form.tsx` queda:

```tsx
import { Grid } from "@mui/material";

import { Controller, useFormContext } from "react-hook-form";

import CustomButton from "@/@core/components/mui/Button";
import CustomTextField from "@/@core/components/mui/TextField";
import CustomAutocomplete from "@/@core/components/mui/Autocomplete";
import useGetProductUnit from "@/hooks/product/useGetProductUnit";
import useGetCategory from "@/hooks/product/useGetCategory";
import useGetLotCategory from "@/hooks/product/useGetLotCategory";

type Props = {
  isPending: boolean;
  isEdit?: boolean;
};

const Form: React.FC<Props> = ({ isPending }) => {
  const { categories } = useGetCategory();
  const { units } = useGetProductUnit();
  const { lotCategories } = useGetLotCategory();

  const {
    register,
    formState: { errors },
    control
  }: any = useFormContext();

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <CustomTextField
          {...register("name")}
          autoFocus
          fullWidth
          label='Nombre'
          placeholder='Ingrese el nombre'
          error={!!errors.name}
          helperText={errors.name?.message}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name='category'
          control={control}
          render={({ field: { value, onChange } }: any) => (
            <CustomAutocomplete
              value={value}
              options={categories}
              onChange={(e, value: any) => {
                onChange(value);
              }}
              renderInput={params => (
                <CustomTextField
                  {...params}
                  label='Categoria'
                  placeholder='Seleccione una categoria'
                  error={!!errors.category?.message}
                  helperText={errors.category?.message}
                />
              )}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name='lotCategory'
          control={control}
          render={({ field: { value, onChange } }: any) => (
            <CustomAutocomplete
              value={value}
              options={lotCategories}
              onChange={(e, value: any) => {
                onChange(value);
              }}
              renderInput={params => (
                <CustomTextField
                  {...params}
                  label='Categoría de lote'
                  placeholder='Seleccione la categoría de lote'
                  error={!!errors.lotCategory?.message}
                  helperText={errors.lotCategory?.message}
                />
              )}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name='unit'
          control={control}
          render={({ field: { value, onChange } }: any) => (
            <CustomAutocomplete
              value={value}
              options={units}
              onChange={(e, value: any) => {
                onChange(value);
              }}
              renderInput={params => (
                <CustomTextField
                  {...params}
                  label='Unidad'
                  placeholder='Seleccione una unidad'
                  error={!!errors.unit}
                  helperText={errors.unit?.id?.message}
                />
              )}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CustomTextField
          {...register("measurement")}
          autoFocus
          fullWidth
          label='Medida'
          placeholder='Ingrese la medida'
          error={!!errors.measurement}
          helperText={errors.measurement?.message}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CustomTextField
          {...register("minimumStandard")}
          autoFocus
          fullWidth
          type='number'
          label='Stock mínimo'
          placeholder='Ingrese el stock minimo'
          error={!!errors.minimumStandard}
          helperText={errors.minimumStandard?.message}
        />
      </Grid>

      <Grid item xs={12} className='flex justify-center'>
        <CustomButton text='Guardar' type='submit' isLoading={isPending} />
      </Grid>
    </Grid>
  );
};

export default Form;
```

- [ ] **Step 7: Actualizar `index.tsx`** — payload sin `id`, categorías como array, `lotCategoryId`

Reemplazar las defaultValues (quitar `id`) y `onSubmit`:

```tsx
const methods = useForm({
  defaultValues: {
    name: undefined,
    measurement: undefined,
    unit: undefined,
    minimumStandard: undefined
  },

  resolver: yupResolver(productSchema)
});
```

```tsx
const onSubmit = (values: any) => {
  mutate({
    ...values,
    unit: values.unit.id,
    categories: values.category ? [values.category.id] : [],
    lotCategoryId: values.lotCategory.id
  });
};
```

- [ ] **Step 8: Verificar typecheck, lint y tests**

Run: `npx tsc --noEmit && pnpm lint && pnpm vitest run src/views/pages/soporte/inventario/producto/create`
Expected: sin errores y tests PASS.



---

### Task 3: Formulario de creación de Material de empaque (categoría única + productCode condicional)

**Files:**
- Modify: `src/views/pages/soporte/inventario/material-empaque/create/form.tsx`
- Modify: `src/views/pages/soporte/inventario/material-empaque/create/index.tsx`
- Modify: `src/utils/schemas/inventory/packagingMaterial.ts`
- Test: `src/views/pages/soporte/inventario/material-empaque/create/__tests__/packagingMaterialSchema.test.ts` (nuevo)

**Interfaces:**
- Consumes: `useGetCategory()` de packaging (los objetos de categoría traen `dependsOnProduct?: boolean` tras el cambio backend).
- Produces: POST `/packaging` con body `{ name, minimumStandard, color, category: string[], productCode?: string }`.

- [ ] **Step 1: Escribir el test que falla (schema)**

```ts
import { describe, it, expect } from "vitest";

import { packagingMaterialSchema } from "@/utils/schemas/inventory/packagingMaterial";

describe("packagingMaterialSchema", () => {
  it("requiere categoria como objeto unico", async () => {
    await expect(
      packagingMaterialSchema.validate({
        name: "A",
        minimumStandard: 1,
        category: { id: "c1", name: "Envase", dependsOnProduct: false }
      })
    ).resolves.toBeTruthy();
  });

  it("rechaza sin categoria", async () => {
    await expect(
      packagingMaterialSchema.validate({
        name: "A",
        minimumStandard: 1,
        category: null
      })
    ).rejects.toThrow("La categoría es requerida");
  });

  it("requiere productCode cuando dependsOnProduct es true", async () => {
    await expect(
      packagingMaterialSchema.validate({
        name: "A",
        minimumStandard: 1,
        category: { id: "c1", name: "Etiqueta", dependsOnProduct: true }
      })
    ).rejects.toThrow("El código de producto es requerido");
  });

  it("acepta productCode cuando dependsOnProduct es true", async () => {
    await expect(
      packagingMaterialSchema.validate({
        name: "A",
        minimumStandard: 1,
        category: { id: "c1", name: "Etiqueta", dependsOnProduct: true },
        productCode: "P-001"
      })
    ).resolves.toBeTruthy();
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `pnpm vitest run src/views/pages/soporte/inventario/material-empaque/create/__tests__/packagingMaterialSchema.test.ts`
Expected: FAIL.

- [ ] **Step 3: Actualizar `packagingMaterialSchema`**

```ts
import * as yup from "yup";

export const packagingMaterialSchema = yup
  .object({
    name: yup.string().required("El nombre es requerido"),
    minimumStandard: yup
      .number()
      .min(0, "El minimo estandar debe ser mayor o igual a 0")
      .typeError("El minimo estandar debe ser un número")
      .required("El minimo estandar es requerido"),
    color: yup.string().optional(),
    category: yup
      .object({
        id: yup.string().required("La categoría es requerida")
      })
      .required("La categoría es requerida"),
    productCode: yup
      .string()
      .when("category", {
        is: (category: any) => category?.dependsOnProduct === true,
        then: schema => schema.required("El código de producto es requerido"),
        otherwise: schema => schema.notRequired()
      })
  })
  .required();
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `pnpm vitest run src/views/pages/soporte/inventario/material-empaque/create/__tests__/packagingMaterialSchema.test.ts`
Expected: PASS.

- [ ] **Step 5: Actualizar `form.tsx`** — categoría single-select + campo condicional `productCode`

```tsx
import { Grid } from "@mui/material";

import { Controller, useFormContext, useWatch } from "react-hook-form";

import CustomButton from "@/@core/components/mui/Button";
import CustomTextField from "@/@core/components/mui/TextField";
import useGetCategory from "@/hooks/packaging/useGetCategory";
import CustomAutocomplete from "@/@core/components/mui/Autocomplete";

type Props = {
  isPending: boolean;
  isEdit?: boolean;
};

const Form: React.FC<Props> = ({ isPending }) => {
  const { categories } = useGetCategory();

  const {
    register,
    formState: { errors },
    control
  }: any = useFormContext();

  const categoryWatch = useWatch({ control, name: "category" });

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <CustomTextField
          {...register("name")}
          autoFocus
          fullWidth
          label='Nombre'
          placeholder='Ingrese el nombre'
          error={!!errors.name}
          helperText={errors.name?.message}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name='category'
          control={control}
          render={({ field: { value, onChange } }: any) => (
            <CustomAutocomplete
              value={value}
              options={categories}
              onChange={(e, value: any) => {
                onChange(value);
              }}
              renderInput={params => (
                <CustomTextField
                  {...params}
                  label='Categoria'
                  placeholder='Seleccione una categoria'
                  error={!!errors.category?.message}
                  helperText={errors.category?.message}
                />
              )}
            />
          )}
        />
      </Grid>
      {categoryWatch?.dependsOnProduct === true && (
        <Grid item xs={12} md={6}>
          <CustomTextField
            {...register("productCode")}
            fullWidth
            label='Código de producto'
            placeholder='Ingrese el código de producto'
            error={!!errors.productCode}
            helperText={errors.productCode?.message}
          />
        </Grid>
      )}
      <Grid item xs={12} md={6}>
        <CustomTextField
          {...register("minimumStandard")}
          autoFocus
          fullWidth
          type='number'
          label='Stock mínimo'
          placeholder='Ingrese el stock minimo'
          error={!!errors.minimumStandard}
          helperText={errors.minimumStandard?.message}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <CustomTextField
          {...register("color")}
          autoFocus
          fullWidth
          label='Color'
          placeholder='Ingrese el color'
          error={!!errors.color}
          helperText={errors.color?.message}
        />
      </Grid>

      <Grid item xs={12} className='flex justify-center'>
        <CustomButton text='Guardar' type='submit' isLoading={isPending} />
      </Grid>
    </Grid>
  );
};

export default Form;
```

- [ ] **Step 6: Actualizar `index.tsx`**

```tsx
const onSubmit = (values: any) => {
  mutate({
    name: values.name,
    minimumStandard: values.minimumStandard,
    color: values.color,
    category: [values.category.id],
    ...(values.productCode ? { productCode: values.productCode } : {})
  });
};
```

- [ ] **Step 7: Verificar typecheck, lint y tests**

Run: `npx tsc --noEmit && pnpm lint && pnpm vitest run src/views/pages/soporte/inventario/material-empaque/create`
Expected: sin errores y tests PASS.



---

### Task 4: Formulario de creación de Materia prima (categoría opcional única)

**Files:**
- Modify: `src/views/pages/soporte/inventario/materia-prima/create/form.tsx`
- Modify: `src/views/pages/soporte/inventario/materia-prima/create/index.tsx`
- Modify: `src/utils/schemas/inventory/rawMaterial.ts`
- Test: `src/views/pages/soporte/inventario/materia-prima/create/__tests__/rawMaterialSchema.test.ts` (nuevo)

**Interfaces:**
- Produces: POST `/feedstock` con body `{ name, minimumStandard, allergen, category: string[] }` (`category` puede ir `[]`).

- [ ] **Step 1: Escribir el test que falla (schema)**

```ts
import { describe, it, expect } from "vitest";

import { rawMaterialSchema } from "@/utils/schemas/inventory/rawMaterial";

describe("rawMaterialSchema", () => {
  it("acepta categoria opcional null", async () => {
    await expect(
      rawMaterialSchema.validate({
        name: "A",
        minimumStandard: 1,
        allergen: false,
        category: null
      })
    ).resolves.toBeTruthy();
  });

  it("acepta categoria unica", async () => {
    await expect(
      rawMaterialSchema.validate({
        name: "A",
        minimumStandard: 1,
        allergen: false,
        category: { id: "c1", name: "Polvos" }
      })
    ).resolves.toBeTruthy();
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `pnpm vitest run src/views/pages/soporte/inventario/materia-prima/create/__tests__/rawMaterialSchema.test.ts`
Expected: FAIL (schema actual espera `category` como array requerida).

- [ ] **Step 3: Actualizar `rawMaterialSchema`**

```ts
import * as yup from "yup";

export const rawMaterialSchema = yup
  .object({
    name: yup.string().required("El nombre es requerido"),
    minimumStandard: yup
      .number()
      .min(0, "El minimo estandar debe ser mayor o igual a 0")
      .typeError("El minimo estandar debe ser un número")
      .required("El minimo estandar es requerido"),
    allergen: yup.boolean().required(),
    category: yup
      .object({
        id: yup.string().required("La categoría es requerida")
      })
      .nullable()
      .optional()
  })
  .required();
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `pnpm vitest run src/views/pages/soporte/inventario/materia-prima/create/__tests__/rawMaterialSchema.test.ts`
Expected: PASS.

- [ ] **Step 5: Actualizar `form.tsx`** — quitar `multiple` del Autocomplete de categoría

En `src/views/pages/soporte/inventario/materia-prima/create/form.tsx` eliminar la línea `multiple` del `CustomAutocomplete` de categoría (queda igual al patrón de producto sin `multiple`).

- [ ] **Step 6: Actualizar `index.tsx`**

```tsx
const onSubmit = (values: any) => {
  mutate({
    ...values,
    category: values.category ? [values.category.id] : []
  });
};
```

- [ ] **Step 7: Verificar typecheck, lint y tests**

Run: `npx tsc --noEmit && pnpm lint && pnpm vitest run src/views/pages/soporte/inventario/materia-prima/create`
Expected: sin errores y tests PASS.



---

### Task 5: Componente compartido `Categories` en detalles — reemplazar en vez de acumular

**Files:**
- Modify: `src/@core/components/inventory/categories.tsx`
- Test: `src/@core/components/inventory/__tests__/categories.test.tsx` (nuevo)

**Interfaces:**
- Consumes: props `data: {id,name}[]`, `list: {id,name}[]`, `update: (newCategories: string[]) => void`, `isPending?: boolean`.
- Produces: `handleAdd` → `update([values.category.id])` (reemplaza); `handleDelete` → `update([])`. Prop `update` sigue siendo `string[]`.

- [ ] **Step 1: Escribir el test que falla**

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@/utils/tests/test-utils";
import userEvent from "@testing-library/user-event";
import Categories from "../categories";

describe("Categories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("agregar reemplaza la lista por una unica categoria", async () => {
    const user = userEvent.setup();
    const update = vi.fn();

    render(
      <Categories
        data={[{ id: "c1", name: "Actual" }]}
        list={[{ id: "c2", name: "Nueva" }]}
        update={update}
      />
    );

    await user.click(screen.getByRole("button", { name: /agregar/i }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("combobox"));
    await user.click(screen.getByText("Nueva"));
    await user.click(within(dialog).getByRole("button", { name: /^agregar$/i }));

    expect(update).toHaveBeenCalledWith(["c2"]);
  });

  it("eliminar envia array vacio", async () => {
    const user = userEvent.setup();
    const update = vi.fn();

    render(
      <Categories data={[{ id: "c1", name: "Actual" }]} list={[]} update={update} />
    );

    await user.click(screen.getByRole("button", { name: /delete/i }));

    expect(update).toHaveBeenCalledWith([]);
  });
});
```

> Nota: hay dos botones "Agregar" (acción de la Card y submit del diálogo); los clics dentro del diálogo se acotan con `within(dialog)`. Si `@/utils/tests/test-utils` no re-exporta `within`, importarlo desde `@testing-library/react`.

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `pnpm vitest run src/@core/components/inventory/__tests__/categories.test.tsx`
Expected: FAIL (`handleAdd` hace append; `handleDelete` envía array filtrado).

- [ ] **Step 3: Actualizar `handleAdd` y `handleDelete`**

En `src/@core/components/inventory/categories.tsx`:

```tsx
const handleAdd = (values: any) => {
  update(values.category ? [values.category.id] : []);
  reset();
  toogleDialog();
};

const handleDelete = (id: string) => {
  update([]);
};
```

`handleDelete` ya no usa `id` — dejarlo como parámetro para no romper la firma del `onDelete` del Chip, pero el cuerpo ignora el id (el linter no marca parámetros de callbacks no usados en este patrón; si lo hace, usar `_id`). Prefijar el parámetro como `_id` si ESLint se queja.

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `pnpm vitest run src/@core/components/inventory/__tests__/categories.test.tsx`
Expected: PASS.

- [ ] **Step 5: Verificar typecheck y lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: sin errores (ajustar `handleDelete` a `_id` si ESLint marca no-unused-vars).



---

### Task 6: Tipos, enums y mocks de categorías (incluye tipo "Lote")

**Files:**
- Modify: `src/utils/enum/index.ts`
- Modify: `src/utils/mocks/index.ts`
- Modify: `src/types/pages/generalParameters.ts`

**Interfaces:**
- Produces: `CategoryType.LOT = "4"` (provisional), `CategoryTypeName.LOT = "Categoría de lote"`, `mockCategoryTypes` con la 4ª opción, `mockLotFormats` (para el select de formato de lote), `ICategory` con campos nuevos opcionales.

- [ ] **Step 1: Actualizar `src/utils/enum/index.ts`**

```ts
export enum CategoryType {
  FEEDSTOCK = "1",
  PACKAGING = "2",
  FINISHED_PRODUCT = "3",
  LOT = "4"
}

export enum CategoryTypeName {
  FEEDSTOCK = "Materia prima",
  PACKAGING = "Material de empaque",
  FINISHED_PRODUCT = "Producto terminado",
  LOT = "Categoría de lote"
}

// Normaliza el idType entre create (numérico) y edit (el listado entrega el nombre en category.type).
export const categoryTypeIdByLabel: Record<string, CategoryType> = {
  [CategoryTypeName.FEEDSTOCK]: CategoryType.FEEDSTOCK,
  [CategoryTypeName.PACKAGING]: CategoryType.PACKAGING,
  [CategoryTypeName.FINISHED_PRODUCT]: CategoryType.FINISHED_PRODUCT,
  [CategoryTypeName.LOT]: CategoryType.LOT
};
```

- [ ] **Step 2: Actualizar `src/utils/mocks/index.ts`**

Añadir al arreglo `mockCategoryTypes`:

```ts
{
  label: "Categoría de lote",
  id: CategoryType.LOT
}
```

Y exportar un nuevo arreglo junto a `mockCategoryTypes`:

```ts
export const mockLotFormats = [
  { id: "ALIMENTOS", label: "Alimentos" },
  { id: "COSMETICOS", label: "Cosméticos" }
];
```

(Nota: si el backend provee un endpoint de formatos soportados, migrar este select a ese endpoint en el futuro — deuda técnica documentada en el plan backend.)

- [ ] **Step 3: Actualizar `src/types/pages/generalParameters.ts`**

```ts
export interface ICategory extends IBaseCategory {
  id: string;
  categoryId: string;
  type?: string;
  dateCreated: string;
  idIndicator?: string;
  expirationMonths?: number;
  codeIndicator?: string;
  dependsOnProduct?: boolean;
  lotFormat?: string;
}
```

- [ ] **Step 4: Verificar typecheck y lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: sin errores.



---

### Task 7: Schema del formulario de categoría (campos por tipo)

**Files:**
- Modify: `src/utils/schemas/generalParameters.ts`
- Test: `src/utils/schemas/__tests__/generalParameters.test.ts` (nuevo)

**Interfaces:**
- Produces: `categorySchema` validando `name`, `type`, y campos condicionales según `type.id`.

- [ ] **Step 1: Escribir el test que falla**

```ts
import { describe, it, expect } from "vitest";

import { categorySchema } from "@/utils/schemas/generalParameters";
import { CategoryType } from "@/utils/enum";

const base = {
  type: { id: CategoryType.FINISHED_PRODUCT, label: "Producto terminado" }
};

describe("categorySchema", () => {
  it("producto requiere idIndicator de 2 digitos y expirationMonths", async () => {
    await expect(
      categorySchema.validate({ name: "A", ...base, idIndicator: "2A" })
    ).rejects.toThrow("El indicativo de id debe tener exactamente 2 dígitos");
  });

  it("producto valida correctamente", async () => {
    await expect(
      categorySchema.validate({ name: "A", ...base, idIndicator: "20", expirationMonths: 4 })
    ).resolves.toBeTruthy();
  });

  it("empaque requiere codeIndicator", async () => {
    const pkg = { type: { id: CategoryType.PACKAGING, label: "Material de empaque" } };

    await expect(categorySchema.validate({ name: "A", ...pkg })).rejects.toThrow(
      "El indicativo de código es requerido"
    );
  });

  it("lote requiere lotFormat", async () => {
    const lot = { type: { id: CategoryType.LOT, label: "Categoría de lote" } };

    await expect(categorySchema.validate({ name: "A", ...lot })).rejects.toThrow(
      "El formato de lote es requerido"
    );
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `pnpm vitest run src/utils/schemas/__tests__/generalParameters.test.ts`
Expected: FAIL.

- [ ] **Step 3: Actualizar `categorySchema`**

```ts
import * as yup from "yup";
import { CategoryType } from "@/utils/enum";

export const categorySchema = yup
  .object({
    name: yup.string().required("El nombre es requerido"),
    type: yup
      .object()
      .shape({
        id: yup.string().required("El tipo es requerido"),
        label: yup.string().optional()
      })
      .required("El tipo es requerido"),
    idIndicator: yup
      .string()
      .when("type", {
        is: (type: any) => type?.id === CategoryType.FINISHED_PRODUCT,
        then: schema =>
          schema
            .matches(/^\d{2}$/, "El indicativo de id debe tener exactamente 2 dígitos")
            .required("El indicativo de id es requerido"),
        otherwise: schema => schema.notRequired()
      }),
    expirationMonths: yup
      .number()
      .when("type", {
        is: (type: any) => type?.id === CategoryType.FINISHED_PRODUCT,
        then: schema =>
          schema
            .integer("Debe ser un número entero")
            .min(1, "Debe ser al menos 1 mes")
            .required("Los meses de vencimiento son requeridos"),
        otherwise: schema => schema.notRequired()
      }),
    codeIndicator: yup
      .string()
      .when("type", {
        is: (type: any) => type?.id === CategoryType.PACKAGING,
        then: schema =>
          schema
            .min(1, "El indicativo de código es requerido")
            .max(4, "El indicativo de código no puede exceder 4 caracteres")
            .required("El indicativo de código es requerido"),
        otherwise: schema => schema.notRequired()
      }),
    dependsOnProduct: yup.boolean().optional().default(false),
    lotFormat: yup
      .object({
        id: yup.string().required("El formato de lote es requerido"),
        label: yup.string().optional()
      })
      .when("type", {
        is: (type: any) => type?.id === CategoryType.LOT,
        then: schema => schema.required("El formato de lote es requerido"),
        otherwise: schema => schema.notRequired()
      })
  })
  .required();
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `pnpm vitest run src/utils/schemas/__tests__/generalParameters.test.ts`
Expected: PASS.

- [ ] **Step 5: Verificar typecheck y lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: sin errores.



---

### Task 8: Formulario de categoría — campos condicionales por tipo (create)

**Files:**
- Modify: `src/views/pages/soporte/parametros-generales/category/form.tsx`
- Modify: `src/views/pages/soporte/parametros-generales/category/create.tsx`

**Interfaces:**
- Consumes: `categorySchema` (Task 7), `mockLotFormats` (Task 6), `CategoryType` (Task 6), `postCategoryLot` (Task 1).
- Produces: POST según `type.id` → `postCategoryFeedstock | postCategoryPackaging | postCategoryProduct | postCategoryLot`.

- [ ] **Step 1: Actualizar `form.tsx` — campos condicionales**

```tsx
import { Grid } from "@mui/material";

import { Controller, useFormContext, useWatch } from "react-hook-form";

import CustomAutocomplete from "@/@core/components/mui/Autocomplete";
import CustomButton from "@/@core/components/mui/Button";
import CustomTextField from "@/@core/components/mui/TextField";
import { mockCategoryTypes, mockLotFormats } from "@/utils/mocks";
import { CategoryType } from "@/utils/enum";
import { Checkbox, FormControlLabel } from "@mui/material";

interface Props {
  isPending: boolean;
  isEdit?: boolean;
}

const Form = ({ isPending, isEdit = false }: Props) => {
  const {
    control,
    formState: { errors },
    register
  }: any = useFormContext();

  const typeWatch = useWatch({ control, name: "type" });

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={isEdit ? 12 : 6}>
        <CustomTextField
          {...register("name")}
          autoFocus
          fullWidth
          label='Nombre'
          placeholder='Ingrese el nombre'
          error={!!errors.name}
          helperText={errors.name?.message as string}
        />
      </Grid>
      {!isEdit && (
        <Grid item xs={12} md={6}>
          <Controller
            name='type'
            control={control}
            render={({ field: { value, onChange } }: any) => (
              <CustomAutocomplete
                value={value}
                options={mockCategoryTypes}
                onChange={(e, value: any) => {
                  onChange(value);
                }}
                renderInput={params => (
                  <CustomTextField
                    {...params}
                    label='Tipo'
                    placeholder='Seleccione un tipo'
                    error={!!errors.type}
                    helperText={errors.type?.id?.message as string}
                  />
                )}
              />
            )}
          />
        </Grid>
      )}

      {typeWatch?.id === CategoryType.FINISHED_PRODUCT && (
        <>
          <Grid item xs={12} md={6}>
            <CustomTextField
              {...register("idIndicator")}
              fullWidth
              label='Indicativo de id'
              placeholder='Ingrese el indicativo (2 dígitos, ej: 20)'
              error={!!errors.idIndicator}
              helperText={errors.idIndicator?.message as string}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomTextField
              {...register("expirationMonths")}
              fullWidth
              type='number'
              label='Meses de vencimiento'
              placeholder='Ingrese los meses de vencimiento'
              error={!!errors.expirationMonths}
              helperText={errors.expirationMonths?.message as string}
            />
          </Grid>
        </>
      )}

      {typeWatch?.id === CategoryType.PACKAGING && (
        <>
          <Grid item xs={12} md={6}>
            <CustomTextField
              {...register("codeIndicator")}
              fullWidth
              label='Indicativo de código'
              placeholder='Ingrese el indicativo (1-4 caracteres, ej: ET)'
              error={!!errors.codeIndicator}
              helperText={errors.codeIndicator?.message as string}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Checkbox {...register("dependsOnProduct")} />}
              label='Depende del producto'
            />
          </Grid>
        </>
      )}

      {typeWatch?.id === CategoryType.LOT && (
        <Grid item xs={12} md={6}>
          <Controller
            name='lotFormat'
            control={control}
            render={({ field: { value, onChange } }: any) => (
              <CustomAutocomplete
                value={value}
                options={mockLotFormats}
                onChange={(e, value: any) => {
                  onChange(value);
                }}
                renderInput={params => (
                  <CustomTextField
                    {...params}
                    label='Formato de lote'
                    placeholder='Seleccione el formato de lote'
                    error={!!errors.lotFormat?.message}
                    helperText={errors.lotFormat?.message as string}
                  />
                )}
              />
            )}
          />
        </Grid>
      )}

      <Grid item xs={12} className='flex justify-center'>
        <CustomButton text='Guardar' type='submit' isLoading={isPending} />
      </Grid>
    </Grid>
  );
};

export default Form;
```

- [ ] **Step 2: Actualizar `create.tsx` — dispatch por tipo + payload con campos nuevos**

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";

import { FormProvider, useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";

import { useAbility } from "@/hooks/casl/useAbility";
import CustomCard from "@/@core/components/mui/Card";
import { ABILITY_ACTIONS, ABILITY_FIELDS, ABILITY_SUBJECT } from "@/utils/constant";
import { categorySchema } from "@/utils/schemas/generalParameters";
import Form from "./form";
import { alertMessageErrors } from "@/utils/messages";
import { postCategoryFeedstock } from "@/api/general-parameters/categories-feedstock";
import { postCategoryPackaging } from "@/api/general-parameters/categories-packaging";
import { postCategoryProduct } from "@/api/general-parameters/categories-product";
import { postCategoryLot } from "@/api/general-parameters/categories-lot";
import { CategoryType } from "@/utils/enum";

const postCategoryByType = (data: any) => {
  switch (data.idType) {
    case CategoryType.FEEDSTOCK:
      return postCategoryFeedstock(data);
    case CategoryType.PACKAGING:
      return postCategoryPackaging(data);
    case CategoryType.LOT:
      return postCategoryLot(data);
    default:
      return postCategoryProduct(data);
  }
};

const Create = () => {
  const queryClient = useQueryClient();
  const ability = useAbility();

  const methods = useForm({
    defaultValues: {
      name: undefined,
      type: undefined,
      dependsOnProduct: false
    },
    resolver: yupResolver(categorySchema)
  });

  const { handleSubmit, reset } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (variables: any) => postCategoryByType(variables),
    onSuccess: () => {
      toast.success("Categoria creada con éxito");
      queryClient.invalidateQueries({ queryKey: ["getCategories"] });
      queryClient.invalidateQueries({ queryKey: ["getCategoriesLot"] });
      reset();
    },
    onError: (error: any) => {
      alertMessageErrors(error, "Error al crear la categoria");
    }
  });

  if (!ability.can(ABILITY_ACTIONS.CREATE as any, ABILITY_SUBJECT.GENERAL_PARAMETERS, ABILITY_FIELDS.CATEGORIES))
    return null;

  const onSubmit = (data: any) => {
    const payload: any = {
      name: data.name,
      idType: data.type.id
    };

    if (data.type.id === CategoryType.FINISHED_PRODUCT) {
      payload.idIndicator = data.idIndicator;
      payload.expirationMonths = Number(data.expirationMonths);
    } else if (data.type.id === CategoryType.PACKAGING) {
      payload.codeIndicator = data.codeIndicator;
      payload.dependsOnProduct = !!data.dependsOnProduct;
    } else if (data.type.id === CategoryType.LOT) {
      payload.lotFormat = data.lotFormat.id;
    }

    mutate(payload);
  };

  return (
    <CustomCard title='Crear Categoria'>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Form isPending={isPending} />
        </form>
      </FormProvider>
    </CustomCard>
  );
};

export default Create;
```

- [ ] **Step 3: Verificar typecheck y lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: sin errores.



---

### Task 9: Formulario de edición de categoría (campos por tipo)

**Files:**
- Modify: `src/views/pages/soporte/parametros-generales/category/update.tsx`

**Interfaces:**
- Consumes: `categorySchema`, `CategoryType`, `putCategoryLot` (Task 1).
- Produces: PUT según `type.id` con campos nuevos del tipo.

- [ ] **Step 1: Actualizar `update.tsx`**

```tsx
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { categorySchema } from "@/utils/schemas/generalParameters";
import CustomDialog from "@/@core/components/mui/Dialog";
import Form from "./form";
import type { ICategory } from "@/types/pages/generalParameters";
import { alertMessageErrors } from "@/utils/messages";
import { putCategoryFeedstock } from "@/api/general-parameters/categories-feedstock";
import { CategoryType, categoryTypeIdByLabel } from "@/utils/enum";
import { putCategoryPackaging } from "@/api/general-parameters/categories-packaging";
import { putCategoryProduct } from "@/api/general-parameters/categories-product";
import { putCategoryLot } from "@/api/general-parameters/categories-lot";

interface Props {
  category: ICategory;
  open: boolean;
  toogleDialog: () => void;
}

const putCategoryByType = (data: any) => {
  switch (data.idType) {
    case CategoryType.FEEDSTOCK:
      return putCategoryFeedstock(data);
    case CategoryType.PACKAGING:
      return putCategoryPackaging(data);
    case CategoryType.LOT:
      return putCategoryLot(data);
    default:
      return putCategoryProduct(data);
  }
};

const Update = ({ open, toogleDialog, category }: Props) => {
  const queryClient = useQueryClient();

  const methods = useForm({
    defaultValues: {
      name: category.name,
      // En el listado, category.type es el NOMBRE; lo normalizamos al id numérico para que el
      // formulario (campos condicionales) y el schema validen igual que en create.
      type: { label: category.type, id: categoryTypeIdByLabel[category.type ?? ""] ?? category.type },
      idIndicator: category.idIndicator,
      expirationMonths: category.expirationMonths,
      codeIndicator: category.codeIndicator,
      dependsOnProduct: category.dependsOnProduct ?? false,
      lotFormat: category.lotFormat ? { id: category.lotFormat, label: category.lotFormat } : null
    },
    resolver: yupResolver(categorySchema)
  });

  const { handleSubmit, reset } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) => putCategoryByType(data),
    onSuccess: () => {
      toast.success("Categoria actualizada con éxito");
      queryClient.invalidateQueries({ queryKey: ["getCategories"] });
      queryClient.invalidateQueries({ queryKey: ["getCategoriesLot"] });
      toogleDialog();
      reset();
    },
    onError: (error: any) => {
      alertMessageErrors(error, "Error al actualizar la categoria");
    }
  });

  const onSubmit = (data: any) => {
    const payload: any = {
      id: category.categoryId,
      idType: data.type.id,
      name: data.name
    };

    if (data.type.id === CategoryType.FINISHED_PRODUCT) {
      payload.idIndicator = data.idIndicator;
      payload.expirationMonths = Number(data.expirationMonths);
    } else if (data.type.id === CategoryType.PACKAGING) {
      payload.codeIndicator = data.codeIndicator;
      payload.dependsOnProduct = !!data.dependsOnProduct;
    } else if (data.type.id === CategoryType.LOT) {
      payload.lotFormat = data.lotFormat?.id;
    }

    mutate(payload);
  };

  return (
    <CustomDialog open={open} toogleDialog={toogleDialog} title='Editar categoria' maxWidth='sm'>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Form isPending={isPending} isEdit />
        </form>
      </FormProvider>
    </CustomDialog>
  );
};

export default Update;
```

> Nota: la normalización `categoryTypeIdByLabel` garantiza que `type.id` sea el id numérico también en edición, así `categorySchema`, los campos condicionales del `Form` y el `onSubmit` comparan siempre contra `CategoryType` (nunca contra el nombre).

- [ ] **Step 2: Verificar typecheck y lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: sin errores.



---

### Task 10: Listado/index de categorías — dispatch del tipo "Lote" en eliminar

**Files:**
- Modify: `src/views/pages/soporte/parametros-generales/category/index.tsx`

**Interfaces:**
- Consumes: `deleteCategoryLot` (Task 1), `CategoryTypeName.LOT` (Task 6).
- Produces: eliminación de categorías de lote vía `deleteCategoryLot`.

- [ ] **Step 1: Actualizar el dispatch de `deleteCategory`**

En `src/views/pages/soporte/parametros-generales/category/index.tsx`, importar `deleteCategoryLot` y reemplazar el ternary del `mutationFn`:

```tsx
import { deleteCategoryLot } from "@/api/general-parameters/categories-lot";
```

```tsx
mutationFn: (variables: any) => {
  switch (variables.idType) {
    case CategoryTypeName.FEEDSTOCK:
      return deleteCategoryFeedstock(variables.id);
    case CategoryTypeName.PACKAGING:
      return deleteCategoryPackaging(variables.id);
    case CategoryTypeName.LOT:
      return deleteCategoryLot(variables.id);
    default:
      return deleteCategoryProduct(variables.id);
  }
}
```

- [ ] **Step 2: Verificar typecheck y lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: sin errores.



---

### Task 11: Orden de producción — quitar fecha de vencimiento del formulario/payload

**Files:**
- Modify: `src/utils/defaultValues/order.ts`
- Modify: `src/utils/schemas/order.ts`
- Modify: `src/views/pages/produccion/ordenes/create.tsx`
- Modify: `src/views/pages/produccion/ordenes/form.tsx`
- Modify: `src/types/pages/order.ts` (`IOrderCreate` quita `date_expiration`)
- Test: `src/utils/schemas/__tests__/order.test.ts` (nuevo)

**Interfaces:**
- Produces: POST `/orders` sin `date_expiration`; `IOrderCreate` sin `date_expiration`.

- [ ] **Step 1: Escribir el test que falla**

```ts
import { describe, it, expect } from "vitest";

import { orderSchema } from "@/utils/schemas/order";

describe("orderSchema", () => {
  it("no exige expirationDate1", async () => {
    await expect(
      orderSchema.validate({
        presentations: [{ id: "P-001", quantityG: 10 }]
      })
    ).resolves.toBeTruthy();
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `pnpm vitest run src/utils/schemas/__tests__/order.test.ts`
Expected: FAIL (schema exige `expirationDate1`).

- [ ] **Step 3: Actualizar `orderSchema`**

En `src/utils/schemas/order.ts`, eliminar la línea:

```ts
expirationDate1: yup.date().required("La fecha de expiración es requerida")
```

Queda:

```ts
export const orderSchema = yup
  .object({
    presentations: yup.array().of(
      yup.object().shape({
        id: yup.string().required("El ID de la presentación es requerido"),
        quantityG: yup
          .number()
          .typeError("La cantidad debe ser un número")
          .min(0, "La cantidad debe ser al menos 0")
          .required("La cantidad es requerida")
      })
    )
  })
  .required();
```

No tocar el resto de schemas de ajustes del mismo archivo.

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `pnpm vitest run src/utils/schemas/__tests__/order.test.ts`
Expected: PASS.

- [ ] **Step 5: Actualizar `orderDefaultValues`**

En `src/utils/defaultValues/order.ts`:

```ts
export const orderDefaultValues = {
  presentations: [
    {
      id: "",
      quantityG: undefined
    }
  ]
};
```

- [ ] **Step 6: Actualizar `create.tsx`** — quitar `date_expiration` del payload y el import de `moment`

En `src/views/pages/produccion/ordenes/create.tsx`, en `onSubmit`:

```tsx
const req = {
  quantityExpected,
  products: values.presentations.map((product: any) => ({
    id: product.id,
    quantity: product.quantityG,
    base: product.id === values.product.id
  }))
};
```

Eliminar el import `import moment from "moment";` (queda sin uso).

- [ ] **Step 7: Actualizar `form.tsx`** — quitar el bloque del DatePicker

En `src/views/pages/produccion/ordenes/form.tsx`:
- Eliminar `import moment from "moment";` y `import CustomDatePicker from "@/@core/components/react-datepicker";`.
- En el bloque `step === 2`, quitar el `<CustomDatePicker ... />` y su `Divider`; dejar solo el botón "Generar orden".

```tsx
{step === 2 && (
  <>
    <CustomButton
      text='Generar orden'
      type='submit'
      disabled={isChanged}
      isLoading={isPendingCreate}
    />
  </>
)}
```

- [ ] **Step 8: Actualizar `IOrderCreate`**

En `src/types/pages/order.ts`:

```ts
export interface IOrderCreate {
  quantityExpected: number;
  products: {
    id: string;
    quantity: number;
    base?: boolean;
  }[];
}
```

- [ ] **Step 9: Verificar typecheck, lint y tests**

Run: `npx tsc --noEmit && pnpm lint && pnpm vitest run src/utils/schemas/__tests__/order.test.ts`
Expected: sin errores y test PASS.



---

### Task 12: Detalle de orden de producción — expirationLabel y lotes

**Files:**
- Modify: `src/views/pages/produccion/ordenes/detail/index.tsx`
- Modify: `src/types/pages/order.ts`

**Interfaces:**
- Consumes: `IOrder.expirationLabel?: string`, `IOrder.lots?: ILot[]` (nuevos campos del DTO backend).
- Produces: `ILot` = `{ idFinalProduct: string; batchLot: string }`.

- [ ] **Step 1: Actualizar tipos**

En `src/types/pages/order.ts`, añadir:

```ts
export interface ILot {
  idFinalProduct: string;
  batchLot: string;
}
```

Y en `IOrder` añadir:

```ts
expirationLabel?: string;
lots?: ILot[];
```

Y en `IOrderItem` añadir:

```ts
batchLot?: string;
```

- [ ] **Step 2: Mostrar la etiqueta de vencimiento y la sección de lotes en el detalle**

En `src/views/pages/produccion/ordenes/detail/index.tsx`:

1. Junto al bloque "Fecha de vencimiento" (`order.dateExpiration`), añadir:

```tsx
{order.expirationLabel && (
  <Box display='flex' justifyContent='space-between'>
    <Typography variant='body2' color='textSecondary'>
      Etiqueta de vencimiento
    </Typography>
    <Typography variant='body2' fontWeight={600}>
      {order.expirationLabel}
    </Typography>
  </Box>
)}
```

2. Añadir una sección "Lotes de la orden" después del listado de presentaciones (usando `order.lots`; fallback a `order.items` con `batchLot`):

```tsx
{(order.lots?.length > 0 || order.items?.some(item => item.batchLot)) && (
  <>
    <Divider />
    <Typography variant='h6'>Lotes de la orden</Typography>
    {(order.lots?.length > 0
      ? order.lots
      : order.items.filter(item => item.batchLot).map(item => ({ idFinalProduct: item.idFinalProduct, batchLot: item.batchLot! }))
    ).map(lot => (
      <Box key={lot.idFinalProduct} display='flex' justifyContent='space-between' alignItems='center' gap={2}>
        <Typography variant='body2'>{lot.idFinalProduct}</Typography>
        <Chip label={lot.batchLot} variant='outlined' />
      </Box>
    ))}
  </>
)}
```

- [ ] **Step 3: Verificar typecheck y lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: sin errores.



---

## Verificación final

1. `npx tsc --noEmit` — sin errores de tipos.
2. `pnpm lint` — sin errores de ESLint.
3. `pnpm test:run` — tests unitarios completos.
4. `pnpm build` — build de producción OK (verifica que ningún DTO/import roto).
5. Prueba manual (con backend ya migrado):
   - Crear categoría producto con `idIndicator=20`, `expirationMonths=4` → crear producto con esa categoría + categoría de lote `ALIMENTOS` → el id llega auto-generado (`2001`) y sin campo `id` en el form.
   - Crear categoría empaque con `dependsOnProduct=true` → el form de empaque muestra `productCode`.
   - Crear materia prima sin categoría → OK.
   - Crear orden de producción sin tocar fecha de vencimiento → el detalle muestra `expirationLabel` y `lots`.