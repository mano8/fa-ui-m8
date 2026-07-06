export type RepartoMetric = {
  label: string;
  value: string | number;
};

export function buildExportCenterState(_summary: unknown, _exports: unknown[]): {
  metrics: RepartoMetric[];
} {
  return { metrics: [] };
}
