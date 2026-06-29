export type MediaAuthAdapter = {
  getAccessToken: () => Promise<string | null>;
  refreshAccessToken: () => Promise<string | null>;
  isSuperuser: () => boolean | Promise<boolean>;
};

type FaAuthAdapterOptions = {
  getToken: () => string | null | Promise<string | null>;
  refreshToken: () => string | null | Promise<string | null>;
  getUser: () => unknown | Promise<unknown>;
  isSuperuser: (user: unknown) => boolean;
};

let currentAdapter: MediaAuthAdapter | null = null;

export function createFaAuthAdapter(options: FaAuthAdapterOptions): MediaAuthAdapter {
  return {
    async getAccessToken() {
      return options.getToken();
    },
    async refreshAccessToken() {
      return options.refreshToken();
    },
    async isSuperuser() {
      return options.isSuperuser(await options.getUser());
    },
  };
}

export function setMediaAuthAdapter(adapter: MediaAuthAdapter): void {
  currentAdapter = adapter;
}

export function getMediaAuthAdapter(): MediaAuthAdapter | null {
  return currentAdapter;
}
