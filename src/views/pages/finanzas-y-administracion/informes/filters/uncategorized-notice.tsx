"use client";

import { Alert, Link, Stack, Typography } from "@mui/material";

import type { IReportFiltersCatalog } from "@/types/pages/reports";

interface Props {
  uncategorized: IReportFiltersCatalog["uncategorized"];
}

const notices = [
  {
    key: "products" as const,
    label: "productos terminados",
    href: "/inventario/producto-terminado"
  },
  {
    key: "feedstock" as const,
    label: "materias primas",
    href: "/inventario/materia-prima"
  },
  {
    key: "packaging" as const,
    label: "materiales de empaque",
    href: "/inventario/material-empaque"
  }
];

export default function UncategorizedNotice({ uncategorized }: Props) {
  const active = notices.filter(notice => uncategorized[notice.key] > 0);

  if (!active.length) return null;

  return (
    <Alert severity='warning'>
      <Stack spacing={0.5}>
        {active.map(notice => (
          <Typography key={notice.key} variant='body2'>
            Hay {uncategorized[notice.key]} {notice.label} sin línea o forma. <Link href={notice.href}>Revisar</Link>
          </Typography>
        ))}
      </Stack>
    </Alert>
  );
}
