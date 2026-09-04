import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/nextAuthOptions";

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
      let internalMessage = `apiFetch ${res.status} ${res.statusText}`;

      if (text) {
        try {
          const json = JSON.parse(text);

          internalMessage = json.message || text;
        } catch {
          internalMessage += `: ${text}`;
        }
      }

      if (process.env.NODE_ENV === "development") {
        throw new Error(internalMessage);
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
