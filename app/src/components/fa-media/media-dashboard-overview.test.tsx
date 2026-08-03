import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { MediaDashboardOverviewLabels } from "./media-dashboard-overview";

const { useMediaAdminMock } = vi.hoisted(() => ({ useMediaAdminMock: vi.fn() }));
vi.mock("@mano8/astro-media-m8/hooks", () => ({ useMediaAdmin: useMediaAdminMock }));

// recharts' ResponsiveContainer measures its parent; happy-dom reports 0x0 and
// logs a benign warning. Silence it so the chart branch can be asserted cleanly.
const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

import { MediaDashboardOverview } from "./media-dashboard-overview";

const labels: MediaDashboardOverviewLabels = {
  title: "Overview",
  subtitle: "At a glance.",
  totalObjects: "Objects",
  totalBytes: "Storage used",
  deletedObjects: "Deleted",
  staleSessions: "Stale uploads",
  dbOrphans: "DB orphans",
  storageOrphans: "Storage orphans",
  storageByCategory: "Storage by category",
  storageEmpty: "No stored objects yet.",
  subscriptionsTitle: "Webhook subscriptions",
  subUrl: "Endpoint",
  subEvents: "Events",
  subStatus: "Status",
  subActive: "Active",
  subInactive: "Inactive",
  subActions: "Actions",
  subDelete: "Delete",
  subEmpty: "No webhook subscriptions.",
  error: "Could not load admin data.",
};

function hook(overrides = {}) {
  return {
    allowed: true,
    stats: null,
    stale: null,
    orphans: null,
    subscriptions: null,
    loading: false,
    error: null,
    loadStats: vi.fn().mockResolvedValue(undefined),
    loadStale: vi.fn().mockResolvedValue(undefined),
    loadOrphans: vi.fn().mockResolvedValue(undefined),
    loadSubscriptions: vi.fn().mockResolvedValue(undefined),
    removeSubscription: vi.fn().mockResolvedValue(undefined),
    purgeStale: vi.fn(),
    repair: vi.fn(),
    purgeExpiredObjects: vi.fn(),
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
  warnSpy.mockClear();
});
beforeEach(() => useMediaAdminMock.mockReset());

describe("MediaDashboardOverview", () => {
  it("loads all admin data on mount", async () => {
    const h = hook();
    useMediaAdminMock.mockReturnValue(h);
    render(<MediaDashboardOverview labels={labels} />);
    await waitFor(() => expect(screen.getByText("Overview")).toBeTruthy());
    expect(h.loadStats).toHaveBeenCalledOnce();
    expect(h.loadStale).toHaveBeenCalledOnce();
    expect(h.loadOrphans).toHaveBeenCalledOnce();
    expect(h.loadSubscriptions).toHaveBeenCalledOnce();
  });

  it("renders humanized storage stats and the chart when data exists", async () => {
    useMediaAdminMock.mockReturnValue(
      hook({
        stats: {
          total_objects: 42,
          total_bytes: 5 * 1024 * 1024,
          deleted_objects: 3,
          by_status: [],
          by_category: [{ category: "image", count: 10, total_bytes: 2048 }],
          usage: [],
        },
        stale: { count: 7, sessions: [] },
        orphans: {
          db_orphans: [],
          storage_orphans: [],
          db_orphan_count: 1,
          storage_orphan_count: 2,
          repaired: 0,
        },
        subscriptions: { count: 0, items: [] },
      }),
    );
    render(<MediaDashboardOverview labels={labels} />);
    await waitFor(() => expect(screen.getByText("42")).toBeTruthy()); // objects
    expect(screen.getByText("5.0 MB")).toBeTruthy(); // humanized bytes
    expect(screen.getByText("7")).toBeTruthy(); // stale
    expect(screen.getByText(labels.storageByCategory)).toBeTruthy();
    expect(screen.queryByText(labels.storageEmpty)).toBeNull();
  });

  it("shows the empty storage state and a subscriptions row with a delete action", async () => {
    const removeSubscription = vi.fn().mockResolvedValue(undefined);
    useMediaAdminMock.mockReturnValue(
      hook({
        stats: {
          total_objects: 0,
          total_bytes: 0,
          deleted_objects: 0,
          by_status: [],
          by_category: [],
          usage: [],
        },
        subscriptions: {
          count: 1,
          items: [
            { id: "s1", url: "https://hook.example/m", event_types: ["object.created"], active: true, created_at: "2026-06-22T00:00:00Z" },
          ],
        },
        removeSubscription,
      }),
    );
    render(<MediaDashboardOverview labels={labels} />);
    await waitFor(() => expect(screen.getByText(labels.storageEmpty)).toBeTruthy());
    expect(screen.getByText("https://hook.example/m")).toBeTruthy();
    screen.getByText(labels.subDelete).click();
    expect(removeSubscription).toHaveBeenCalledWith("s1");
  });

  it("renders an error alert when loading fails with no stats", async () => {
    useMediaAdminMock.mockReturnValue(hook({ error: new Error("boom"), stats: null }));
    render(<MediaDashboardOverview labels={labels} />);
    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    expect(screen.getByRole("alert").textContent).toContain(labels.error);
  });
});
