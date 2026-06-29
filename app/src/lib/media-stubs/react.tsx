import type { ReactNode } from "react";

function DisabledMedia() {
  return <p role="alert">Media is not enabled for this build.</p>;
}

export function MediaProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function MediaUploadDropzone() {
  return <DisabledMedia />;
}

export function ObjectDetail() {
  return <DisabledMedia />;
}
