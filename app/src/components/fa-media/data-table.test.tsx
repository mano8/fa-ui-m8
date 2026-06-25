import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import { afterEach, describe, expect, it } from "vitest";

import { DataTable } from "./data-table";

interface Row {
  name: string;
  role: string;
}

const columns: ColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "role", header: "Role" },
];

afterEach(() => cleanup());

describe("DataTable", () => {
  it("filters rows and paginates the current client-side data set", () => {
    render(
      <DataTable
        columns={columns}
        data={[
          { name: "Ada", role: "admin" },
          { name: "Bea", role: "editor" },
          { name: "Cid", role: "viewer" },
        ]}
        filterColumn="name"
        filterPlaceholder="Search names"
        pageSize={1}
      />,
    );

    const search = screen.getByRole("textbox", { name: "Search names" });
    expect(search).toBeTruthy();
    expect(screen.getByText("Ada")).toBeTruthy();
    expect(screen.getByText("Page 1 of 3")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Bea")).toBeTruthy();
    expect(screen.queryByText("Ada")).toBeNull();
    expect(screen.getByText("Page 2 of 3")).toBeTruthy();

    fireEvent.change(search, { target: { value: "Cid" } });
    expect(screen.getByText("Cid")).toBeTruthy();
    expect(screen.queryByText("Bea")).toBeNull();
    expect(screen.queryByRole("button", { name: "Previous" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
  });

  it("renders the empty state without the optional filter control", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        emptyMessage="Nothing here."
      />,
    );

    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.getByText("Nothing here.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
  });
});
