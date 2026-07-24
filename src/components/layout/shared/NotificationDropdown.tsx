"use client";

import type { SyntheticEvent, ReactNode } from "react";
import { useState, Fragment, useTransition } from "react";

import { useRouter } from "next/navigation";

import Box from "@mui/material/Box";
import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import type { Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import type { MenuProps } from "@mui/material/Menu";
import MuiMenu from "@mui/material/Menu";
import type { MenuItemProps } from "@mui/material/MenuItem";
import MuiMenuItem from "@mui/material/MenuItem";
import type { TypographyProps } from "@mui/material/Typography";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

import PerfectScrollbarComponent from "react-perfect-scrollbar";

import { Icon } from "@iconify/react";

import moment from "moment";

import { Divider } from "@mui/material";

import type { IAlert } from "@/types/alert";
import { markAlertAsRead } from "@/api/alert/actions";
import { alertMessageErrors } from "@/utils/messages";

interface Props {
  initialData: IAlert[];
}

const Menu = styled(MuiMenu)<MenuProps>(({ theme }) => ({
  "& .MuiMenu-paper": {
    width: 380,
    overflow: "hidden",
    marginTop: theme.spacing(4.25),
    [theme.breakpoints.down("sm")]: {
      width: "100%"
    }
  },
  "& .MuiMenu-list": {
    padding: 0,
    "& .MuiMenuItem-root": {
      margin: 0,
      borderRadius: 0,
      padding: theme.spacing(4, 6),
      "&:hover": {
        backgroundColor: theme.palette.action.hover
      }
    }
  }
}));

const MenuItem = styled(MuiMenuItem)<MenuItemProps>(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  "&:not(:last-of-type)": {
    borderBottom: `1px solid ${theme.palette.divider}`
  }
}));

const PerfectScrollbar = styled(PerfectScrollbarComponent)({
  maxHeight: 349
});

const MenuItemTitle = styled(Typography)<TypographyProps>({
  fontWeight: 500,
  flex: "1 1 100%",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis"
});

const MenuItemSubtitle = styled(Typography)<TypographyProps>({
  flex: "1 1 100%",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis"
});

const ScrollWrapper = ({ children, hidden }: { children: ReactNode; hidden: boolean }) => {
  if (hidden) {
    return <Box sx={{ maxHeight: 349, overflowY: "auto", overflowX: "hidden" }}>{children}</Box>;
  } else {
    return <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>{children}</PerfectScrollbar>;
  }
};

function formatAlertDate(dateStr: string): string {
  const date = moment(dateStr);
  const daysDiff = moment().diff(date, "days");

  if (daysDiff < 7) {
    return date.fromNow();
  }

  return date.format("DD MMM YYYY");
}

interface AlertItemProps {
  alert: IAlert;
  onClick: (alert: IAlert) => void;
}

const AlertItem = ({ alert, onClick }: AlertItemProps) => {
  const isRead = alert.readed;

  return (
    <MenuItem
      key={alert.id}
      disableRipple
      disableTouchRipple
      onClick={() => onClick(alert)}
      sx={isRead ? { opacity: 0.6 } : undefined}
      className='border-b-0'
    >
      <Box sx={{ width: "100%", display: "flex", alignItems: "center", gap: 2.5 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme => (isRead ? theme.palette.action.hover : theme.palette.primary.main),
            color: isRead ? "text.secondary" : "common.white",
            flexShrink: 0
          }}
        >
          <Icon icon={alert.type === "alert" ? "tabler:bell" : "tabler:info-circle"} fontSize='1.25rem' />
        </Box>
        <Box sx={{ flex: "1 1", display: "flex", overflow: "hidden", flexDirection: "column" }}>
          <MenuItemTitle>{alert.comment}</MenuItemTitle>
          <MenuItemSubtitle variant='body2'>{formatAlertDate(alert.date)}</MenuItemSubtitle>
        </Box>
        {!isRead && (
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "primary.main",
              flexShrink: 0
            }}
          />
        )}
      </Box>
    </MenuItem>
  );
};

