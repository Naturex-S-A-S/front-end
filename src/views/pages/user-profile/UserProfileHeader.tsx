// MUI Imports
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { Icon } from "@iconify/react";

// Type Imports
import type { ProfileData } from "@/types/pages/profile";
import { getDniTypeLabel } from "@/utils/enum";

const getInitials = (name?: string, lastName?: string) => {
  const first = name?.trim().charAt(0) ?? "";
  const last = lastName?.trim().charAt(0) ?? "";

  return `${first}${last}`.toUpperCase() || "US";
};

const UserProfileHeader = ({ data }: { data?: ProfileData }) => {
  const modules = data?.modules ?? [];
  const moduleNames = modules.map(m => m.moduleName).filter(Boolean);
  const uniqueModules = [...new Set(moduleNames)];

  return (
    <Card className='rounded-3xl'>
      <CardContent>
        <Stack direction={{ xs: "column", md: "row" }} spacing={4} alignItems={{ xs: "center", md: "center" }}>
          <Badge
            overlap='circular'
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={
              <Avatar
                sx={{
                  width: 16,
                  height: 16,
                  bgcolor: "success.main",
                  border: "2px solid",
                  borderColor: "background.paper"
                }}
              >
                <span />
              </Avatar>
            }
          >
            <Avatar sx={{ width: 96, height: 96, fontSize: 32, fontWeight: 700, bgcolor: "primary.main" }}>
              {getInitials(data?.name, data?.lastName)}
            </Avatar>
          </Badge>
          <Stack spacing={1.5} alignItems={{ xs: "center", md: "flex-start" }} sx={{ minInlineSize: 0, flex: 1 }}>
            <Typography variant='h5' fontWeight={600} noWrap>
              {data?.name} {data?.lastName}
            </Typography>
            <Stack direction='row' spacing={2} alignItems='center' sx={{ flexWrap: "wrap" }}>
              {data?.role?.name && <Chip label={data.role.name} size='small' color='primary' variant='outlined' />}
              {uniqueModules.length > 0 && (
                <Tooltip title={uniqueModules.join(", ")}>
                  <Chip
                    label={`${uniqueModules.length} ${uniqueModules.length === 1 ? "módulo" : "módulos"}`}
                    size='small'
                    color='info'
                    variant='outlined'
                  />
                </Tooltip>
              )}
            </Stack>
            <Stack
              direction='row'
              spacing={3}
              alignItems='center'
              sx={{ flexWrap: "wrap", justifyContent: { xs: "center", md: "flex-start" } }}
            >
              {data?.dni && (
                <Stack direction='row' spacing={1} alignItems='center'>
                  <Icon icon='tabler:id' fontSize={15} style={{ opacity: 0.6 }} />
                  <Typography variant='body2' color='text.secondary'>
                    {data?.dniType && getDniTypeLabel(data.dniType)}: {data.dni}
                  </Typography>
                </Stack>
              )}
              {data?.email && (
                <Tooltip title={data.email}>
                  <Stack direction='row' spacing={1} alignItems='center'>
                    <Icon icon='tabler:mail' fontSize={15} style={{ opacity: 0.6 }} />
                    <Typography variant='body2' color='text.secondary' noWrap sx={{ maxInlineSize: 240 }}>
                      {data.email}
                    </Typography>
                  </Stack>
                </Tooltip>
              )}
              {data?.phone && (
                <Stack direction='row' spacing={1} alignItems='center'>
                  <Icon icon='tabler:phone' fontSize={15} style={{ opacity: 0.6 }} />
                  <Typography variant='body2' color='text.secondary'>
                    {data.phone}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default UserProfileHeader;
