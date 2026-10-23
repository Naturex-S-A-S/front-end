"use client";

import { Box, Stack, Typography } from "@mui/material";
import { Icon } from "@iconify/react";

import CustomCard from "@/@core/components/mui/Card";

export interface MetricItem {
  label: string;
  value: string;
  helper?: string;
  icon?: string;
}

interface Props {
  items: MetricItem[];
}

export default function MetricCards({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          md: "repeat(auto-fit, minmax(180px, 1fr))"
        }
      }}
    >
      {items.map(item => (
        <CustomCard
          key={item.label}
          variant='outlined'
          sx={{
            minWidth: 0,
            height: "100%",
            "& .MuiCardContent-root": { padding: 2.5 },
            "& .MuiCardContent-root:last-child": { paddingBottom: 2.5 }
          }}
        >
          <Stack spacing={0.5} sx={{ minWidth: 0 }}>
            <Stack direction='row' spacing={1} alignItems='center' sx={{ minWidth: 0, minHeight: 40 }}>
              {item.icon && (
                <Icon icon={item.icon} fontSize={18} color='var(--mui-palette-text-secondary)' aria-hidden='true' />
              )}
              <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.35, minWidth: 0 }}>
                {item.label}
              </Typography>
            </Stack>
            <Typography
              variant='h5'
              component='p'
              noWrap
              title={item.value}
              sx={{
                fontWeight: 600,
                letterSpacing: "-0.01em",
                fontVariantNumeric: "tabular-nums"
              }}
            >
              {item.value}
            </Typography>
            {item.helper && (
              <Typography variant='caption' color='text.secondary' noWrap title={item.helper}>
                {item.helper}
              </Typography>
            )}
          </Stack>
        </CustomCard>
      ))}
    </Box>
  );
}
