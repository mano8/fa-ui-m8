import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { DashboardOverviewLabels } from "./dashboard-overview";

const { useDashboardMock } = vi.hoisted(() => ({ useDashboardMock: vi.fn() }));
vi.mock("@fa-m8/astro-auth-m8/hooks", () => ({ useDashboard: useDashboardMock }));

// recharts' ResponsiveContainer measures its parent; happy-dom reports 0x0 and
// logs a benign warning. Silence it so the chart branch can be asserted cleanly.
const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

import { DashboardOverview } from "./dashboard-overview";

const labels: DashboardOverviewLabels = {
  title: "Overview",
  subtitle: "Activity at a glance.",
  users: "Users",
  totalAdded: "Total added",
  totalUpdated: "Total updated",
  activityTitle: "Activity by model",
  added: "Added",
  updated: "Updated",
  empty: "No activity recorded yet.",
  error: "Could not load dashboard activity.",
};

function activity(counters: { model: string; added: number; updated: number }[], nb_users = 0) {
  return { nb_users, activity: { min: 0, max: 0, activity: counters } };
}

afterEach(() => cleanup());
beforeEach(() => useDashboardMock.mockReset());

describe("DashboardOverview", () => {
  it("renders a skeleton while loading (default labels)", () => {
    useDashboardMock.mockReturnValue({ activity: null, loading: true, error: null });
    const { container } = render(<DashboardOverview />);
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(useDashboardMock).toHaveBeenCalledWith("me");
  });

  it("renders an error alert on failure", () => {
    useDashboardMock.mockReturnValue({ activity: null, loading: false, error: new Error("boom") });
    render(<DashboardOverview labels={labels} />);
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain(labels.error);
  });

  it("renders the empty state with zero-fallback stats when there is no activity", () => {
    useDashboardMock.mockReturnValue({ activity: null, loading: false, error: null });
    render(<DashboardOverview labels={labels} />);
    expect(screen.getByText(labels.empty)).toBeTruthy();
    // users + added + updated all fall back to 0 when activity is null.
    expect(screen.getAllByText("0")).toHaveLength(3);
  });

  it("sums per-model totals and renders the chart when activity exists", () => {
    useDashboardMock.mockReturnValue({
      loading: false,
      error: null,
      activity: activity(
        [
          { model: "user", added: 3, updated: 2 },
          { model: "session", added: 4, updated: 6 },
        ],
        9,
      ),
    });
    render(<DashboardOverview scope="global" labels={labels} />);
    expect(useDashboardMock).toHaveBeenCalledWith("global");
    expect(screen.getByText("9")).toBeTruthy(); // users
    expect(screen.getByText("7")).toBeTruthy(); // total added (3+4)
    expect(screen.getByText("8")).toBeTruthy(); // total updated (2+6)
    expect(screen.getByText(labels.activityTitle)).toBeTruthy();
    expect(screen.queryByText(labels.empty)).toBeNull();
  });
});

afterEach(() => warnSpy.mockClear());
