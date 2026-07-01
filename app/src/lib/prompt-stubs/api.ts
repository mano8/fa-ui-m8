// Stub for when @mano8/astro-prompt-m8 is not installed. Mirrors media-stubs/api.
function disabled(): Error {
  return new Error("@mano8/astro-prompt-m8 is not enabled for this build.");
}

export async function listBlocks(): Promise<never> {
  throw disabled();
}
export async function getBlock(): Promise<never> {
  throw disabled();
}
export async function createBlock(): Promise<never> {
  throw disabled();
}