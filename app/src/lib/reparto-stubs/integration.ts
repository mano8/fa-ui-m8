import type { AstroIntegration } from "astro";

export type RepartoRouteFragments = {
  dashboard?: string | false;
  meeting?: string | false;
  processList?: string | false;
  teacherView?: string | false;
  sharedScreen?: string | false;
  versions?: string | false;
  exports?: string | false;
};

export type FaRepartoAstroOptions = {
  apiBase?: string;
  apiPrefix?: string;
  mode?: "headless" | "starter";
  locales?: string[];
  defaultLocale?: string;
  auth?: { provider?: "fa-auth-astro" | "custom" | "none" };
  routes?: RepartoRouteFragments;
  views?: { strategy?: "none" | "package" | "scaffolded" };
};

export function buildRepartoRoutes(routes: RepartoRouteFragments = {}): Required<RepartoRouteFragments> {
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

export default function faReparto(_options: FaRepartoAstroOptions = {}): AstroIntegration {
  return {
    name: "@mano8/astro-reparto-m8-disabled",
    hooks: {},
  };
}
