// Stub for when @mano8/astro-prompt-m8 is not installed. Mirrors media-stubs/auth-adapter.
type RefreshResult = { access_token?: string } | string | null | undefined;

export type PromptAuthAdapter = {
  getAccessToken: () => string | null | Promise<string | null>;
  refresh?: () => Promise<string | null>;
  getUser?: () => unknown | Promise<unknown>;
  isSuperuser?: (user?: unknown) => boolean | Promise<boolean>;
};

type FaAuthAdapterOptions = {
  getToken: () => string | null | Promise<string | null>;
  refreshToken: () => RefreshResult | Promise<RefreshResult>;
  getUser: () => unknown | Promise<unknown>;
  isSuperuser: (user: unknown) => boolean;
};

let currentAdapter: PromptAuthAdapter | null = null;

export function createFaAuthAdapter(options: FaAuthAdapterOptions): PromptAuthAdapter {
  return {
    async getAccessToken() {
      return options.getToken();
    },
    async refresh() {
      const result = await options.refreshToken();
      if (!result) return null;
      return typeof result === "string" ? result : result.access_token ?? null;
    },
    getUser() {
      return options.getUser();
    },
    isSuperuser(user?: unknown) {
      return options.isSuperuser(user);
    }
  };
}

export function setPromptAuthAdapter(adapter: PromptAuthAdapter): void {
  currentAdapter = adapter;
}

export function getPromptAuthAdapter(): PromptAuthAdapter | null {
  return currentAdapter;
}
