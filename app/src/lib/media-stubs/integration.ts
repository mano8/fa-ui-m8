import type { AstroIntegration } from "astro";

type MediaIntegrationOptions = Record<string, unknown>;

export default function faMedia(_options: MediaIntegrationOptions = {}): AstroIntegration {
  return {
    name: "@mano8/astro-media-m8-disabled",
    hooks: {},
  };
}
