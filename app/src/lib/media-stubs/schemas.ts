export type MediaCategory =
  | "avatar"
  | "document"
  | "asset"
  | "chat_attachment"
  | "export"
  | "receipt";

export type MediaVisibility = "private" | "public";
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
  id?: string;
  name: string;
  spec: PresetSpec;
  builtin: boolean;
  created_at: string | null;
};

export type MediaObjectPublic = {
  id: string;
  original_filename: string | null;
  category: MediaCategory;
  status: MediaObjectStatus;
  size_bytes: number;
  created_at: string;
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
