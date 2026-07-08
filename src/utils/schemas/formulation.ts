import * as yup from "yup";

export const formulationSchema = yup
  .object({
    name: yup.string().required("El nombre es requerido"),
    comment: yup.string().required("El comentario es requerido"),
    products: yup.array().of(
      yup.object().shape({
        id: yup.string().required("El ID del producto es requerido")
      })
    ),
    details: yup
      .array()
      .required("Los detalles son requeridos")
      .test("validate-filled-rows", "Debe agregar al menos un material", async function (value) {
        const { path, createError } = this;
        const arr = Array.isArray(value) ? value : [];

        const filledRows = arr.filter(
          (item: any) => item?.material != null || item?.quantity != null
        );

        if (filledRows.length === 0) {
          return createError({ path, message: "Debe agregar al menos un material con su cantidad" });
        }

        const itemSchema = yup.object().shape({
          material: yup
            .object()
            .shape({
              id: yup.string().required("El material es requerido")
            })
            .required("El material es requerido"),
          quantity: yup
            .number()
            .typeError("La cantidad debe ser válida")
            .min(1, "La cantidad debe ser al menos 1")
            .required("La cantidad es requerida")
        });

        for (let i = 0; i < arr.length; i++) {
          const item = arr[i];
          const isBlank = item?.material == null && item?.quantity == null;

          if (isBlank) continue;

          try {
            await itemSchema.validate(item);
          } catch (err: any) {
            return createError({
              path: `${path}[${i}]`,
              message: err.message
            });
          }
        }

        return true;
      })
  })
  .required();

export const formulationVersionSchema = yup
  .object({
    comment: yup.string().required("El comentario es requerido"),
    details: yup
      .array()
      .required("Los detalles son requeridos")
      .test("validate-filled-rows", "Debe agregar al menos un material", async function (value) {
        const { path, createError } = this;
        const arr = Array.isArray(value) ? value : [];

        const filledRows = arr.filter(
          (item: any) => item?.material != null || item?.quantity != null
        );

        if (filledRows.length === 0) {
          return createError({ path, message: "Debe agregar al menos un material con su cantidad" });
        }

        const itemSchema = yup.object().shape({
          material: yup
            .object()
            .shape({
              id: yup.string().required("El material es requerido")
            })
            .required("El material es requerido"),
          quantity: yup
            .number()
            .typeError("La cantidad debe ser válida")
            .min(1, "La cantidad debe ser al menos 1")
            .required("La cantidad es requerida")
        });

        for (let i = 0; i < arr.length; i++) {
          const item = arr[i];
          const isBlank = item?.material == null && item?.quantity == null;

          if (isBlank) continue;

          try {
            await itemSchema.validate(item);
          } catch (err: any) {
            return createError({
              path: `${path}[${i}]`,
              message: err.message
            });
          }
        }

        return true;
      })
  })
  .required();
