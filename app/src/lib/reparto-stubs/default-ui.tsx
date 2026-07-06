import type { RepartoRuntimeConfig } from "./react";

function DisabledReparto() {
  return <p role="alert">Reparto is not enabled for this build.</p>;
}

type ViewProps = {
  config?: Partial<RepartoRuntimeConfig>;
  processId?: string;
};

export function RepartoDashboardView(_props: ViewProps) {
  return <DisabledReparto />;
}

export function RepartoMeetingView(_props: ViewProps) {
  return <DisabledReparto />;
}

export function RepartoProcessesView(_props: ViewProps) {
  return <DisabledReparto />;
}

export function RepartoMyView(_props: ViewProps) {
  return <DisabledReparto />;
}

export function RepartoSharedView(_props: ViewProps) {
  return <DisabledReparto />;
}

export function RepartoVersionsView(_props: ViewProps) {
  return <DisabledReparto />;
}

export function RepartoExportsView(_props: ViewProps) {
  return <DisabledReparto />;
}

export function DepartmentHeadView(props: ViewProps) {
  return <RepartoDashboardView {...props} />;
}

export function ProcessesView(props: ViewProps) {
  return <RepartoProcessesView {...props} />;
}

export function TeacherLanView(props: ViewProps) {
  return <RepartoMyView {...props} />;
}

export function SharedScreenView(props: ViewProps) {
  return <RepartoSharedView {...props} />;
}

export function RepartoExportCenterView(props: ViewProps) {
  return <RepartoExportsView {...props} />;
}
