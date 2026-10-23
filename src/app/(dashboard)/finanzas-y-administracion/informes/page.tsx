import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import { Alert, Stack, Typography } from "@mui/material";

import { getReportFiltersServer, getReportServer } from "@/api/reports/server";
import { authOptions } from "@/lib/nextAuthOptions";
import type { Actions } from "@/types/next-auth";
import type { IReportResult, VolumeSubject } from "@/types/pages/reports";
import defineAbilityFor from "@/utils/ability";
import { ABILITY_ACTIONS, ABILITY_FIELDS, ABILITY_SUBJECT } from "@/utils/constant";
import { resolveReportSelection, type SearchParams } from "@/utils/reports/params";

import ReportFilterBar from "@/views/pages/finanzas-y-administracion/informes/filters/report-filter-bar";
import ReportRenderer from "@/views/pages/finanzas-y-administracion/informes/report-renderer";
import ReportSelector from "@/views/pages/finanzas-y-administracion/informes/report-selector";
import ReportError from "@/views/pages/finanzas-y-administracion/informes/shared/report-error";
import ReportTabs from "@/views/pages/finanzas-y-administracion/informes/tabs";

export const metadata = {
  title: "Informes - Naturex",
  description: "Informes de producción y ventas"
};

interface Props {
  searchParams: SearchParams;
}

export default async function InformesPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const ability = defineAbilityFor(session?.permissions ?? [], session?.role ?? "");

  if (
    !ability.can(ABILITY_ACTIONS.READ as Actions, ABILITY_SUBJECT.FINANCE_AND_ADMINISTRATION, ABILITY_FIELDS.INFORMES)
  ) {
    redirect("/home");
  }

  const selection = resolveReportSelection(searchParams);

  const reportPromise = selection.error
    ? Promise.resolve({ data: null, error: null })
    : getReportServer(selection.report.endpoint, selection.filters);

  const [catalogResponse, reportResponse] = await Promise.all([
    getReportFiltersServer((selection.filters.subject ?? "product") as VolumeSubject),
    reportPromise
  ]);

  const reportResult = reportResponse.data as IReportResult<unknown, unknown> | null;

  return (
    <Stack spacing={3}>
      <Typography variant='h4'>Informes</Typography>
      <Stack spacing={2}>
        <ReportTabs tab={selection.tab} filters={selection.filters} />
        <ReportSelector report={selection.report} filters={selection.filters} />
      </Stack>
      <ReportFilterBar
        report={selection.report}
        filters={selection.filters}
        catalog={catalogResponse.data}
        catalogError={catalogResponse.error}
      />
      {selection.error && <Alert severity='error'>{selection.error}</Alert>}
      {!selection.error && reportResponse.error && <ReportError message={reportResponse.error} />}
      {!selection.error && reportResult && (
        <ReportRenderer report={selection.report} result={reportResult} filters={selection.filters} />
      )}
    </Stack>
  );
}
