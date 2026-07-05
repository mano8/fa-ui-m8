// Stub for when @mano8/astro-prompt-m8 is not installed. Mirrors media-stubs/react.
import type { ReactNode } from "react";
import type { PromptAuthAdapter } from "./auth-adapter";

function DisabledPrompt() {
  return <p role="alert">Prompts are not enabled for this build.</p>;
}

type PromptProviderProps = {
  adapter?: PromptAuthAdapter;
  children: ReactNode;
  config?: Record<string, unknown>;
};

export function PromptProvider({ children }: PromptProviderProps) {
  return <>{children}</>;
}

export function PromptBlockLibrary() {
  return <DisabledPrompt />;
}

export function PromptTemplateEditor() {
  return <DisabledPrompt />;
}

export function PromptComposer(_props: { labels?: Record<string, unknown> }) {
  return <DisabledPrompt />;
}

export function AdminPromptPanel(_props: { labels?: Record<string, unknown> }) {
  return <DisabledPrompt />;
}
