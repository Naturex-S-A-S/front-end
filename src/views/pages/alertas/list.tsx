"use client";

import { useEffect, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import CircularProgress from "@mui/material/CircularProgress";

import { Icon } from "@iconify/react";

import moment from "moment";

import CustomCard from "@/@core/components/mui/Card";
import CustomButton from "@/@core/components/mui/Button";
import { usePagination, PaginationBar } from "@/@core/components/pagination";
import type { IAlert } from "@/types/alert";
import { markAlertAsRead, markAllAlertsAsRead } from "@/api/alert/actions";
import { alertMessageErrors } from "@/utils/messages";

const PAGE_SIZE = 15;

interface Props {
  initialData: IAlert[];
  onlyActive: boolean;
}

function formatAlertDate(dateStr: string): string {
  const date = moment(dateStr);
  const daysDiff = moment().diff(date, "days");

  if (daysDiff < 7) {
    return date.fromNow();
  }

  return date.format("DD MMM YYYY");
}

export default function AlertsList({ initialData, onlyActive }: Props) {
  const router = useRouter();
  const [alerts, setAlerts] = useState<IAlert[]>(initialData);
  const [isPending, startTransition] = useTransition();
  const { paginatedData, setPage, pageCount, safePage } = usePagination(alerts, PAGE_SIZE);

  useEffect(() => {
    setAlerts(initialData);
    setPage(1);
  }, [initialData, setPage]);

  const unreadIds = alerts.filter(a => !a.readed).map(a => a.id);

  const handleAlertClick = (alert: IAlert) => {
    if (alert.readed) {
      if (alert?.url) router.push(alert.url);

      return;
    }

    setAlerts(prev => prev.map(a => (a.id === alert.id ? { ...a, readed: true } : a)));

    startTransition(async () => {
      const result = await markAlertAsRead(alert.id);

      if (!result.success) {
        setAlerts(prev => prev.map(a => (a.id === alert.id ? { ...a, readed: false } : a)));
        alertMessageErrors(result.error, "Error al marcar la alerta como leída");
      }

      if (alert?.url) router.push(alert.url);
    });
  };

  const handleMarkAllRead = () => {
    if (!unreadIds.length) return;

    const ids = [...unreadIds];

    setAlerts(prev => prev.map(a => (a.readed ? a : { ...a, readed: true })));

    startTransition(async () => {
      const result = await markAllAlertsAsRead(ids);

      if (!result.success) {
        setAlerts(prev => prev.map(a => (ids.includes(a.id) ? { ...a, readed: false } : a)));
        alertMessageErrors(result.error, "Error al marcar las alertas como leídas");
      }
    });
  };

  const handleViewChange = (_: unknown, view: "all" | "unread" | null) => {
    if (!view) return;

    router.replace(view === "unread" ? "/alertas?onlyActive=true" : "/alertas");
  };

  return (
    <CustomCard>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 4
        }}
      >
        <Stack direction='row' spacing={2} alignItems='center'>
          <ToggleButtonGroup size='small' exclusive value={onlyActive ? "unread" : "all"} onChange={handleViewChange}>
            <ToggleButton value='all'>Todas</ToggleButton>
            <ToggleButton value='unread'>No leídas</ToggleButton>
          </ToggleButtonGroup>
          <Badge badgeContent={alerts.length} color='secondary'>
            <Icon icon='mdi:bell-outline' fontSize={20} />
          </Badge>
        </Stack>
        <CustomButton
          variant='contained'
          size='small'
          onClick={handleMarkAllRead}
          disabled={isPending || !unreadIds.length}
          startIcon={isPending ? <CircularProgress size={18} color='inherit' /> : undefined}
        >
          Marcar todo como leído
        </CustomButton>
      </Box>
      {alerts.length === 0 ? (
        <Alert severity='info' icon={<Icon icon='mdi:bell-off-outline' fontSize={18} />}>
          No hay alertas
        </Alert>
      ) : (
        <Box display='flex' flexDirection='column' gap={2}>
          {paginatedData.map(alert => {
            const isRead = alert.readed;
            const isAlertType = alert.type === "alert";

            return (
              <Card
                key={alert.id}
                variant='outlined'
                onClick={() => handleAlertClick(alert)}
                sx={{
                  cursor: "pointer",
                  transition: "border-color 150ms ease, background-color 150ms ease",
                  "&:hover": { borderColor: "primary.main", backgroundColor: "action.hover" },
                  ...(isRead && { opacity: 0.85 })
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    gap: 2
                  }}
                >
                  <Stack direction='row' spacing={3} alignItems='center' sx={{ minInlineSize: 0, flex: 1 }}>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: isRead ? "action.hover" : "success.light",
                        color: isRead ? "text.disabled" : "success.dark",
                        flexShrink: 0
                      }}
                    >
                      <Icon icon={isAlertType ? "mdi:bell" : "mdi:info-outline"} fontSize='1.1rem' />
                    </Avatar>
                    <Box sx={{ minInlineSize: 0, flex: 1 }}>
                      <Typography variant='subtitle1' fontWeight={600} noWrap>
                        {alert.comment}
                      </Typography>
                      <Stack direction='row' spacing={1} alignItems='center'>
                        <Icon icon='mdi:clock-outline' fontSize={14} style={{ opacity: 0.6 }} />
                        <Typography variant='body2' color='text.secondary' noWrap>
                          {formatAlertDate(alert.date)}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                  {!isRead && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "success.main",
                        flexShrink: 0
                      }}
                    />
                  )}
                </Box>
              </Card>
            );
          })}
        </Box>
      )}
      <PaginationBar page={safePage} count={pageCount} onChange={setPage} />
    </CustomCard>
  );
}