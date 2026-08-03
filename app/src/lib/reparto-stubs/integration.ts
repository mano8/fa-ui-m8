import type { AstroIntegration } from "astro";

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
  requirements: string | false;
  participants: string | false;
  assignments: string | false;
  audit: string | false;
};

export type RepartoRouteName = keyof BuiltRepartoRoutes;

export type FaRepartoNavEntry = {
  labelKey: string;
  route?: RepartoRouteName;
  href?: string;
};

export type FaRepartoNavGroup = {
  labelKey: string;
  entries: FaRepartoNavEntry[];
};

export type FaRepartoNav = {
  setup: FaRepartoNavGroup;
  process: FaRepartoNavGroup;
};

export type FaRepartoAstroOptions = {
  apiBase?: string;
  apiPrefix?: string;
  mode?: "headless" | "starter";
  locales?: string[];
  defaultLocale?: string;
  auth?: {
    provider?: "fa-auth-astro" | "custom" | "none";
    loginPath?: string;
  };
  routes?: RepartoRouteFragments;
  views?: { strategy?: "none" | "package" | "scaffolded" };
};

export const DEFAULT_REPARTO_NAV: FaRepartoNav = {
  setup: {
    labelKey: "nav.group.setup",
    entries: [
      { labelKey: "nav.item.schools", route: "schools" },
      { labelKey: "nav.item.academicYears", route: "academicYears" },
      { labelKey: "nav.item.departments", route: "departments" },
      { labelKey: "nav.item.teacherRoster", route: "teacherRoster" },
    ],
  },
  process: {
    labelKey: "nav.group.process",
    entries: [
      { labelKey: "nav.item.dashboard", route: "dashboard" },
      { labelKey: "nav.item.processes", route: "processList" },
      { labelKey: "nav.item.classrooms", route: "classrooms" },
      { labelKey: "nav.item.subjects", route: "subjects" },
      { labelKey: "nav.item.requirements", route: "requirements" },
      { labelKey: "nav.item.processParticipants", route: "participants" },
      { labelKey: "nav.item.assignments", route: "assignments" },
      { labelKey: "nav.item.meeting", route: "meeting" },
      { labelKey: "nav.item.myView", route: "teacherView" },
      { labelKey: "nav.item.shared", route: "sharedScreen" },
      { labelKey: "nav.item.versions", route: "versions" },
      { labelKey: "nav.item.exports", route: "exports" },
      { labelKey: "nav.item.audit", route: "audit" },
    ],
  },
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
    requirements: routes.requirements ?? "/reparto/processes/[processId]/requirements",
    participants: routes.participants ?? "/reparto/processes/[processId]/participants",
    assignments: routes.assignments ?? "/reparto/processes/[processId]/assignments",
    audit: routes.audit ?? "/reparto/processes/[processId]/audit",
  };
}

export function buildRepartoNav(
  routes: BuiltRepartoRoutes,
  nav: FaRepartoNav = DEFAULT_REPARTO_NAV,
): FaRepartoNav {
  const resolveHref = (entry: FaRepartoNavEntry): FaRepartoNavEntry => {
    if (entry.href) return entry;
    if (!entry.route) return { ...entry, href: "#" };
    const pattern = routes[entry.route];
    return {
      ...entry,
      href: pattern ? String(pattern).replace(/\[([^\]]+)\]/g, "current") : "#",
    };
  };

  return {
    setup: { ...nav.setup, entries: nav.setup.entries.map(resolveHref) },
    process: { ...nav.process, entries: nav.process.entries.map(resolveHref) },
  };
}

export default function faReparto(_options: FaRepartoAstroOptions = {}): AstroIntegration {
  return {
    name: "@mano8/astro-reparto-m8-disabled",
    hooks: {},
  };
}
