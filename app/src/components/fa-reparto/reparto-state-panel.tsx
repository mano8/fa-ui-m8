"use client";

export type RepartoStatePanelState =
  | "empty"
  | "error"
  | "loading"
  | "ready"
  | "unauthorized";

export interface RepartoStatePanelLabels {
  emptyTitle: string;
  emptyDescription: string;
  errorTitle: string;
  errorDescription: string;
  loadingLabel: string;
  retry: string;
  unauthorizedTitle: string;
  unauthorizedDescription: string;
}

const DEFAULT_LABELS: RepartoStatePanelLabels = {
  emptyTitle: "No reparto data",
  emptyDescription: "Select or create a reparto process to continue.",
  errorTitle: "Reparto unavailable",
  errorDescription: "The reparto service could not be reached.",
  loadingLabel: "Loading reparto data",
  retry: "Retry",
  unauthorizedTitle: "Authentication required",
  unauthorizedDescription: "Sign in with an account allowed to access reparto.",
};

export interface RepartoStatePanelProps {
  state: RepartoStatePanelState;
  labels?: Partial<RepartoStatePanelLabels>;
  error?: unknown;
  onRetry?: () => void;
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}

export function RepartoStatePanel({
  error,
  labels,
  onRetry,
  state,
}: RepartoStatePanelProps) {
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  if (state === "ready") return null;
  if (state === "loading") {
    return <p className="text-sm text-muted-foreground">{resolvedLabels.loadingLabel}</p>;
  }
  if (state === "error") {
    return (
      <section className="space-y-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <div className="font-medium text-destructive">{resolvedLabels.errorTitle}</div>
        <p className="text-sm text-muted-foreground">
          {errorMessage(error, resolvedLabels.errorDescription)}
        </p>
        {onRetry ? (
          <button
            type="button"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            onClick={onRetry}
          >
            {resolvedLabels.retry}
          </button>
        ) : null}
      </section>
    );
  }
  if (state === "unauthorized") {
    return (
      <section className="space-y-1 rounded-lg border p-4">
        <div className="font-medium">{resolvedLabels.unauthorizedTitle}</div>
        <p className="text-sm text-muted-foreground">
          {resolvedLabels.unauthorizedDescription}
        </p>
      </section>
    );
  }
  return (
    <section className="space-y-1 rounded-lg border p-4">
      <div className="font-medium">{resolvedLabels.emptyTitle}</div>
      <p className="text-sm text-muted-foreground">
        {resolvedLabels.emptyDescription}
      </p>
    </section>
  );
}

export default RepartoStatePanel;
