import type { ReactNode } from "react";
import type { RepartoListParams } from "./routes";

function disabled(): Error {
  return new Error("@mano8/astro-reparto-m8 is not enabled for this build.");
}

function DisabledReparto() {
  return <p role="alert">Reparto is not enabled for this build.</p>;
}

export type RepartoRuntimeConfig = {
  apiBase: string;
  apiPrefix: string;
};

export function RepartoProvider({ children }: { children: ReactNode; config?: Partial<RepartoRuntimeConfig> }) {
  return <>{children}</>;
}

export function RepartoQueryProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useRepartoContext(): { config?: Partial<RepartoRuntimeConfig> } {
  return {};
}

export function useRepartoProcesses(_params: RepartoListParams = {}) {
  return { data: undefined, error: disabled(), isError: true, isLoading: false };
}

export function useRepartoDashboard(_processId?: string) {
  return { data: undefined, error: disabled(), isError: true, isLoading: false };
}

export function useRepartoSummary(_processId?: string) {
  return { data: undefined, error: disabled(), isError: true, isLoading: false };
}

export function useRepartoMeetingSessions(_processId?: string) {
  return { data: undefined, error: disabled(), isError: true, isLoading: false };
}

export function useRepartoTeacherLan(_processId?: string) {
  return { data: undefined, error: disabled(), isError: true, isLoading: false };
}

export function useRepartoVersions(_processId?: string) {
  return { data: undefined, error: disabled(), isError: true, isLoading: false };
}

export function useRepartoExports(_processId?: string) {
  return { data: undefined, error: disabled(), isError: true, isLoading: false };
}

export function DepartmentHeadWorkspace() {
  return <DisabledReparto />;
}

export function ExportCenterView() {
  return <DisabledReparto />;
}

export function ProcessListView() {
  return <DisabledReparto />;
}

export function VersionsView() {
  return <DisabledReparto />;
}

export function SharedScreenWorkspace() {
  return <DisabledReparto />;
}

export function TeacherLanWorkspace() {
  return <DisabledReparto />;
}
