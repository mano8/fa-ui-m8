import type { Locale } from "@/content/i18n/app";
import type { MediaPresetAction } from "@/components/media/MediaPresetActionApp";
import type { MediaView } from "@/components/media/MediaApp";

export const mediaFeatureEnabled = import.meta.env.PUBLIC_FA_MEDIA_ENABLED === true;

type MediaViewRouteProps = {
  kind: "view";
  locale: Locale;
  view: MediaView;
};

type MediaObjectRouteProps = {
  kind: "object";
  locale: Locale;
};

type MediaPresetActionRouteProps = {
  kind: "presetAction";
  locale: Locale;
  action: MediaPresetAction;
};

export type MediaRouteProps =
  | MediaViewRouteProps
  | MediaObjectRouteProps
  | MediaPresetActionRouteProps;

type MediaStaticPath = {
  params: { path: string | undefined };
  props: MediaRouteProps;
};

const VIEW_ROUTES: { path: string | undefined; view: MediaView }[] = [
  { path: undefined, view: "library" },
  { path: "upload", view: "upload" },
  { path: "presets", view: "presets" },
  { path: "admin", view: "admin" },
  { path: "maintenance", view: "maintenance" },
];

const PRESET_ACTIONS: MediaPresetAction[] = ["new", "edit", "delete"];

export function getMediaStaticPaths(locale: Locale): MediaStaticPath[] {
  if (!mediaFeatureEnabled) return [];

  return [
    ...VIEW_ROUTES.map(({ path, view }) => ({
      params: { path },
      props: { kind: "view" as const, locale, view },
    })),
    {
      params: { path: "object" },
      props: { kind: "object", locale },
    },
    ...PRESET_ACTIONS.map((action) => ({
      params: { path: `presets/${action}` },
      props: { kind: "presetAction" as const, locale, action },
    })),
  ];
}
