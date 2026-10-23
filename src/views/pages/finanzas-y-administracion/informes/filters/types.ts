import type {
  ReportGranularity,
  ReportUnit,
  SalesMetric,
  SalesOrigin,
  VolumeGroupBy,
  VolumeSubject
} from "@/types/pages/reports";

export interface FilterFormValues {
  from: Date | null;
  to: Date | null;
  subject: VolumeSubject;
  granularity: ReportGranularity;
  groupBy: VolumeGroupBy;
  unit: ReportUnit;
  productIds: Array<string | number>;
  batch: string;
  lineIds: Array<string | number>;
  categoryIds: Array<string | number>;
  providerIds: Array<string | number>;
  formulationId: string;
  versionId: string;
  minLossPct: number | "";
  cifTypeIds: Array<string | number>;
  origin: SalesOrigin | "";
  metric: SalesMetric;
  top: number;
}
