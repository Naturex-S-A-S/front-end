"use client";

import { Stack } from "@mui/material";

import CustomCard from "@/@core/components/mui/Card";
import type { IReportWarning } from "@/types/pages/reports";

import ReportWarnings from "./report-warnings";

interface Props {
  title: string;
  actions?: React.ReactNode;
  warnings?: IReportWarning[];
  children: React.ReactNode;
}

export default function ReportCard({ title, actions, warnings, children }: Props) {
  return (
    <CustomCard title={title} action={actions}>
      <Stack spacing={2}>
        <ReportWarnings warnings={warnings} />
        {children}
      </Stack>
    </CustomCard>
  );
}
