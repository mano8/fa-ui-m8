import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { AuthProvider } from "../auth/AuthProvider";
import { MediaProvider } from "../media/MediaProvider";

export type PluginProvidersProps = {
  children: ReactNode;
  media?: boolean;
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

export function PluginProviders({ children, media = false, queryClient }: PluginProvidersProps) {
  const [client] = useState(() => queryClient ?? getSharedPluginQueryClient());
  const content = media ? <MediaProvider>{children}</MediaProvider> : children;

  return (
    <QueryClientProvider client={client}>
      <AuthProvider>{content}</AuthProvider>
    </QueryClientProvider>
  );
}