const NotificationDropdown = ({ initialData }: Props) => {
  const [anchorEl, setAnchorEl] = useState<(EventTarget & Element) | null>(null);
  const [alerts, setAlerts] = useState<IAlert[]>(initialData);
  const [isPending, startTransition] = useTransition();

  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down("lg"));

  const router = useRouter();

  const unreadCount = alerts.filter(a => !a.readed).length;

  const handleDropdownOpen = (event: SyntheticEvent) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const handleAlertClick = (alert: IAlert) => {
    if (alert.readed) {
      router.push(alert.url);
      handleDropdownClose();

      return;
    }

    setAlerts(prev => prev.map(a => (a.id === alert.id ? { ...a, readed: true } : a)));

    startTransition(async () => {
      const result = await markAlertAsRead(alert.id);

      if (!result.success) {
        setAlerts(prev => prev.map(a => (a.id === alert.id ? { ...a, readed: false } : a)));
        alertMessageErrors(result.error, "Error al marcar la alerta como leída");
      }

      router.push(alert.url);
      handleDropdownClose();
    });
  };

  const handleMarkAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, readed: true })));
  };

  return (
    <Fragment>
      <IconButton color='inherit' aria-haspopup='true' onClick={handleDropdownOpen} aria-controls='customized-menu'>
        <Badge
          color='error'
          variant='dot'
          invisible={!unreadCount}
          sx={{
            "& .MuiBadge-badge": { top: 4, right: 4, boxShadow: theme => `0 0 0 2px ${theme.palette.background.paper}` }
          }}
        >
          <Icon fontSize='1.625rem' icon='tabler:bell' />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleDropdownClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <MenuItem
          disableRipple
          disableTouchRipple
          sx={{ cursor: "default", userSelect: "auto", backgroundColor: "transparent !important" }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <Typography variant='h5' sx={{ cursor: "text" }}>
              Notificaciones
            </Typography>
            {unreadCount > 0 && (
              <Typography variant='body2' sx={{ color: "primary.main", fontWeight: 500 }}>
                {unreadCount} nueva{unreadCount !== 1 ? "s" : ""}
              </Typography>
            )}
          </Box>
        </MenuItem>
        {alerts.length === 0 ? (
          <MenuItem
            disableRipple
            disableTouchRipple
            sx={{ cursor: "default", userSelect: "auto", backgroundColor: "transparent !important" }}
          >
            <Alert severity='info' sx={{ width: "100%" }}>
              No hay notificaciones
            </Alert>
          </MenuItem>
        ) : (
          <ScrollWrapper hidden={hidden}>
            {alerts
              .filter(a => !a.readed)
              .map(alert => (
                <AlertItem key={alert.id} alert={alert} onClick={handleAlertClick} />
              ))}

            <Divider sx={{ mt: 0 }} />

            {alerts.length > 0 && (
              <MenuItem
                disableRipple
                disableTouchRipple
                sx={{ cursor: "default", userSelect: "auto", backgroundColor: "transparent !important" }}
              >
                Más notificaciones
              </MenuItem>
            )}

            {alerts
              .filter(a => a.readed)
              .map(alert => (
                <AlertItem key={alert.id} alert={alert} onClick={handleAlertClick} />
              ))}
          </ScrollWrapper>
        )}
        {alerts.length > 0 && (
          <MenuItem
            disableRipple
            disableTouchRipple
            sx={{
              borderBottom: 0,
              cursor: "default",
              userSelect: "auto",
              backgroundColor: "transparent !important",
              borderTop: theme => `1px solid ${theme.palette.divider}`,
              display: "none"
            }}
          >
            <Button
              fullWidth
              variant='contained'
              onClick={handleMarkAllRead}
              startIcon={isPending ? <CircularProgress size={18} color='inherit' /> : undefined}
              disabled={isPending || !unreadCount}
            >
              Marcar todo como leído
            </Button>
          </MenuItem>
        )}
      </Menu>
    </Fragment>
  );
};

export default NotificationDropdown;
