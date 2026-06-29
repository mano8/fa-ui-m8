import { render, screen, cleanup, fireEvent, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { MediaMaintenanceLabels } from "./media-maintenance-panel";

const { useMediaAdminMock } = vi.hoisted(() => ({ useMediaAdminMock: vi.fn() }));
vi.mock("@fa-m8/astro-media-m8/hooks", () => ({ useMediaAdmin: useMediaAdminMock }));

import { MediaMaintenancePanel } from "./media-maintenance-panel";

const labels: MediaMaintenanceLabels = {
  title: "Maintenance",
  subtitle: "Destructive ops.",
  confirmTitle: "Are you sure?",
  cancel: "Cancel",
  confirm: "Run it",
  running: "Running...",
  done: "Done.",
  error: "Operation failed.",
  purgeStaleTitle: "Purge stale uploads",
  purgeStaleDescription: "Purge stale.",
  repairTitle: "Repair orphans",
  repairDescription: "Repair.",
  purgeExpiredTitle: "Purge expired (retention)",
  purgeExpiredDescription: "Purge expired.",
};

function hook(overrides = {}) {
  return {
    allowed: true,
    loading: false,
    purgeStale: vi.fn().mockResolvedValue({ purged: 0 }),
    repair: vi.fn().mockResolvedValue({}),
    purgeExpiredObjects: vi.fn().mockResolvedValue({ purged: 0 }),
    ...overrides,
  };
}

afterEach(() => cleanup());
beforeEach(() => useMediaAdminMock.mockReset().mockReturnValue(hook()));

describe("MediaMaintenancePanel", () => {
  it("renders the three destructive operations", () => {
    render(<MediaMaintenancePanel labels={labels} />);
    expect(screen.getByText(labels.purgeStaleTitle)).toBeTruthy();
    expect(screen.getByText(labels.repairTitle)).toBeTruthy();
    expect(screen.getByText(labels.purgeExpiredTitle)).toBeTruthy();
  });

  it("disables destructive actions until media admin permission is allowed", () => {
    useMediaAdminMock.mockReturnValue(hook({ allowed: false }));
    render(<MediaMaintenancePanel labels={labels} />);

    for (const trigger of screen.getAllByRole("button", { name: labels.confirm })) {
      expect((trigger as HTMLButtonElement).disabled).toBe(true);
    }
  });

  it("runs purge-stale only after the alert-dialog is confirmed", async () => {
    const purgeStale = vi.fn().mockResolvedValue({ purged: 2 });
    useMediaAdminMock.mockReturnValue(hook({ purgeStale }));
    render(<MediaMaintenancePanel labels={labels} />);

    // The first trigger is purge-stale; no request fires until confirmation.
    const triggers = screen.getAllByRole("button", { name: labels.confirm });
    fireEvent.click(triggers[0]);
    expect(purgeStale).not.toHaveBeenCalled();

    const dialog = await screen.findByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: labels.confirm }));
    await waitFor(() => expect(purgeStale).toHaveBeenCalledOnce());
    expect(await screen.findByText(labels.done)).toBeTruthy();
  });

  it("repairs orphans with confirm=true after confirmation", async () => {
    const repair = vi.fn().mockResolvedValue({});
    useMediaAdminMock.mockReturnValue(hook({ repair }));
    render(<MediaMaintenancePanel labels={labels} />);

    const triggers = screen.getAllByRole("button", { name: labels.confirm });
    fireEvent.click(triggers[1]); // repair is the second action
    const dialog = await screen.findByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: labels.confirm }));
    await waitFor(() => expect(repair).toHaveBeenCalledWith(true));
  });

  it("surfaces an error when an operation rejects", async () => {
    const purgeExpiredObjects = vi.fn().mockRejectedValue(new Error("nope"));
    useMediaAdminMock.mockReturnValue(hook({ purgeExpiredObjects }));
    render(<MediaMaintenancePanel labels={labels} />);

    const triggers = screen.getAllByRole("button", { name: labels.confirm });
    fireEvent.click(triggers[2]); // purge-expired is the third action
    const dialog = await screen.findByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: labels.confirm }));
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toContain("nope");
  });
});
