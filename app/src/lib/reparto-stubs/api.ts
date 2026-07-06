function disabled(): Error {
  return new Error("@mano8/astro-reparto-m8 is not enabled for this build.");
}

export async function listAssignmentProcesses(): Promise<never> {
  throw disabled();
}

export async function getProcessDashboard(): Promise<never> {
  throw disabled();
}

export async function getProcessSummary(): Promise<never> {
  throw disabled();
}

export async function listMeetingSessions(): Promise<never> {
  throw disabled();
}

export async function getTeacherLanSummary(): Promise<never> {
  throw disabled();
}

export async function listProcessVersions(): Promise<never> {
  throw disabled();
}

export async function listExportArtifacts(): Promise<never> {
  throw disabled();
}
