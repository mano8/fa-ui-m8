// Prompt feature gate, mirroring mediaFeature.ts. The integration's vite.define
// sets PUBLIC_FA_PROMPT_ENABLED to true only when PUBLIC_PROMPT_API_BASE is set
// AND @mano8/astro-prompt-m8 is installed (dynamic import keeps the build from
// requiring the package when prompts are disabled).
export const promptFeatureEnabled = import.meta.env.PUBLIC_FA_PROMPT_ENABLED === true;

import type { Locale } from "@/content/i18n/app";

export type PromptView = "blocks" | "templates" | "composer" | "admin";

export type PromptRouteProps =
  | { kind: "view"; locale: Locale; view: PromptView }
  | { kind: "object"; locale: Locale };

export type PromptStaticPath = {
  params: { path: string | undefined };
  props: PromptRouteProps;
};

const VIEW_ROUTES: { path: string | undefined; view: PromptView }[] = [
  { path: undefined, view: "templates" },
  { path: "blocks", view: "blocks" },
  { path: "composer", view: "composer" },
  { path: "admin", view: "admin" }
];

export function getPromptStaticPaths(locale: Locale): PromptStaticPath[] {
  if (!promptFeatureEnabled) return [];

  return VIEW_ROUTES.map(({ path, view }) => ({
    params: { path },
    props: { kind: "view" as const, locale, view }
  }));
}
