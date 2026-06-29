export type SortOrder = "asc" | "desc";

export type ListParams<TSort extends string = string> = {
  page: number;
  pageSize: number;
  q: string;
  sort: TSort;
  order: SortOrder;
};

type ListSchema<TSort extends string> = {
  allowedSorts: readonly TSort[];
  allowedPageSizes: readonly number[];
  defaultSort: TSort;
  defaultOrder: SortOrder;
  defaultPage: number;
  defaultPageSize: number;
};

type ListInput<TSort extends string> = Partial<ListParams<TSort>> | URLSearchParams;

export function makeListSchema<TSort extends string>(schema: ListSchema<TSort>): ListSchema<TSort> {
  return schema;
}

function readValue<TSort extends string>(
  source: ListInput<TSort>,
  key: keyof ListParams<TSort>,
): string | number | undefined {
  if (source instanceof URLSearchParams) return source.get(String(key)) ?? undefined;
  return source[key];
}

function toPositiveInteger(value: string | number | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function mergeAndNormalize<TSort extends string>(
  schema: ListSchema<TSort>,
  defaults: ListParams<TSort>,
  source: ListInput<TSort>,
): ListParams<TSort> {
  const page = toPositiveInteger(readValue(source, "page"), defaults.page ?? schema.defaultPage);
  const requestedPageSize = toPositiveInteger(
    readValue(source, "pageSize"),
    defaults.pageSize ?? schema.defaultPageSize,
  );
  const sortValue = String(readValue(source, "sort") ?? defaults.sort ?? schema.defaultSort) as TSort;
  const orderValue = String(readValue(source, "order") ?? defaults.order ?? schema.defaultOrder);

  return {
    page,
    pageSize: schema.allowedPageSizes.includes(requestedPageSize)
      ? requestedPageSize
      : defaults.pageSize ?? schema.defaultPageSize,
    q: String(readValue(source, "q") ?? defaults.q ?? ""),
    sort: schema.allowedSorts.includes(sortValue) ? sortValue : defaults.sort ?? schema.defaultSort,
    order: orderValue === "desc" ? "desc" : "asc",
  };
}

export function stringifyListUrlParams<TSort extends string>(
  params: ListParams<TSort>,
): Record<string, string> {
  return {
    page: String(params.page),
    pageSize: String(params.pageSize),
    q: params.q,
    sort: params.sort,
    order: params.order,
  };
}
