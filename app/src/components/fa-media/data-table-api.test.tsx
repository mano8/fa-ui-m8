import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DataTableApi } from "./data-table-api";

interface Row {
  name: string;
  role: string;
}

const columns: ColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "role", header: "Role" },
];

const rows: Row[] = [
  { name: "Ada", role: "admin" },
  { name: "Bea", role: "editor" },
];

afterEach(() => cleanup());

describe("DataTableApi", () => {
  it("renders controlled data, toolbar action, search, filter, and summaries", () => {
    const onSearchChange = vi.fn();
    const onFilterChange = vi.fn();

    render(
      <DataTableApi
        columns={columns}
        data={rows}
        page={2}
        pageSize={2}
        rowCount={6}
        q="ad"
        filterValue="active"
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        onSearchChange={onSearchChange}
        onFilterChange={onFilterChange}
        toolbarAction={<button type="button">Add object</button>}
      />,
    );

    expect(screen.getByText("Ada")).toBeTruthy();
    expect(screen.getByText("Bea")).toBeTruthy();
    expect(screen.getByText("3-4 of 6")).toBeTruthy();
    expect(screen.getByText("Page 2 of 3")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Add object" })).toBeTruthy();

    fireEvent.change(screen.getByRole("textbox", { name: "Search" }), {
      target: { value: "bea" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Filter" }), {
      target: { value: "archived" },
    });

    expect(onSearchChange).toHaveBeenCalledWith("bea");
    expect(onFilterChange).toHaveBeenCalledWith("archived");
  });

  it("emits page and page-size changes without mutating data locally", () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();

    render(
      <DataTableApi
        columns={columns}
        data={rows}
        page={1}
        pageSize={2}
        rowCount={5}
        pageSizeOptions={[1, 5]}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Rows per page" }), {
      target: { value: "5" },
    });

    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(onPageSizeChange).toHaveBeenCalledWith(5);
    expect(screen.getByText("Ada")).toBeTruthy();
    expect(screen.getByText("Bea")).toBeTruthy();
  });

  it("emits controlled sorting changes and reflects the current sort direction", () => {
    const onSortChange = vi.fn();
    const { rerender } = render(
      <DataTableApi
        columns={columns}
        data={rows}
        page={1}
        pageSize={10}
        rowCount={2}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        onSortChange={onSortChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Name/ }));
    expect(onSortChange).toHaveBeenLastCalledWith("name", "asc");

    rerender(
      <DataTableApi
        columns={columns}
        data={rows}
        page={1}
        pageSize={10}
        rowCount={2}
        sortBy="name"
        sortDir="asc"
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        onSortChange={onSortChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Name/ }));
    expect(onSortChange).toHaveBeenLastCalledWith("name", "desc");
  });

  it("toggles column visibility through the view options support block", () => {
    render(
      <DataTableApi
        columns={columns}
        data={rows}
        page={1}
        pageSize={10}
        rowCount={2}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("columnheader", { name: /Role/ })).toBeTruthy();
    expect(screen.getByText("admin")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Columns" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Toggle Role" }));

    expect(screen.queryByRole("columnheader", { name: /Role/ })).toBeNull();
    expect(screen.queryByText("admin")).toBeNull();
    expect(screen.getByText("Ada")).toBeTruthy();
  });

  it("uses label overrides for support block controls", () => {
    render(
      <DataTableApi
        columns={columns}
        data={rows}
        page={1}
        pageSize={10}
        rowCount={2}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        labels={{
          columnsLabel: "Colonnes",
          columnVisibilityLabel: (column) => `Basculer ${column}`,
          previousPage: "Page precedente",
          nextPage: "Page suivante",
        }}
      />,
    );

    expect(screen.getByRole("button", { name: "Colonnes" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Colonnes" }));
    expect(screen.getByRole("checkbox", { name: "Basculer Name" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Page precedente" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Page suivante" })).toBeTruthy();
  });

  it("renders loading and empty states from controlled inputs", () => {
    const { rerender } = render(
      <DataTableApi
        columns={columns}
        data={[]}
        page={1}
        pageSize={10}
        rowCount={0}
        loading
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Loading...")).toBeTruthy();
    expect(screen.getByText("0-0 of 0")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Previous page" }).hasAttribute("disabled"),
    ).toBe(true);
    expect(
      screen.getByRole("button", { name: "Next page" }).hasAttribute("disabled"),
    ).toBe(true);

    rerender(
      <DataTableApi
        columns={columns}
        data={[]}
        page={1}
        pageSize={10}
        rowCount={0}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        labels={{ emptyMessage: "Nothing found." }}
      />,
    );

    expect(screen.getByText("Nothing found.")).toBeTruthy();
  });
});
