export type RepartoRouteFragments = {
  dashboard?: string | false;
  meeting?: string | false;
  processList?: string | false;
  teacherView?: string | false;
  sharedScreen?: string | false;
  versions?: string | false;
  exports?: string | false;
  schools?: string | false;
  academicYears?: string | false;
  departments?: string | false;
  teacherRoster?: string | false;
  subjects?: string | false;
  classrooms?: string | false;
  classroomStages?: string | false;
  requirements?: string | false;
  participants?: string | false;
  assignments?: string | false;
  audit?: string | false;
};

export type BuiltRepartoRoutes = {
  dashboard: string | false;
  meeting: string | false;
  processList: string | false;
  teacherView: string | false;
  sharedScreen: string | false;
  versions: string | false;
  exports: string | false;
  schools: string | false;
  academicYears: string | false;
  departments: string | false;
  teacherRoster: string | false;
  subjects: string | false;
  classrooms: string | false;
  classroomStages: string | false;
  requirements: string | false;
  participants: string | false;
  assignments: string | false;
  audit: string | false;
};

export type RepartoRouteName = keyof BuiltRepartoRoutes;

export type RepartoListParams = {
  skip?: number;
  limit?: number;
};

export function buildRepartoRoutes(routes: RepartoRouteFragments = {}): BuiltRepartoRoutes {
  return {
    dashboard: routes.dashboard ?? "/reparto",
    meeting: routes.meeting ?? "/reparto/meeting/[processId]",
    processList: routes.processList ?? "/reparto/processes",
    teacherView: routes.teacherView ?? "/reparto/processes/[processId]/my-view",
    sharedScreen: routes.sharedScreen ?? "/reparto/processes/[processId]/shared",
    versions: routes.versions ?? "/reparto/processes/[processId]/versions",
    exports: routes.exports ?? "/reparto/processes/[processId]/exports",
    schools: routes.schools ?? "/reparto/setup/schools",
    academicYears: routes.academicYears ?? "/reparto/setup/academic-years",
    departments: routes.departments ?? "/reparto/setup/departments",
    teacherRoster: routes.teacherRoster ?? "/reparto/setup/teacher-roster",
    subjects: routes.subjects ?? "/reparto/processes/[processId]/subjects",
    classrooms: routes.classrooms ?? "/reparto/processes/[processId]/classrooms",
    classroomStages: routes.classroomStages ?? "/reparto/setup/classroom-stages",
    requirements: routes.requirements ?? "/reparto/processes/[processId]/requirements",
    participants: routes.participants ?? "/reparto/processes/[processId]/participants",
    assignments: routes.assignments ?? "/reparto/processes/[processId]/assignments",
    audit: routes.audit ?? "/reparto/processes/[processId]/audit",
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
