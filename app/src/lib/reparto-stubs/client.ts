function disabled(): Error {
  return new Error("@mano8/astro-reparto-m8 is not enabled for this build.");
}

export type RepartoRequestBase = "api" | "absolute";

export type RepartoRequestOptions<T> = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  base?: RepartoRequestBase;
  body?: unknown;
  schema: { parse: (value: unknown) => T };
};

export function repartoUrl(_base: RepartoRequestBase, path: string): string {
  return path;
}

export async function request<T>(_options: RepartoRequestOptions<T>): Promise<never> {
  throw disabled();
}
