// Stub for when @mano8/astro-prompt-m8 is not installed. Mirrors media-stubs/hooks.
function disabled(): Error {
  return new Error("@mano8/astro-prompt-m8 is not enabled for this build.");
}

async function rejectDisabled(): Promise<never> {
  throw disabled();
}

export type PromptBlockPublic = {
  id: number;
  name: string;
  type: string;
};

export type PromptTemplatePublic = {
  id: number;
  name: string;
  blocks: { id: number; block_id: number; name: string; is_dynamic: boolean }[];
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
  refresh: () => Promise<void>;
} {
  return {
    data: undefined,
    loading: false,
    error: disabled(),
    refresh: rejectDisabled
  };
}

export function usePromptTemplates(): {
  data: { data: PromptTemplatePublic[]; count: number } | undefined;
  loading: boolean;
  error: Error;
  refresh: () => Promise<void>;
} {
  return {
    data: undefined,
    loading: false,
    error: disabled(),
    refresh: rejectDisabled
  };
}

export function useComposePrompt(): {
  compose: () => Promise<never>;
} {
  return {
    compose: rejectDisabled
  };
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