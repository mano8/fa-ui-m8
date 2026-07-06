export type RepartoAuthAdapter = {
  getAccessToken: () => string | null | Promise<string | null>;
  refresh?: () => string | null | Promise<string | null>;
  onUnauthenticated?: (reason: "unauthenticated" | "refresh-failed") => void;
};

export function createInMemoryAuthAdapter(initialToken: string | null = null): RepartoAuthAdapter & {
  setAccessToken: (token: string | null) => void;
} {
  let token = initialToken;
  return {
    getAccessToken: () => token,
    setAccessToken: (nextToken: string | null) => {
      token = nextToken;
    },
  };
}

export function createFaAuthAdapter(options: {
  getToken: () => string | null | Promise<string | null>;
  refreshToken?: () =>
    | string
    | null
    | { access_token?: unknown }
    | Promise<string | null | { access_token?: unknown }>;
  onUnauthenticated?: RepartoAuthAdapter["onUnauthenticated"];
}): RepartoAuthAdapter {
  return {
    getAccessToken: options.getToken,
    refresh: async () => {
      if (!options.refreshToken) return null;
      const refreshed = await options.refreshToken();
      if (typeof refreshed === "string" || refreshed === null) return refreshed;
      return typeof refreshed.access_token === "string" ? refreshed.access_token : null;
    },
    onUnauthenticated: options.onUnauthenticated,
  };
}

let currentAdapter: RepartoAuthAdapter = createInMemoryAuthAdapter();

export function setRepartoAuthAdapter(adapter: RepartoAuthAdapter): RepartoAuthAdapter {
  currentAdapter = adapter;
  return currentAdapter;
}

export function getRepartoAuthAdapter(): RepartoAuthAdapter {
  return currentAdapter;
}

export function resetRepartoAuthAdapter(): void {
  currentAdapter = createInMemoryAuthAdapter();
}
