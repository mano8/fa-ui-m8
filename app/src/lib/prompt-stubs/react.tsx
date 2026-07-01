// Stub for when @mano8/astro-prompt-m8 is not installed. Mirrors media-stubs/react.
import type { ReactNode } from "react";

function DisabledPrompt() {
  return <p role="alert">Prompts are not enabled for this build.</p>;
}

export function PromptProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function PromptBlockLibrary() {
  return <DisabledPrompt />;
}

export function PromptTemplateEditor() {
  return <DisabledPrompt />;
}

export function PromptComposer() {
  return <DisabledPrompt />;
}

export function AdminPromptPanel() {
  return <DisabledPrompt />;
}