import { describe, expect, it } from "vitest";

import { getDataTableApiLabels } from "./data-table-labels";

describe("getDataTableApiLabels", () => {
  it("maps English Astro/Starlight app translations to DataTableApi labels", () => {
    const labels = getDataTableApiLabels("en");

    expect(labels.searchLabel).toBe("Search");
    expect(labels.columnVisibilityLabel("Status")).toBe("Toggle Status");
    expect(labels.pageSummary(2, 5)).toBe("Page 2 of 5");
    expect(labels.rowsSummary(11, 20, 42)).toBe("11-20 of 42");
  });

  it("maps French Astro/Starlight app translations to DataTableApi labels", () => {
    const labels = getDataTableApiLabels("fr");

    expect(labels.searchLabel).toBe("Rechercher");
    expect(labels.previousPage).toBe("Page précédente");
    expect(labels.columnVisibilityLabel("Statut")).toBe("Basculer Statut");
    expect(labels.pageSummary(2, 5)).toBe("Page 2 sur 5");
    expect(labels.rowsSummary(11, 20, 42)).toBe("11-20 sur 42");
  });

  it("maps Spanish Astro/Starlight app translations to DataTableApi labels", () => {
    const labels = getDataTableApiLabels("es");

    expect(labels.searchLabel).toBe("Buscar");
    expect(labels.nextPage).toBe("Página siguiente");
    expect(labels.columnVisibilityLabel("Estado")).toBe("Alternar Estado");
    expect(labels.pageSummary(2, 5)).toBe("Página 2 de 5");
    expect(labels.rowsSummary(11, 20, 42)).toBe("11-20 de 42");
  });
});
