"use client";

import type { AssignmentProcessPublic } from "@mano8/astro-reparto-m8/schemas";

export interface RepartoProcessesTableLabels {
  academicYear: string;
  department: string;
  status: string;
  created: string;
  noResults: string;
  searchPlaceholder: string;
  loading: string;
}

const DEFAULT_LABELS: RepartoProcessesTableLabels = {
  academicYear: "Academic year",
  department: "Department",
  status: "Status",
  created: "Created",
  noResults: "No reparto processes found.",
  searchPlaceholder: "Filter processes...",
  loading: "Loading reparto processes...",
};

export interface RepartoProcessesTableProps {
  processes: AssignmentProcessPublic[];
  loading?: boolean;
  labels?: Partial<RepartoProcessesTableLabels>;
}

function formatStatus(status: AssignmentProcessPublic["status"]) {
  return status.replaceAll("_", " ");
}

export function RepartoProcessesTable({
  labels,
  loading = false,
  processes,
}: RepartoProcessesTableProps) {
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  if (loading) {
    return <p className="text-sm text-muted-foreground">{resolvedLabels.loading}</p>;
  }
  if (processes.length === 0) {
    return <p className="text-sm text-muted-foreground">{resolvedLabels.noResults}</p>;
  }
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/40 text-left">
          <tr>
            <th className="px-3 py-2 font-medium">{resolvedLabels.academicYear}</th>
            <th className="px-3 py-2 font-medium">{resolvedLabels.department}</th>
            <th className="px-3 py-2 font-medium">{resolvedLabels.status}</th>
            <th className="px-3 py-2 font-medium">{resolvedLabels.created}</th>
          </tr>
        </thead>
        <tbody>
          {processes.map((process) => (
            <tr key={process.id} className="border-t">
              <td className="px-3 py-2">{process.academic_year_id}</td>
              <td className="px-3 py-2">{process.department_id}</td>
              <td className="px-3 py-2 capitalize">{formatStatus(process.status)}</td>
              <td className="px-3 py-2">
                <time dateTime={process.created_at}>{process.created_at}</time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RepartoProcessesTable;
