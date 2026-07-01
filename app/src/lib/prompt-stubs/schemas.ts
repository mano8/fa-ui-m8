// Stub for when @mano8/astro-prompt-m8 is not installed. Mirrors media-stubs/schemas.
export type PromptBlockType =
  | "role"
  | "task"
  | "context"
  | "instruction"
  | "example"
  | "format";

export type PromptBlockPublic = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  content: string;
  type: PromptBlockType;
  is_dynamic: boolean;
  is_public: boolean;
  owner_id: string;
};

export type PromptBlockCreate = {
  name: string;
  content: string;
  type: PromptBlockType;
  description?: string | null;
  is_dynamic?: boolean;
  is_public?: boolean;
  slug?: string | null;
};

export type PromptBlockUpdate = PromptBlockCreate;

export type TemplateBlockPublic = {
  id: number;
  block_id: number;
  template_id: number;
  name: string;
  slug: string;
  description: string | null;
  content: string;
  type: PromptBlockType;
  is_dynamic: boolean;
  is_public: boolean;
  position: number;
};

export type PromptTemplatePublic = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_public: boolean;
  blocks: TemplateBlockPublic[];
};

export type PromptTemplateCreate = {
  name: string;
  description?: string | null;
  is_public?: boolean;
  slug?: string | null;
};

export type PromptTemplateUpdate = PromptTemplateCreate;

export type DynamicBlock = { id: number; content: string };

export type ComposedPrompt = { content: string };

export type PromptBlocksPublic = { count: number; data: PromptBlockPublic[] };
export type PromptTemplatesPublic = { count: number; data: PromptTemplatePublic[] };

export type CategoryPublic = {
  id: number;
  name: string;
  slug: string;
  type: "prompt_block" | "prompt_template";
  owner_id: string;
};

export type CategoriesPublic = { count: number; data: CategoryPublic[] };

export type PromptAdminOverview = {
  blocks: PromptBlocksPublic;
  templates: PromptTemplatesPublic;
  categories: CategoriesPublic | null;
  activity: {
    nb_users: number;
    activity: {
      min: number;
      max: number;
      activity: { model: string; updated: number; added: number }[];
    };
  };
};