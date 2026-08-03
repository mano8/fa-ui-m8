import type {
  AdminDashboardPublic,
  ImagePresetPublic,
  MediaObjectPublic,
  ObjectListParams,
  SubscriptionPublic,
} from "./schemas";

function disabled(): Error {
  return new Error("@mano8/astro-media-m8 is not enabled for this build.");
}

async function rejectDisabled(): Promise<never> {
  throw disabled();
}

export function useMediaObjects(_params?: ObjectListParams): {
  items: MediaObjectPublic[];
  count: number;
  loading: boolean;
  error: Error;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
} {
  return {
    items: [],
    count: 0,
    loading: false,
    error: disabled(),
    hasMore: false,
    refresh: rejectDisabled,
    loadMore: rejectDisabled,
  };
}

export function useMediaPresets(): {
  presets: ImagePresetPublic[];
  loading: boolean;
  error: Error;
  create: (_input: unknown) => Promise<ImagePresetPublic>;
  update: (_id: string, _input: unknown) => Promise<ImagePresetPublic>;
  remove: (_id: string) => Promise<void>;
} {
  return {
    presets: [],
    loading: false,
    error: disabled(),
    create: rejectDisabled,
    update: rejectDisabled,
    remove: rejectDisabled,
  };
}

export function useMediaAdmin(): {
  allowed: boolean;
  loading: boolean;
  error: Error;
  stats: AdminDashboardPublic | null;
  stale: { count: number } | null;
  orphans: { db_orphan_count: number; storage_orphan_count: number } | null;
  subscriptions: { items: SubscriptionPublic[] } | null;
  loadStats: () => Promise<void>;
  loadStale: () => Promise<void>;
  loadOrphans: () => Promise<void>;
  loadSubscriptions: () => Promise<void>;
  removeSubscription: (_id: string) => Promise<void>;
  purgeStale: () => Promise<void>;
  repair: (_deleteStorageOrphans?: boolean) => Promise<void>;
  purgeExpiredObjects: () => Promise<void>;
} {
  return {
    allowed: false,
    loading: false,
    error: disabled(),
    stats: null,
    stale: null,
    orphans: null,
    subscriptions: null,
    loadStats: rejectDisabled,
    loadStale: rejectDisabled,
    loadOrphans: rejectDisabled,
    loadSubscriptions: rejectDisabled,
    removeSubscription: rejectDisabled,
    purgeStale: rejectDisabled,
    repair: rejectDisabled,
    purgeExpiredObjects: rejectDisabled,
  };
}
