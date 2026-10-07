import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/nextAuthOptions";

// El backend a veces devuelve `message` como objeto (errores de validación
// estructurados). Sin esta normalización, `new Error(obj)` lo convierte en
// "[object Object]" y el mensaje real se pierde.
const toErrorMessage = (message: unknown, fallback: string): string => {
  if (typeof message === "string" && message.length > 0) return message;

  if (message !== null && message !== undefined) {
    try {
      const serialized = JSON.stringify(message);

      if (serialized && serialized !== "{}") return serialized;
    } catch {
      // usa el fallback
    }
  }

  return fallback;
};

export async function apiFetch<T>(
  path: string,
  options?: { tags?: string[]; method?: string; body?: BodyInit }
): Promise<T> {
  const session = await getServerSession(authOptions);

  if (!session?.access_token || session?.error) {
    throw new Error("Sesión expirada o inválida");
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const url = `${baseUrl}${path.startsWith("/") ? path.replace(/^\/+/, "") : path}`;

  const headers: HeadersInit = {};

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  if (options?.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const res = await fetch(url, {
      method: options?.method ?? "GET",
      headers,
      body: options?.body,
      signal: controller.signal,
      next: { tags: options?.tags }
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      let apiErrorMessage: string | null = null;

      if (text) {
        try {
          const json = JSON.parse(text);

          apiErrorMessage = toErrorMessage(json.message, "");
        } catch {
          apiErrorMessage = null;
        }
      }

      if (apiErrorMessage) {
        throw new Error(apiErrorMessage);
      }

      if (process.env.NODE_ENV === "development") {
        throw new Error(text || `apiFetch ${res.status} ${res.statusText}`);
      }

      const userMessages: Record<number, string> = {
        400: "Solicitud inválida",
        401: "Sesión expirada",
        403: "No tiene permisos para realizar esta acción",
        404: "Recurso no encontrado",
        409: "Conflicto con un registro existente",
        422: "Datos inválidos",
        500: "Error interno del servidor"
      };

      throw new Error(userMessages[res.status] || "Error al comunicarse con el servidor");
    }

    if (res.headers.get("content-length") === "0" || res.status === 204) {
      return undefined as T;
    }

    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timeout);
  }
}
