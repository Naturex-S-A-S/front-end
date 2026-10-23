"use client";

import { Alert, Link, Stack } from "@mui/material";

import type { IReportWarning } from "@/types/pages/reports";

interface Props {
  warnings?: IReportWarning[];
}

const infoCodes = new Set(["SALE_DATE_IS_UPLOAD_DATE", "ESTIMATED_LOT_BALANCE"]);

export default function ReportWarnings({ warnings }: Props) {
  if (!warnings?.length) return null;

  return (
    <Stack spacing={1}>
      {warnings.map((warning, index) => (
        <Alert
          key={`${warning.code}-${index}`}
          severity={infoCodes.has(warning.code) ? "info" : "warning"}
          action={
            warning.code === "CIF_INCOMPLETE" ? (
              <Link href='/finanzas-y-administracion/cif' underline='hover'>
                Ver CIF
              </Link>
            ) : undefined
          }
        >
          {warning.message}
        </Alert>
      ))}
    </Stack>
  );
}
