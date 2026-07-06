"use client";

import {
  RepartoDashboardView as PackageDashboardView,
  RepartoExportsView as PackageExportsView,
  RepartoMeetingView as PackageMeetingView,
  RepartoMyView as PackageMyView,
  RepartoProcessesView as PackageProcessesView,
  RepartoSharedView as PackageSharedView,
  RepartoVersionsView as PackageVersionsView,
} from "@mano8/astro-reparto-m8/default-ui";
import type {
  AssignmentProcessPublic,
  ExportArtifactPublic,
  MeetingSessionPublic,
  ProcessDashboard,
  ProcessSummary,
  ProcessVersionPublic,
  TeacherLanSummary,
  VersionComparison,
} from "@mano8/astro-reparto-m8/schemas";

import { RepartoProcessesTable } from "@/components/fa-reparto/reparto-processes-table";
import { RepartoStatePanel } from "@/components/fa-reparto/reparto-state-panel";

type PackageConfig = NonNullable<
  Parameters<typeof PackageDashboardView>[0]
>["config"];

export interface RepartoStarterViewProps {
  config?: PackageConfig;
  processId?: string;
}

export function RepartoDashboardView({
  config,
  dashboard,
  processId,
  summary,
}: RepartoStarterViewProps & {
  dashboard?: ProcessDashboard | null;
  summary?: ProcessSummary | null;
}) {
  return (
    <PackageDashboardView
      config={config}
      dashboard={dashboard}
      processId={processId}
      summary={summary}
    />
  );
}

export function RepartoMeetingView({
  config,
  processId,
  summary,
}: RepartoStarterViewProps & {
  summary?: ProcessSummary | null;
}) {
  return (
    <PackageMeetingView config={config} processId={processId} summary={summary} />
  );
}

export function RepartoProcessesView({
  config,
  count,
  processes,
}: {
  config?: PackageConfig;
  count?: number;
  processes?: AssignmentProcessPublic[];
}) {
  if (processes) {
    return (
      <section className="not-content space-y-3" data-reparto-route="processes">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Processes</h2>
          <span className="text-sm text-muted-foreground">
            {count ?? processes.length}
          </span>
        </div>
        {processes.length > 0 ? (
          <RepartoProcessesTable processes={processes} />
        ) : (
          <RepartoStatePanel state="empty" />
        )}
      </section>
    );
  }
  return <PackageProcessesView config={config} />;
}

export function RepartoMyView({
  config,
  meetingSession,
  processId,
  requirementAssignedHours,
  requirementRequiredHours,
  summary,
}: RepartoStarterViewProps & {
  meetingSession?: MeetingSessionPublic | null;
  requirementAssignedHours?: number;
  requirementRequiredHours?: number;
  summary?: TeacherLanSummary | null;
}) {
  return (
    <PackageMyView
      config={config}
      meetingSession={meetingSession}
      processId={processId}
      requirementAssignedHours={requirementAssignedHours}
      requirementRequiredHours={requirementRequiredHours}
      summary={summary}
    />
  );
}

export function RepartoSharedView({
  config,
  processId,
  summary,
}: RepartoStarterViewProps & {
  summary?: ProcessSummary | null;
}) {
  return (
    <PackageSharedView config={config} processId={processId} summary={summary} />
  );
}

export function RepartoVersionsView({
  comparison,
  config,
  processId,
  versions,
}: RepartoStarterViewProps & {
  comparison?: VersionComparison;
  versions?: ProcessVersionPublic[];
}) {
  return (
    <PackageVersionsView
      comparison={comparison}
      config={config}
      processId={processId}
      versions={versions}
    />
  );
}

export function RepartoExportsView({
  config,
  exports,
  processId,
  summary,
}: RepartoStarterViewProps & {
  exports?: ExportArtifactPublic[];
  summary?: ProcessSummary;
}) {
  return (
    <PackageExportsView
      config={config}
      exports={exports}
      processId={processId}
      summary={summary}
    />
  );
}
