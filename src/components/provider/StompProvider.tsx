"use client";

import { createContext, useEffect, useRef, useState, useCallback, type ReactNode } from "react";

import { useRouter } from "next/navigation";

import { useSession } from "next-auth/react";

import { Client, type IMessage } from "@stomp/stompjs";
import toast from "react-hot-toast";

import { revalidateAlerts } from "@/api/alert/actions";
import type { IAlert } from "@/types/alert";
import { STOMP_DESTINATIONS, getToastSeverity, type StompConnectionStatus } from "@/lib/stomp";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "wss://protozoal-unappeasingly-ronny.ngrok-free.dev/ws";
const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

interface StompContextValue {
  status: StompConnectionStatus;
  client: Client | null;
}

export const StompContext = createContext<StompContextValue>({ status: "disconnected", client: null });

export function StompProvider({ children }: { children: ReactNode }) {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = useState<StompConnectionStatus>("disconnected");
  const [clientInstance, setClientInstance] = useState<Client | null>(null);

  const clientRef = useRef<Client | null>(null);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const tokenRef = useRef<string | undefined>();
  const tokenExpiresRef = useRef<number | undefined>();

  const disconnectClient = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }

    setConnectionStatus("disconnected");
    setClientInstance(null);
  }, []);

  const connect = useCallback(() => {
    const token = tokenRef.current;
    const tokenExpires = tokenExpiresRef.current;

    if (!token) return;

    if (tokenExpires && Math.floor(Date.now() / 1000) > tokenExpires) return;

    setConnectionStatus("connecting");

    const client = new Client({
      brokerURL: `${WS_URL}?token=${token}`,
      reconnectDelay: 0,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000
    });

    client.onConnect = () => {
      if (!mountedRef.current) return;

      setConnectionStatus("connected");
      setClientInstance(client);
      reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;

      client.subscribe(STOMP_DESTINATIONS.ALERTS, (message: IMessage) => {
        try {
          const alert: IAlert = JSON.parse(message.body);
          const severity = getToastSeverity(alert);

          if (severity === "warning") {
            toast(alert.comment, { icon: "⚠️" });
          } else if (severity === "error") {
            toast(alert.comment, { icon: "❌" });
          } else if (severity === "success") {
            toast(alert.comment, { icon: "✅" });
          } else {
            toast(alert.comment, { icon: "🔔" });
          }

          revalidateAlerts();
          router.refresh();
        } catch {
          toast("Nueva alerta recibida", { icon: "🔔" });
          revalidateAlerts();
          router.refresh();
        }
      });
    };

    client.onWebSocketClose = () => {
      if (!mountedRef.current) return;

      setConnectionStatus("disconnected");
      setClientInstance(null);

      if (tokenRef.current) {
        const delay = reconnectDelayRef.current;

        reconnectTimerRef.current = setTimeout(() => {
          if (mountedRef.current && tokenRef.current) {
            connect();
            reconnectDelayRef.current = Math.min(delay * 2, MAX_RECONNECT_DELAY);
          }
        }, delay);
      }
    };

    client.onStompError = () => {
      if (!mountedRef.current) return;

      setConnectionStatus("error");
    };

    client.activate();
    clientRef.current = client;
  }, []);

  useEffect(() => {
    const prevToken = tokenRef.current;
    const newToken = session?.notificationToken;

    tokenRef.current = newToken;
    tokenExpiresRef.current = session?.tokenExpires;

    if (sessionStatus === "loading") return;

    if (newToken && newToken !== prevToken) {
      disconnectClient();
      mountedRef.current = true;
      connect();
    } else if (!newToken && prevToken) {
      disconnectClient();
    }
  }, [session, sessionStatus, connect, disconnectClient]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      disconnectClient();
    };
  }, [disconnectClient]);

  return (
    <StompContext.Provider value={{ status: connectionStatus, client: clientInstance }}>
      {children}
    </StompContext.Provider>
  );
}
