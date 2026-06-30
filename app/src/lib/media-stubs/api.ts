function disabled(): Error {
  return new Error("@mano8/astro-media-m8 is not enabled for this build.");
}

export async function deleteObject(): Promise<void> {
  throw disabled();
}
