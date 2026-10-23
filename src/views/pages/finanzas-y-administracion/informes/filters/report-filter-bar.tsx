"use client";

import { useEffect, useRef, useState } from "react";

import { format, parseISO } from "date-fns";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";

import CustomCard from "@/@core/components/mui/Card";
import type {
  IReportFilters,
  IReportFiltersCatalog,
  ReportFilterKey,
  ReportGranularity,
  ReportUnit,
  SalesMetric,
  SalesOrigin,
  VolumeGroupBy,
  VolumeSubject
} from "@/types/pages/reports";
import { useReportUrl } from "@/hooks/reports/useReportUrl";
import { createDefaultFilters, validateFilters } from "@/utils/reports/params";
import type { ReportEntry } from "@/utils/reports/registry";

import ActiveFilterChips from "./active-filter-chips";
import DateRangeFilter from "./date-range-filter";
import MultiSelectFilter from "./multi-select-filter";
import type { FilterFormValues } from "./types";
import UncategorizedNotice from "./uncategorized-notice";

interface Props {
  report: ReportEntry;
  filters: IReportFilters;
  catalog: IReportFiltersCatalog;
  catalogError: string | null;
}

const parseDate = (value: string): Date | null => {
  const date = parseISO(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const toFormValues = (filters: IReportFilters): FilterFormValues => ({
  from: parseDate(filters.from),
  to: parseDate(filters.to),
  subject: filters.subject ?? "product",
  granularity: filters.granularity ?? "month",
  groupBy: filters.groupBy ?? "line",
  unit: filters.unit ?? "kg",
  productIds: filters.productIds ?? [],
  batch: filters.batch ?? "",
  lineIds: filters.lineIds ?? [],
  categoryIds: filters.categoryIds ?? [],
  providerIds: filters.providerIds ?? [],
  formulationId: filters.formulationId ?? "",
  versionId: filters.versionId ?? "",
  minLossPct: filters.minLossPct ?? "",
  cifTypeIds: filters.cifTypeIds ?? [],
  origin: filters.origin ?? "",
  metric: filters.metric ?? "cop",
  top: filters.top ?? 10
});

const toFilters = (values: FilterFormValues, report: ReportEntry): IReportFilters => {
  const base = createDefaultFilters(report);

  const next: IReportFilters = {
    from: values.from ? format(values.from, "yyyy-MM-dd") : base.from,
    to: values.to ? format(values.to, "yyyy-MM-dd") : base.to,
    subject: undefined,
    granularity: undefined,
    groupBy: undefined,
    unit: undefined,
    productIds: undefined,
    batch: undefined,
    lineIds: undefined,
    categoryIds: undefined,
    providerIds: undefined,
    formulationId: undefined,
    versionId: undefined,
    minLossPct: undefined,
    cifTypeIds: undefined,
    origin: undefined,
    metric: undefined,
    top: undefined,
    ivaPct: report.key === "top-products" ? 0 : undefined
  };

  const allowed = new Set(report.filters);

  if (allowed.has("subject")) next.subject = values.subject;
  if (allowed.has("granularity")) next.granularity = values.granularity;
  if (allowed.has("groupBy")) next.groupBy = values.groupBy;
  if (allowed.has("unit")) next.unit = values.unit;

  if (allowed.has("productIds") && values.productIds.length) next.productIds = values.productIds.map(String);

  if (allowed.has("batch")) {
    const batch = values.batch.trim();

    if (batch) next.batch = batch;
  }

  if (allowed.has("lineIds") && values.lineIds.length) next.lineIds = values.lineIds.map(String);
  if (allowed.has("categoryIds") && values.categoryIds.length) next.categoryIds = values.categoryIds.map(String);

  if (allowed.has("providerIds") && values.providerIds.length) {
    next.providerIds = values.providerIds.map(Number).filter(Number.isFinite);
  }

  if (allowed.has("formulationId") && values.formulationId) next.formulationId = values.formulationId;
  if (allowed.has("versionId") && values.versionId) next.versionId = values.versionId;

  if (allowed.has("minLossPct") && values.minLossPct !== "") {
    const minLossPct = Number(values.minLossPct);

    if (Number.isFinite(minLossPct)) next.minLossPct = minLossPct;
  }

  if (allowed.has("cifTypeIds") && values.cifTypeIds.length) {
    next.cifTypeIds = values.cifTypeIds.map(Number).filter(Number.isFinite);
  }

  if (allowed.has("origin") && values.origin) next.origin = values.origin;
  if (allowed.has("metric")) next.metric = values.metric;
  if (allowed.has("top")) next.top = Number(values.top);

  return next;
};

const labelForGranularity = (value: ReportGranularity): string => {
  switch (value) {
    case "day":
      return "Día";
    case "week":
      return "Semana";
    case "year":
      return "Año";
    default:
      return "Mes";
  }
};

const labelForGroupBy = (value: VolumeGroupBy): string => {
  switch (value) {
    case "category":
      return "Categoría";
    default:
      return "Línea";
  }
};

const labelForUnit = (value: ReportUnit, report: ReportEntry): string => {
  if (report.key === "production-cost-per-kg") return value === "ton" ? "COP/ton" : "COP/kg";

  return value === "ton" ? "Ton" : value === "units" ? "Unidades" : "Kg";
};

const labelForMetric = (value: SalesMetric): string => {
  if (value === "kg") return "Kg";
  if (value === "units") return "Unidades";

  return "COP";
};

const labelForOrigin = (value: SalesOrigin): string => (value === "remision" ? "Remisión" : "Siigo");

export default function ReportFilterBar({ report, filters, catalog, catalogError }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { update, isPending } = useReportUrl(report, filters);
  const [formError, setFormError] = useState<string | null>(null);
  const lastBatch = useRef(filters.batch ?? "");
  const updateRef = useRef(update);
  const form = useForm<FilterFormValues>({ defaultValues: toFormValues(filters) });
  const { control, handleSubmit, reset, setValue, getValues } = form;
  const subject = useWatch({ control, name: "subject" });
  const batch = useWatch({ control, name: "batch" });

  updateRef.current = update;

  useEffect(() => {
    reset(toFormValues(filters));
    lastBatch.current = filters.batch ?? "";
  }, [filters, reset]);

  useEffect(() => {
    const current = batch ?? "";

    if (current === lastBatch.current) return;

    const timer = setTimeout(() => {
      lastBatch.current = current;
      updateRef.current({ batch: current.trim() || undefined });
    }, 500);

    return () => clearTimeout(timer);
  }, [batch]);

  const hasFilter = (key: ReportFilterKey): boolean => report.filters.includes(key);

  const granularityOptions: ReportGranularity[] =
    report.key === "production-comparison"
      ? ["week", "month"]
      : report.key === "production-cost-per-kg"
        ? ["month", "year"]
        : ["day", "week", "month", "year"];

  const unitOptions: ReportUnit[] = report.key === "production-comparison" ? ["kg", "ton", "units"] : ["kg", "ton"];

  const onSubmit = (values: FilterFormValues) => {
    const next = toFilters(values, report);
    const validation = validateFilters(next);

    if (!validation.valid) {
      setFormError(Object.values(validation.errors).find(Boolean) ?? null);

      return;
    }

    setFormError(null);
    update(next);
  };

  const handleClear = () => {
    const defaults = createDefaultFilters(report);

    const clear: Partial<IReportFilters> = {
      ...defaults,
      subject: defaults.subject,
      granularity: defaults.granularity,
      groupBy: defaults.groupBy,
      unit: defaults.unit,
      productIds: undefined,
      batch: undefined,
      lineIds: undefined,
      categoryIds: undefined,
      providerIds: undefined,
      formulationId: undefined,
      versionId: undefined,
      minLossPct: undefined,
      cifTypeIds: undefined,
      origin: undefined,
      metric: defaults.metric,
      top: defaults.top,
      ivaPct: report.key === "top-products" ? 0 : undefined
    };

    reset(toFormValues(defaults));
    setFormError(null);
    update(clear);
  };

  const handleSubjectChange = (value: VolumeSubject) => {
    const values: FilterFormValues = {
      ...getValues(),
      subject: value,
      categoryIds: [],
      providerIds: []
    };

    setValue("subject", value);
    setValue("categoryIds", []);
    setValue("providerIds", []);
    update(toFilters(values, report));
  };

  const content = (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        {formError && <Alert severity='error'>{formError}</Alert>}
        {catalogError && (
          <Alert severity='warning'>
            No se pudieron cargar los filtros del catálogo. Puede consultar por fecha, lote y filtros numéricos.
          </Alert>
        )}
        <Grid container spacing={2} alignItems={"center"}>
          <Grid item xs={12} md={6}>
            <DateRangeFilter dateLabel={report.dateLabel} />
          </Grid>

          {hasFilter("subject") && (
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name='subject'
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    fullWidth
                    size='small'
                    label='Tipo'
                    value={field.value}
                    onChange={event => handleSubjectChange(event.target.value as VolumeSubject)}
                  >
                    <MenuItem value='product'>Producto</MenuItem>
                    <MenuItem value='feedstock'>Materia prima</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
          )}

          {hasFilter("granularity") && (
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name='granularity'
                control={control}
                render={({ field }) => (
                  <TextField select fullWidth size='small' label='Granularidad' {...field}>
                    {granularityOptions.map(option => (
                      <MenuItem key={option} value={option}>
                        {labelForGranularity(option)}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
          )}

          {hasFilter("groupBy") && (
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name='groupBy'
                control={control}
                render={({ field }) => (
                  <TextField select fullWidth size='small' label='Agrupar por' {...field}>
                    <MenuItem value='line'>{labelForGroupBy("line")}</MenuItem>
                    <MenuItem value='category'>{labelForGroupBy("category")}</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
          )}

          {hasFilter("unit") && (
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name='unit'
                control={control}
                render={({ field }) => (
                  <TextField select fullWidth size='small' label='Unidad' {...field}>
                    {unitOptions.map(option => (
                      <MenuItem key={option} value={option}>
                        {labelForUnit(option, report)}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
          )}

          {!catalogError && hasFilter("productIds") && (
            <Grid item xs={12} md={6}>
              <MultiSelectFilter name='productIds' label='Productos' options={catalog.products} />
            </Grid>
          )}

          {!catalogError && hasFilter("lineIds") && (
            <Grid item xs={12} sm={6} md={3}>
              <MultiSelectFilter
                name='lineIds'
                label='Líneas'
                options={[...catalog.lines, { id: "none", name: "Sin línea" }]}
              />
            </Grid>
          )}

          {!catalogError && hasFilter("categoryIds") && (
            <Grid item xs={12} sm={6} md={3}>
              <MultiSelectFilter
                name='categoryIds'
                label='Formas'
                options={[...catalog.categories, { id: "none", name: "Sin forma" }]}
              />
            </Grid>
          )}

          {!catalogError && hasFilter("providerIds") && subject === "feedstock" && (
            <Grid item xs={12} sm={6} md={3}>
              <MultiSelectFilter name='providerIds' label='Proveedores' options={catalog.providers} numeric />
            </Grid>
          )}

          {!catalogError && hasFilter("cifTypeIds") && (
            <Grid item xs={12} sm={6} md={3}>
              <MultiSelectFilter name='cifTypeIds' label='Tipo de CIF' options={catalog.cifTypes} numeric />
            </Grid>
          )}

          {!catalogError && hasFilter("formulationId") && (catalog.formulations?.length ?? 0) > 0 && (
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name='formulationId'
                control={control}
                render={({ field }) => (
                  <TextField select fullWidth size='small' label='Formulación' {...field}>
                    <MenuItem value=''>Todas</MenuItem>
                    {(catalog.formulations ?? []).map(option => (
                      <MenuItem key={option.id} value={String(option.id)}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
          )}

          {!catalogError && hasFilter("versionId") && (catalog.versions?.length ?? 0) > 0 && (
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name='versionId'
                control={control}
                render={({ field }) => (
                  <TextField select fullWidth size='small' label='Versión' {...field}>
                    <MenuItem value=''>Todas</MenuItem>
                    {(catalog.versions ?? []).map(option => (
                      <MenuItem key={option.id} value={String(option.id)}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
          )}

          {hasFilter("batch") && (
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name='batch'
                control={control}
                render={({ field }) => <TextField {...field} fullWidth size='small' label='Lote' placeholder='Lote' />}
              />
            </Grid>
          )}

          {hasFilter("minLossPct") && (
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name='minLossPct'
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    size='small'
                    type='number'
                    label='Merma mínima (%)'
                    value={field.value}
                    onChange={event => field.onChange(event.target.value === "" ? "" : Number(event.target.value))}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                  />
                )}
              />
            </Grid>
          )}

          {hasFilter("origin") && (
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name='origin'
                control={control}
                render={({ field }) => (
                  <TextField select fullWidth size='small' label='Origen' {...field}>
                    <MenuItem value=''>Todos</MenuItem>
                    <MenuItem value='siigo'>{labelForOrigin("siigo")}</MenuItem>
                    <MenuItem value='remision'>{labelForOrigin("remision")}</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
          )}

          {hasFilter("metric") && (
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name='metric'
                control={control}
                render={({ field }) => (
                  <TextField select fullWidth size='small' label='Métrica' {...field}>
                    <MenuItem value='cop'>{labelForMetric("cop")}</MenuItem>
                    <MenuItem value='kg'>{labelForMetric("kg")}</MenuItem>
                    <MenuItem value='units'>{labelForMetric("units")}</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
          )}

          {hasFilter("top") && (
            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name='top'
                control={control}
                render={({ field }) => (
                  <TextField select fullWidth size='small' label='Top' {...field}>
                    {[5, 10, 20, 50].map(value => (
                      <MenuItem key={value} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
          )}
        </Grid>

        <Stack direction='row' spacing={1} justifyContent='flex-end'>
          <Button type='button' onClick={handleClear} disabled={isPending}>
            Limpiar filtros
          </Button>
          <Button type='submit' variant='contained' disabled={isPending}>
            Aplicar filtros
          </Button>
        </Stack>
      </Stack>
    </form>
  );

  return (
    <FormProvider {...form}>
      <Stack spacing={2}>
        {isMobile ? (
          <Accordion>
            <AccordionSummary>
              <Typography variant='subtitle1'>Filtros</Typography>
            </AccordionSummary>
            <AccordionDetails>{content}</AccordionDetails>
          </Accordion>
        ) : (
          <CustomCard title='Filtros'>{content}</CustomCard>
        )}
        {!catalogError && <UncategorizedNotice uncategorized={catalog.uncategorized} />}
        <ActiveFilterChips filters={filters} catalog={catalog} onDelete={update} />
      </Stack>
    </FormProvider>
  );
}
