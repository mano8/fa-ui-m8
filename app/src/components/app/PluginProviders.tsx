import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { AuthProvider } from "../auth/AuthProvider";
import { MediaProvider } from "../media/MediaProvider";
import { PromptProvider } from "../prompt/PromptProvider";

export type PluginProvidersProps = {
  children: ReactNode;
  media?: boolean;
  prompt?: boolean;
  queryClient?: QueryClient;
};

let sharedPluginQueryClient: QueryClient | null = null;

export function createPluginQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 5_000,
      },
    },
  });
}

function getSharedPluginQueryClient() {
  sharedPluginQueryClient ??= createPluginQueryClient();
  return sharedPluginQueryClient;
}

export function PluginProviders({ children, media = false, prompt = false, queryClient }: PluginProvidersProps) {
  const [client] = useState(() => queryClient ?? getSharedPluginQueryClient());
  let content: ReactNode = children;
  if (media) content = <MediaProvider>{content}</MediaProvider>;
  if (prompt) content = <PromptProvider>{content}</PromptProvider>;

  return (
    <QueryClientProvider client={client}>
      <AuthProvider>{content}</AuthProvider>
    </QueryClientProvider>
  );
}
