export type MediaCategory =
  | "avatar"
  | "document"
  | "asset"
  | "chat_attachment"
  | "export"
  | "receipt";

export type MediaVisibility = "private" | "public" | "tenant" | "sensitive";
export type MediaObjectStatus =
  | "pending_upload"
  | "uploaded"
  | "processing"
  | "ready"
  | "failed"
  | "deleted"
  | "rejected";
export type SortField = "original_filename" | "category" | "status" | "size_bytes" | "created_at";
export type SortOrder = "asc" | "desc";
export type ImageFormat = "WEBP" | "JPEG" | "PNG" | "GIF" | "AVIF";

export type CategoryNode = {
  id: number;
  owner_id: string;
  tenant_id: string | null;
  name: string;
  slug: string;
  parent_id: number | null;
  object_count: number;
  total_object_count: number;
  children: CategoryNode[];
};

export type CategoryPublic = Pick<
  CategoryNode,
  "id" | "owner_id" | "tenant_id" | "name" | "slug" | "parent_id"
>;

export type CategoryCreate = {
  name: string;
  parent_id?: number | null;
};

export type CategoryUpdate = CategoryCreate;

export type MediaObjectCategoryRef = {
  id: number;
  name: string;
  path: string;
};

export type ObjectListParams = {
  category?: MediaCategory;
  created_from?: string;
  created_to?: string;
  include_deleted?: boolean;
  limit?: number;
  mime_prefix?: string;
  order?: SortOrder;
  owner_user_id?: string;
  q?: string;
  sort_by?: SortField;
  status?: MediaObjectStatus;
  visibility?: MediaVisibility;
};

export type PresetSpec = {
  image_size: {
    fixed_width: number | null;
    fixed_height: number | null;
    fixed_size: number | null;
  };
  formats: { ext: ImageFormat; quality: number }[];
  allow_upscale: boolean;
  max_byte_size: number | null;
};

export type ImagePresetPublic = {
  id?: string | null;
  name: string;
  spec: PresetSpec;
  builtin: boolean;
  created_at: string | null;
  updated_at?: string | null;
};

export type MediaObjectPublic = {
  id: string;
  tenant_id?: string | null;
  owner_user_id?: string | null;
  original_filename: string | null;
  storage_bucket?: string;
  object_key?: string;
  mime_type?: string | null;
  extension?: string | null;
  category: MediaCategory;
  visibility?: MediaVisibility;
  status: MediaObjectStatus;
  scan_status?: string | null;
  moderation_status?: string | null;
  categories: MediaObjectCategoryRef[];
  size_bytes: number;
  sha256?: string | null;
  etag?: string | null;
  storage_class?: string | null;
  created_at: string;
  updated_at?: string | null;
  deleted_at?: string | null;
};

export type MediaObjectUpdate = {
  visibility?: MediaVisibility;
  original_filename?: string | null;
  category?: MediaCategory;
  category_ids?: number[] | null;
};

export type DownloadUrlResponse = {
  url: string;
  expires_at: string;
};

export type VariantPublic = {
  id: string;
  media_object_id: string;
  variant_name: string;
  storage_bucket: string;
  object_key: string;
  width: number | null;
  height: number | null;
  size_bytes: number;
  format: string;
  created_at: string;
};

export type VariantJobPublic = {
  id: string;
  media_object_id: string;
  owner_user_id: string;
  status: string;
  requested_presets: string[];
  variants_expected: number;
  variants_created: number;
  error: string | null;
  created_at: string;
  updated_at: string;
};

export type SubscriptionPublic = {
  id: string;
  url: string;
  event_types: string[];
  active: boolean;
};

export type AdminDashboardPublic = {
  total_objects: number;
  total_bytes: number;
  deleted_objects: number;
  by_category: { category: MediaCategory; total_bytes: number; count: number }[];
};
