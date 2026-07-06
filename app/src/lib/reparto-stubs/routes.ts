export type RepartoRouteFragments = {
  dashboard?: string | false;
  meeting?: string | false;
  processList?: string | false;
  teacherView?: string | false;
  sharedScreen?: string | false;
  versions?: string | false;
  exports?: string | false;
};

export type BuiltRepartoRoutes = Required<RepartoRouteFragments>;

export type RepartoListParams = {
  skip?: number;
  limit?: number;
};

export function buildRepartoRoutes(routes: RepartoRouteFragments = {}): BuiltRepartoRoutes {
  return {
    dashboard: routes.dashboard ?? "/reparto",
    meeting: routes.meeting ?? "/reparto/meeting/current",
    processList: routes.processList ?? "/reparto/processes",
    teacherView: routes.teacherView ?? "/reparto/processes/[processId]/my-view",
    sharedScreen: routes.sharedScreen ?? "/reparto/processes/[processId]/shared",
    versions: routes.versions ?? "/reparto/processes/[processId]/versions",
    exports: routes.exports ?? "/reparto/processes/[processId]/exports",
  };
}

export function resolveProcessId(processId?: string): string | undefined {
  const trimmed = processId?.trim();
  return trimmed && trimmed !== "current" ? trimmed : undefined;
}

export function requireProcessId(processId?: string): string {
  const resolved = resolveProcessId(processId);
  if (!resolved) throw new Error("A concrete reparto process id is required.");
  return resolved;
}

export function normalizeListParams(params: RepartoListParams = {}): Required<RepartoListParams> {
  return {
    skip: params.skip ?? 0,
    limit: params.limit ?? 25,
  };
}
