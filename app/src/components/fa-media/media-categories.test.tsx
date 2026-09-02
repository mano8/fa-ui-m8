import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CategoryNode } from "@mano8/astro-media-m8/schemas";

const categoryHook = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  tree: [] as CategoryNode[],
}));

vi.mock("@mano8/astro-media-m8/hooks", () => ({
  useCategoryTree: () => ({
    tree: categoryHook.tree,
    count: categoryHook.tree.length,
    loading: false,
    error: null,
    create: categoryHook.create,
    update: categoryHook.update,
    remove: categoryHook.remove,
  }),
}));

import { MediaCategories } from "./media-categories";

function node(
  id: number,
  name: string,
  children: CategoryNode[] = [],
  parentId: number | null = null,
  objectCount = 0,
): CategoryNode {
  return {
    id,
    owner_id: "22222222-2222-4222-8222-222222222222",
    tenant_id: null,
    name,
    slug: name.toLocaleLowerCase().replaceAll(" ", "-"),
    parent_id: parentId,
    object_count: objectCount,
    total_object_count: objectCount + children.reduce((sum, child) => sum + child.total_object_count, 0),
    children,
  };
}

beforeEach(() => {
  categoryHook.create.mockReset().mockResolvedValue({});
  categoryHook.update.mockReset().mockResolvedValue({});
  categoryHook.remove.mockReset().mockResolvedValue(undefined);
  categoryHook.tree = [
    node(1, "Documents", [node(2, "Invoices", [], 1, 3)], null, 1),
    node(3, "Images", [], null, 2),
  ];
});

afterEach(() => cleanup());

describe("MediaCategories", () => {
  it("renders a searchable shadcn table with hierarchy controls and column selection", () => {
    render(<MediaCategories />);

    expect(screen.getByRole("heading", { name: "Categories" })).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "Search categories" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Hierarchy" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Columns" })).toBeTruthy();
    expect(screen.getAllByText("Documents").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Invoices").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Documents / Invoices").length).toBeGreaterThan(0);
    expect(screen.getByLabelText("Documents / Invoices").parentElement?.getAttribute("data-category-depth")).toBe("2");
    expect(screen.getByLabelText("Documents / Invoices").parentElement?.getAttribute("style")).toContain("1.25rem");

    fireEvent.change(screen.getByRole("textbox", { name: "Search categories" }), {
      target: { value: "Invoices" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Search categories/ }));

    expect(screen.getByText("Invoices")).toBeTruthy();
    expect(screen.queryByText("Images")).toBeNull();
  });

  it("opens the translated add dialog and creates a category through the plugin hook", async () => {
    render(
      <MediaCategories
        labels={{
          add: "Ajouter une catégorie",
          addTitle: "Nouvelle catégorie",
          name: "Nom",
          save: "Enregistrer",
          cancel: "Annuler",
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Ajouter une catégorie" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Nouvelle catégorie" })).toBeTruthy();

    const nameInput = screen.getByRole("textbox", { name: "Nom" });
    fireEvent.change(nameInput, {
      target: { value: "C" },
    });
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(nameInput.getAttribute("value")).toBe("C");

    fireEvent.change(nameInput, { target: { value: "Contrats" } });
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(document.querySelector("table")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    await waitFor(() => expect(categoryHook.create).toHaveBeenCalledWith({ name: "Contrats", parent_id: null }));
  });

  it("opens row edit and delete actions backed by plugin mutations", async () => {
    render(<MediaCategories />);

    fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]!);
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
      target: { value: "Documents 2026" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(categoryHook.update).toHaveBeenCalledWith(1, {
        name: "Documents 2026",
        parent_id: null,
      }),
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]!);
    expect(screen.getByText("Delete category?")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Delete category" }));

    await waitFor(() => expect(categoryHook.remove).toHaveBeenCalledWith(1));
  });
});
