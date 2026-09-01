import type { ReactNode } from "react";
import type { MediaAuthAdapter } from "./auth-adapter";

function DisabledMedia() {
  return <p role="alert">Media is not enabled for this build.</p>;
}

type MediaProviderProps = {
  adapter?: MediaAuthAdapter;
  children: ReactNode;
  config?: Record<string, unknown>;
};

export function MediaProvider({ children }: MediaProviderProps) {
  return <>{children}</>;
}

export function MediaUploadDropzone(_props: { onUploaded?: () => void }) {
  return <DisabledMedia />;
}

export function MediaLibrary(_props: {
  objectHref?: (id: string) => string;
  initialUploadOpen?: boolean;
  labels?: unknown;
}) {
  return <DisabledMedia />;
}

export function CategoryManager() {
  return <DisabledMedia />;
}

export function ObjectDetail(_props: { objectId: string; onDeleted?: () => void }) {
  return <DisabledMedia />;
}
