type RefreshResult = { access_token?: string } | string | null | undefined;

export type MediaAuthAdapter = {
  getAccessToken: () => string | null | Promise<string | null>;
  refresh?: () => Promise<string | null>;
  refreshAccessToken?: () => Promise<string | null>;
  getUser?: () => unknown | Promise<unknown>;
  isSuperuser?: (user?: unknown) => boolean | Promise<boolean>;
};

type FaAuthAdapterOptions = {
  getToken: () => string | null | Promise<string | null>;
  refreshToken: () => RefreshResult | Promise<RefreshResult>;
  getUser: () => unknown | Promise<unknown>;
  isSuperuser: (user: unknown) => boolean;
};

let currentAdapter: MediaAuthAdapter | null = null;

export function createFaAuthAdapter(options: FaAuthAdapterOptions): MediaAuthAdapter {
  return {
    async getAccessToken() {
      return options.getToken();
    },
    async refresh() {
      const result = await options.refreshToken();
      if (!result) return null;
      return typeof result === "string" ? result : result.access_token ?? null;
    },
    async refreshAccessToken() {
      const result = await options.refreshToken();
      if (!result) return null;
      return typeof result === "string" ? result : result.access_token ?? null;
    },
    getUser() {
      return options.getUser();
    },
    isSuperuser(user?: unknown) {
      return options.isSuperuser(user);
    },
  };
}

export function setMediaAuthAdapter(adapter: MediaAuthAdapter): void {
  currentAdapter = adapter;
}

export function getMediaAuthAdapter(): MediaAuthAdapter | null {
  return currentAdapter;
}
