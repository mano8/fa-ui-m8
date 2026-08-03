// Stub for when @mano8/astro-prompt-m8 is not installed. Mirrors media-stubs/hooks.
import type {
  ComposedPrompt,
  DynamicBlock,
  PromptBlockCreate,
  PromptBlockPublic,
  PromptBlockUpdate,
  PromptExport,
  PromptTemplateCreate,
  PromptTemplatePublic,
  PromptTemplateUpdate,
} from "./schemas";

type TransferItem = { slug: string | null; name: string };
type ImportResult = {
  blocks: { created: TransferItem[]; reused: TransferItem[] };
  templates: { created: TransferItem[]; skipped: TransferItem[] };
};

function disabled(): Error {
  return new Error("@mano8/astro-prompt-m8 is not enabled for this build.");
}

async function rejectDisabled(): Promise<never> {
  throw disabled();
}

type AsyncMutation<TInput, TOutput> = {
  isPending: boolean;
  mutate: (_input: TInput) => void;
  mutateAsync: (_input: TInput) => Promise<TOutput>;
};

export type PromptAdminOverview = {
  blocks: { count: number };
  templates: { count: number };
  categories: { count: number } | null;
  activity: { nb_users: number; activity: { activity: { model: string; added: number; updated: number }[] } };
};

export function usePromptBlocks(): {
  data: { data: PromptBlockPublic[]; count: number } | undefined;
  loading: boolean;
  error: Error;
  createMutation: AsyncMutation<PromptBlockCreate, PromptBlockPublic>;
  updateMutation: AsyncMutation<
    { blockId: number; body: PromptBlockUpdate },
    PromptBlockPublic
  >;
  deleteMutation: AsyncMutation<number, void>;
  refresh: () => Promise<void>;
} {
  const createMutation: AsyncMutation<PromptBlockCreate, PromptBlockPublic> = {
    isPending: false,
    mutate: () => undefined,
    mutateAsync: rejectDisabled,
  };
  const updateMutation: AsyncMutation<
    { blockId: number; body: PromptBlockUpdate },
    PromptBlockPublic
  > = {
    isPending: false,
    mutate: () => undefined,
    mutateAsync: rejectDisabled,
  };
  const deleteMutation: AsyncMutation<number, void> = {
    isPending: false,
    mutate: () => undefined,
    mutateAsync: rejectDisabled,
  };

  return {
    data: undefined,
    loading: false,
    error: disabled(),
    createMutation,
    updateMutation,
    deleteMutation,
    refresh: rejectDisabled
  };
}

export function usePromptTemplates(): {
  data: { data: PromptTemplatePublic[]; count: number } | undefined;
  loading: boolean;
  error: Error;
  createMutation: AsyncMutation<PromptTemplateCreate, PromptTemplatePublic>;
  updateMutation: AsyncMutation<
    { templateId: number; body: PromptTemplateUpdate },
    PromptTemplatePublic
  >;
  deleteMutation: AsyncMutation<number, void>;
  addBlockMutation: AsyncMutation<
    { templateId: number; blockId: number; position: number },
    PromptTemplatePublic
  >;
  removeBlockMutation: AsyncMutation<
    { templateId: number; blockId: number },
    PromptTemplatePublic
  >;
  setPositionMutation: AsyncMutation<
    { templateId: number; blockId: number; position: number },
    PromptTemplatePublic
  >;
  refresh: () => Promise<void>;
} {
  const createMutation: AsyncMutation<PromptTemplateCreate, PromptTemplatePublic> = {
    isPending: false,
    mutate: () => undefined,
    mutateAsync: rejectDisabled,
  };
  const updateMutation: AsyncMutation<
    { templateId: number; body: PromptTemplateUpdate },
    PromptTemplatePublic
  > = {
    isPending: false,
    mutate: () => undefined,
    mutateAsync: rejectDisabled,
  };
  const deleteMutation: AsyncMutation<number, void> = {
    isPending: false,
    mutate: () => undefined,
    mutateAsync: rejectDisabled,
  };
  const addBlockMutation: AsyncMutation<
    { templateId: number; blockId: number; position: number },
    PromptTemplatePublic
  > = {
    isPending: false,
    mutate: () => undefined,
    mutateAsync: rejectDisabled,
  };
  const removeBlockMutation: AsyncMutation<
    { templateId: number; blockId: number },
    PromptTemplatePublic
  > = {
    isPending: false,
    mutate: () => undefined,
    mutateAsync: rejectDisabled,
  };
  const setPositionMutation: AsyncMutation<
    { templateId: number; blockId: number; position: number },
    PromptTemplatePublic
  > = {
    isPending: false,
    mutate: () => undefined,
    mutateAsync: rejectDisabled,
  };

  return {
    data: undefined,
    loading: false,
    error: disabled(),
    createMutation,
    updateMutation,
    deleteMutation,
    addBlockMutation,
    removeBlockMutation,
    setPositionMutation,
    refresh: rejectDisabled
  };
}

export function useComposePrompt(): {
  compose: (_templateId: number, _blocks: DynamicBlock[]) => Promise<ComposedPrompt>;
  composeMutation: { isPending: boolean };
} {
  return {
    compose: rejectDisabled,
    composeMutation: { isPending: false }
  };
}

export function usePromptTransfer(): {
  exportBlockMutation: AsyncMutation<number, PromptExport>;
  exportTemplateMutation: AsyncMutation<number, PromptExport>;
  importMutation: AsyncMutation<unknown, ImportResult>;
} {
  const exportBlockMutation: AsyncMutation<number, PromptExport> = {
    isPending: false,
    mutate: () => undefined,
    mutateAsync: rejectDisabled,
  };
  const exportTemplateMutation: AsyncMutation<number, PromptExport> = {
    isPending: false,
    mutate: () => undefined,
    mutateAsync: rejectDisabled,
  };
  const importMutation: AsyncMutation<unknown, ImportResult> = {
    isPending: false,
    mutate: () => undefined,
    mutateAsync: rejectDisabled,
  };

  return { exportBlockMutation, exportTemplateMutation, importMutation };
}

export function usePromptAdmin(): {
  allowed: boolean;
  overview: PromptAdminOverview | null;
  loading: boolean;
  error: Error;
  load: () => Promise<void>;
} {
  return {
    allowed: false,
    overview: null,
    loading: false,
    error: disabled(),
    load: rejectDisabled
  };
}
