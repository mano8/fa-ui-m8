import { getTranslations, type Locale } from "@/content/i18n/app";

import type { DataTableApiLabels } from "./data-table-api";

function formatTemplate(
  template: string,
  values: Record<string, string | number>,
): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

export function getDataTableApiLabels(locale: Locale): DataTableApiLabels {
  const labels = getTranslations(locale).media.table;

  return {
    searchLabel: labels.searchLabel,
    searchPlaceholder: labels.searchPlaceholder,
    filterLabel: labels.filterLabel,
    filterPlaceholder: labels.filterPlaceholder,
    loadingMessage: labels.loadingMessage,
    emptyMessage: labels.emptyMessage,
    pageSizeLabel: labels.pageSizeLabel,
    previousPage: labels.previousPage,
    nextPage: labels.nextPage,
    columnsLabel: labels.columnsLabel,
    columnVisibilityLabel: (column) =>
      formatTemplate(labels.columnVisibilityLabel, { column }),
    sortAscending: labels.sortAscending,
    sortDescending: labels.sortDescending,
    clearSort: labels.clearSort,
    pageSummary: (page, pageCount) =>
      formatTemplate(labels.pageSummary, { page, pageCount }),
    rowsSummary: (from, to, rowCount) =>
      formatTemplate(labels.rowsSummary, { from, to, rowCount }),
  };
}
