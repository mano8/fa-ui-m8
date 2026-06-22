import { render, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// happy-dom has no layout, so recharts' ResponsiveContainer warns about 0x0.
const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

import { ActivityBarChart } from "./activity-bar-chart";

afterEach(() => {
  cleanup();
  warnSpy.mockClear();
});

describe("ActivityBarChart", () => {
  it("renders a chart container with default labels", () => {
    const { container } = render(
      <ActivityBarChart
        data={[{ model: "user", added: 2, updated: 1 }]}
        className="h-64"
      />,
    );
    // ChartContainer renders a data-slot="chart" wrapper regardless of layout.
    expect(container.querySelector('[data-slot="chart"]')).not.toBeNull();
  });

  it("accepts custom series labels", () => {
    const { container } = render(
      <ActivityBarChart
        data={[]}
        addedLabel="Created"
        updatedLabel="Changed"
      />,
    );
    expect(container.querySelector('[data-slot="chart"]')).not.toBeNull();
  });
});
