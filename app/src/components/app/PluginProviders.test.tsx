import { cleanup, render } from "@testing-library/react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

import { PluginProviders, createPluginQueryClient } from "./PluginProviders";

const providerEvents = vi.hoisted(() => [] as string[]);
const expectedClient = vi.hoisted(() => ({ current: null as QueryClient | null }));

vi.mock("../auth/AuthProvider", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  const query = await vi.importActual<typeof import("@tanstack/react-query")>(
    "@tanstack/react-query",
  );

  return {
    AuthProvider({ children }: { children: ReactNode }) {
      providerEvents.push(
        query.useQueryClient() === expectedClient.current ? "auth:shared" : "auth:other",
      );
      return React.createElement("section", { "data-provider": "auth" }, children);
    },
  };
});

vi.mock("../media/MediaProvider", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  const query = await vi.importActual<typeof import("@tanstack/react-query")>(
    "@tanstack/react-query",
  );

  return {
    MediaProvider({ children }: { children: ReactNode }) {
      providerEvents.push(
        query.useQueryClient() === expectedClient.current ? "media:shared" : "media:other",
      );
      return React.createElement("section", { "data-provider": "media" }, children);
    },
  };
});

vi.mock("../prompt/PromptProvider", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  const query = await vi.importActual<typeof import("@tanstack/react-query")>(
    "@tanstack/react-query",
  );

  return {
    PromptProvider({ children }: { children: ReactNode }) {
      providerEvents.push(
        query.useQueryClient() === expectedClient.current ? "prompt:shared" : "prompt:other",
      );
      return React.createElement("section", { "data-provider": "prompt" }, children);
    },
  };
});

vi.mock("../reparto/RepartoProvider", async () => {
  const React = await vi.importActual<typeof import("react")>("react");
  const query = await vi.importActual<typeof import("@tanstack/react-query")>(
    "@tanstack/react-query",
  );

  return {
    RepartoProvider({ children }: { children: ReactNode }) {
      providerEvents.push(
        query.useQueryClient() === expectedClient.current ? "reparto:shared" : "reparto:other",
      );
      return React.createElement("section", { "data-provider": "reparto" }, children);
    },
  };
});

afterEach(() => {
  providerEvents.length = 0;
  expectedClient.current = null;
  cleanup();
});

function QueryClientProbe({ label, onClient }: { label: string; onClient?: (client: QueryClient) => void }) {
  const client = useQueryClient();
  onClient?.(client);
  providerEvents.push(client === expectedClient.current ? `${label}:shared` : `${label}:other`);
  return <span>{label}</span>;
}

describe("PluginProviders", () => {
  it("wraps auth first and media after auth with one shared query client", () => {
    const client = createPluginQueryClient();
    expectedClient.current = client;

    render(
      <PluginProviders media queryClient={client}>
        <QueryClientProbe label="child" />
      </PluginProviders>,
    );

    expect(providerEvents).toEqual(["auth:shared", "media:shared", "child:shared"]);
  });

  it("omits the media provider for auth-only islands", () => {
    const client = createPluginQueryClient();
    expectedClient.current = client;

    render(
      <PluginProviders queryClient={client}>
        <QueryClientProbe label="child" />
      </PluginProviders>,
    );

    expect(providerEvents).toEqual(["auth:shared", "child:shared"]);
  });

  it("wraps prompt islands after auth with one shared query client", () => {
    const client = createPluginQueryClient();
    expectedClient.current = client;

    render(
      <PluginProviders prompt queryClient={client}>
        <QueryClientProbe label="child" />
      </PluginProviders>,
    );

    expect(providerEvents).toEqual(["auth:shared", "prompt:shared", "child:shared"]);
  });

  it("wraps reparto islands after auth with one shared query client", () => {
    const client = createPluginQueryClient();
    expectedClient.current = client;

    render(
      <PluginProviders reparto queryClient={client}>
        <QueryClientProbe label="child" />
      </PluginProviders>,
    );

    expect(providerEvents).toEqual(["auth:shared", "reparto:shared", "child:shared"]);
  });

  it("wraps combined plugin islands with media before prompt before reparto inside auth", () => {
    const client = createPluginQueryClient();
    expectedClient.current = client;

    render(
      <PluginProviders media prompt reparto queryClient={client}>
        <QueryClientProbe label="child" />
      </PluginProviders>,
    );

    expect(providerEvents).toEqual([
      "auth:shared",
      "reparto:shared",
      "prompt:shared",
      "media:shared",
      "child:shared",
    ]);
  });

  it("creates a stable island query client across rerenders", () => {
    const clients: QueryClient[] = [];

    const { rerender } = render(
      <PluginProviders>
        <QueryClientProbe label="first" onClient={(client) => clients.push(client)} />
      </PluginProviders>,
    );

    rerender(
      <PluginProviders>
        <QueryClientProbe label="second" onClient={(client) => clients.push(client)} />
      </PluginProviders>,
    );

    expect(clients).toHaveLength(2);
    expect(clients[0]).toBe(clients[1]);
  });

  it("reuses the default query client across separate island mounts", () => {
    const clients: QueryClient[] = [];

    const first = render(
      <PluginProviders>
        <QueryClientProbe label="first" onClient={(client) => clients.push(client)} />
      </PluginProviders>,
    );
    first.unmount();

    render(
      <PluginProviders>
        <QueryClientProbe label="second" onClient={(client) => clients.push(client)} />
      </PluginProviders>,
    );

    expect(clients).toHaveLength(2);
    expect(clients[0]).toBe(clients[1]);
  });
});
