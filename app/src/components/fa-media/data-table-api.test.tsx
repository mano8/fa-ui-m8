import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DataTableApi } from "./data-table-api";

type Row = { id: string; name: string; size_bytes: number };

const columns: ColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "size_bytes", header: "Size" },
];

afterEach(() => cleanup());

describe("DataTableApi", () => {
  it("emits search, page size, page, and sort changes without fetching", () => {
    const onSearchChange = vi.fn();
    const onPageSizeChange = vi.fn();
    const onPageChange = vi.fn();
    const onSortChange = vi.fn();

    render(
      <DataTableApi
        columns={columns}
        data={[{ id: "r1", name: "One", size_bytes: 12 }]}
        rowCount={30}
        page={1}
        pageSize={10}
        sortBy="size_bytes"
        sortDir="desc"
        onSearchChange={onSearchChange}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onSortChange={onSortChange}
      />,
    );

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "avatar" } });
    fireEvent.change(screen.getByLabelText("Rows"), { target: { value: "25" } });
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("Size"));

    expect(onSearchChange).toHaveBeenCalledWith("avatar");
    expect(onPageSizeChange).toHaveBeenCalledWith(25);
    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(onSortChange).toHaveBeenCalledWith("size_bytes", "asc");
  });

  it("renders loading, empty, filter, and localized labels", () => {
    const onFilterChange = vi.fn();
    const { rerender } = render(
      <DataTableApi
        columns={columns}
        data={[]}
        rowCount={0}
        loading
        page={1}
        pageSize={10}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        filterValue=""
        filterOptions={[{ value: "asset", label: "Asset" }]}
        onFilterChange={onFilterChange}
        labels={{
          filterLabel: "Type",
          allFilterOption: "All types",
          loading: "Loading rows",
          empty: "Nothing here",
        }}
      />,
    );

    expect(screen.getByText("Loading rows")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Type"), { target: { value: "asset" } });
    expect(onFilterChange).toHaveBeenCalledWith("asset");

    rerender(
      <DataTableApi
        columns={columns}
        data={[]}
        rowCount={0}
        page={1}
        pageSize={10}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        labels={{ empty: "Nothing here" }}
      />,
    );
    expect(screen.getByText("Nothing here")).toBeTruthy();
  });
});
