import type {
  AdminDashboardPublic,
  CategoryCreate,
  CategoryNode,
  CategoryPublic,
  CategoryUpdate,
  DownloadUrlResponse,
  ImagePresetPublic,
  MediaObjectPublic,
  MediaObjectUpdate,
  ObjectListParams,
  SubscriptionPublic,
  VariantJobPublic,
  VariantPublic,
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

export function useMediaObject(_objectId: string | null): {
  object: MediaObjectPublic | null;
  loading: boolean;
  error: Error;
  reload: () => Promise<void>;
  update: (_patch: MediaObjectUpdate) => Promise<MediaObjectPublic>;
  remove: () => Promise<void>;
} {
  return {
    object: null,
    loading: false,
    error: disabled(),
    reload: rejectDisabled,
    update: rejectDisabled,
    remove: rejectDisabled,
  };
}

export function useDownloadUrl(_objectId: string | null): {
  data: DownloadUrlResponse | null;
  loading: boolean;
  error: Error | null;
  request: () => Promise<DownloadUrlResponse>;
  resolve: (_token: string) => Promise<DownloadUrlResponse>;
} {
  return {
    data: null,
    loading: false,
    error: disabled(),
    request: rejectDisabled,
    resolve: rejectDisabled,
  };
}

export function useMediaVariants(_objectId: string | null): {
  items: VariantPublic[];
  loading: boolean;
  error: Error;
  job: VariantJobPublic | null;
  reload: () => Promise<void>;
  generate: (_presets: string[]) => Promise<VariantJobPublic>;
  remove: (_variantId: string) => Promise<void>;
} {
  return {
    items: [],
    loading: false,
    error: disabled(),
    job: null,
    reload: rejectDisabled,
    generate: rejectDisabled,
    remove: rejectDisabled,
  };
}

export function useCategoryTree(): {
  tree: CategoryNode[];
  count: number;
  loading: boolean;
  error: Error;
  reload: () => Promise<void>;
  create: (_body: CategoryCreate) => Promise<CategoryPublic>;
  update: (_id: number, _body: CategoryUpdate) => Promise<CategoryPublic>;
  remove: (_id: number) => Promise<void>;
} {
  return {
    tree: [],
    count: 0,
    loading: false,
    error: disabled(),
    reload: rejectDisabled,
    create: rejectDisabled,
    update: rejectDisabled,
    remove: rejectDisabled,
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
