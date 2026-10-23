import { isAxiosError } from "axios";

import { API } from "@/api/instances";
import type { IReportFilters } from "@/types/pages/reports";
import { toApiParams } from "@/utils/reports/params";

export type ExportFormat = "xlsx" | "csv";

const DEFAULT_EXPORT_ERROR = "No se pudo exportar el reporte.";

const stripQuotes = (value: string): string => value.trim().replace(/^["']|["']$/g, "");

const getFilename = (contentDisposition: string | undefined, fallback: string): string => {
  if (!contentDisposition) return fallback;

  const utf8Match = contentDisposition.match(/filename\*\s*=\s*(?:UTF-8'')?([^;]+)/i);

  if (utf8Match?.[1]) {
    try {
      return stripQuotes(decodeURIComponent(utf8Match[1])).replace(/[/\\]/g, "_");
    } catch {
      return stripQuotes(utf8Match[1]).replace(/[/\\]/g, "_");
    }
  }

  const regularMatch = contentDisposition.match(/filename\s*=\s*"?([^";]+)"?/i);

  if (regularMatch?.[1]) return stripQuotes(regularMatch[1]).replace(/[/\\]/g, "_");

  return fallback;
};

const getBlobErrorMessage = async (data: Blob): Promise<string | null> => {
  try {
    const text = await data.text();
    const json = JSON.parse(text);

    return typeof json?.message === "string" ? json.message : null;
  } catch {
    return null;
  }
};

const getExportErrorMessage = async (error: unknown): Promise<string | null> => {
  if (!isAxiosError(error)) return null;

  const data = error.response?.data;

  if (data instanceof Blob) return getBlobErrorMessage(data);

  if (typeof data === "object" && data !== null && "message" in data) {
    const message = (data as { message?: unknown }).message;

    if (typeof message === "string" && message.length > 0) return message;
  }

  if (typeof data === "string") {
    try {
      const json = JSON.parse(data);

      return typeof json?.message === "string" ? json.message : null;
    } catch {
      return null;
    }
  }

  return null;
};

const triggerDownload = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 0);
};

export async function exportReport(reportKey: string, filters: IReportFilters, format: ExportFormat): Promise<void> {
  const fallback = `reporte-${reportKey}-${filters.from}_${filters.to}.${format}`;

  try {
    const response = await API().get<Blob>(`/reports/${reportKey}/export`, {
      params: { ...toApiParams(filters), format },
      responseType: "blob"
    });

    const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
    const filename = getFilename(response.headers["content-disposition"] as string | undefined, fallback);

    triggerDownload(blob, filename);
  } catch (error) {
    const message = await getExportErrorMessage(error);

    throw new Error(message ?? DEFAULT_EXPORT_ERROR);
  }
}
