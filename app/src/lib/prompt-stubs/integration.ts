import type { AstroIntegration } from "astro";

type PromptIntegrationOptions = Record<string, unknown>;

export default function faPrompt(_options: PromptIntegrationOptions = {}): AstroIntegration {
  return {
    name: "@mano8/astro-prompt-m8-disabled",
    hooks: {},
  };
}
