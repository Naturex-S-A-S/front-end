"use client";

import { useState, useRef, useEffect, useCallback } from "react";

import { Card, CardContent, Typography, TextField, Button, Chip, Stack, Box } from "@mui/material";
import { Icon } from "@iconify/react";
import type { IMessage } from "@stomp/stompjs";

import { useStomp } from "@/components/provider/useStomp";
import { STOMP_DESTINATIONS } from "@/lib/stomp";

type Direction = "received" | "sent" | "system";

interface LogEntry {
  id: number;
  timestamp: string;
  direction: Direction;
  body: string;
}

const statusConfig: Record<
  string,
  { label: string; color: "success" | "warning" | "error" | "default"; icon: string }
> = {
  connected: { label: "Conectado", color: "success", icon: "mdi:check-circle" },
  connecting: { label: "Conectando...", color: "warning", icon: "mdi:loading" },
  error: { label: "Error", color: "error", icon: "mdi:close-circle" },
  disconnected: { label: "Desconectado", color: "default", icon: "mdi:circle-off-outline" }
};

export default function WebSocketTestPage() {
  const { status, client } = useStomp();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [destination, setDestination] = useState<string>(STOMP_DESTINATIONS.ALERTS);
  const [sendBody, setSendBody] = useState("");

  const logIdRef = useRef(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((direction: Direction, body: string) => {
    logIdRef.current += 1;

    setLogs(prev => [...prev, { id: logIdRef.current, timestamp: new Date().toLocaleTimeString(), direction, body }]);
  }, []);

  useEffect(() => {
    addLog("system", `Estado: ${status}`);
  }, [status, addLog]);

  useEffect(() => {
    if (!client?.connected) return;

    const subscription = client.subscribe(STOMP_DESTINATIONS.ALERTS, (message: IMessage) => {
      addLog("received", message.body);
    });

    addLog("system", `Suscrito a ${STOMP_DESTINATIONS.ALERTS}`);

    return () => {
      subscription.unsubscribe();
    };
  }, [client, client?.connected, addLog]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleSend = () => {
    if (!client?.connected || !sendBody.trim() || !destination.trim()) return;

    client.publish({
      destination: destination.trim(),
      body: sendBody
    });

    addLog("sent", `→ ${destination.trim()}: ${sendBody}`);
    setSendBody("");
  };

  const statusInfo = statusConfig[status];

  return (
    <Box p={4} maxWidth={800} mx='auto'>
      <Typography variant='h4' mb={3}>
        WebSocket Monitor (STOMP)
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction='row' spacing={2} alignItems='center' margin={2} justifyContent={"space-between"}>
            <Typography variant='h6' mb={2}>
              Mensajes recibidos
            </Typography>
            <Chip label={statusInfo.label} color={statusInfo.color} variant='outlined' icon={<Icon icon={statusInfo.icon} />} />
          </Stack>

          <Box
            sx={{
              maxHeight: 400,
              overflow: "auto",
              bgcolor: "grey.900",
              color: "common.white",
              p: 2,
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: 13
            }}
          >
            {logs.length === 0 && (
              <Typography variant='body2' color='grey.500' sx={{ fontFamily: "monospace" }}>
                Sin mensajes aun. Conecta para recibir alertas.
              </Typography>
            )}
            {logs.map(log => (
              <Box key={log.id} mb={0.5}>
                <Typography
                  component='span'
                  color={
                    log.direction === "received"
                      ? "success.light"
                      : log.direction === "sent"
                        ? "info.light"
                        : "warning.light"
                  }
                  sx={{ fontFamily: "monospace", fontSize: 13 }}
                >
                  [{log.timestamp}]
                </Typography>{" "}
                <Typography component='span' sx={{ fontFamily: "monospace", fontSize: 13 }} color='common.white'>
                  {log.body}
                </Typography>
              </Box>
            ))}
            <div ref={logsEndRef} />
          </Box>
        </CardContent>
      </Card>

      {true && (
        <Card>
          <CardContent>
            <Typography variant='h6' mb={2}>
              Enviar mensaje
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                size='small'
                label='Destino'
                value={destination}
                onChange={e => setDestination(e.target.value)}
              />
              <TextField
                fullWidth
                size='small'
                label='Body'
                multiline
                rows={3}
                value={sendBody}
                onChange={e => setSendBody(e.target.value)}
              />
              <Button
                variant='contained'
                onClick={handleSend}
                disabled={status !== "connected" || !sendBody.trim()}
                startIcon={<Icon icon='mdi:send' />}
              >
                Enviar
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
