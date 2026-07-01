// Stub for when @mano8/astro-prompt-m8 is not installed. Mirrors media-stubs/auth-adapter.
export type PromptAuthAdapter = {
  getAccessToken: () => Promise<string | null>;
  isSuperuser: () => boolean | Promise<boolean>;
};

type FaAuthAdapterOptions = {
  getToken: () => string | null | Promise<string | null>;
  refreshToken: () => string | null | Promise<string | null>;
  getUser: () => unknown | Promise<unknown>;
  isSuperuser: (user: unknown) => boolean;
};

let currentAdapter: PromptAuthAdapter | null = null;

export function createFaAuthAdapter(_options: FaAuthAdapterOptions): PromptAuthAdapter {
  return {
    async getAccessToken() {
      return null;
    },
    async isSuperuser() {
      return false;
    }
  };
}

export function setPromptAuthAdapter(adapter: PromptAuthAdapter): void {
  currentAdapter = adapter;
}

export function getPromptAuthAdapter(): PromptAuthAdapter | null {
  return currentAdapter;
}