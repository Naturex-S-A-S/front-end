import type { IAlert } from "@/types/alert";

export const STOMP_DESTINATIONS = {
  ALERTS: "/user/queue/alerts"
} as const;

export type StompConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export function getToastSeverity(alert: IAlert): "success" | "info" | "warning" | "error" {
  switch (alert.type) {
    case "success":
      return "success";
    case "alert":
      return "warning";
    case "error":
      return "error";
    default:
      return "info";
  }
}