import {
  DataTableColumn,
  DataTableFilterValue,
  DataTableFilters,
  DataTableSort
} from './data-table.models';

export function getNestedValue(
  source: unknown,
  path: string
): unknown {
  if (
    source === null ||
    source === undefined ||
    !path
  ) {
    return undefined;
  }

  return path
    .split('.')
    .reduce<unknown>((current, segment) => {
      if (
        current === null ||
        current === undefined ||
        typeof current !== 'object'
      ) {
        return undefined;
      }

      return (
        current as Record<string, unknown>
      )[segment];
    }, source);
}

export function resolveColumnValue<
  TRow extends object
>(
  row: TRow,
  column: DataTableColumn<TRow>
): unknown {
  if (column.valueGetter) {
    return column.valueGetter(
      row,
      column
    );
  }

  return getNestedValue(
    row,
    column.field
  );
}

export function normalizeSearchValue(
  value: unknown
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString().toLowerCase();
  }

  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
        .toLowerCase();
    } catch {
      return '';
    }
  }

  return String(value).toLowerCase();
}

export function matchesGlobalSearch<
  TRow extends object
>(
  row: TRow,
  columns: DataTableColumn<TRow>[],
  search: string
): boolean {
  const normalizedSearch =
    search.trim().toLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  return columns.some(column => {
    if (column.type === 'template') {
      return false;
    }

    const value = resolveColumnValue(
      row,
      column
    );

    return normalizeSearchValue(value)
      .includes(normalizedSearch);
  });
}

export function matchesColumnFilters<
  TRow extends object
>(
  row: TRow,
  columns: DataTableColumn<TRow>[],
  filters: DataTableFilters
): boolean {
  return Object.entries(filters).every(
    ([field, filterValue]) => {
      if (
        filterValue === null ||
        filterValue === undefined ||
        filterValue === ''
      ) {
        return true;
      }

      const column = columns.find(
        item =>
          (item.filterField ?? item.field) ===
            field ||
          item.field === field
      );

      if (!column) {
        return true;
      }

      const value = resolveColumnValue(
        row,
        column
      );

      return matchesFilterValue(
        value,
        filterValue,
        column.filterType ?? 'text'
      );
    }
  );
}

export function matchesFilterValue(
  value: unknown,
  filterValue: DataTableFilterValue,
  filterType:
    | 'text'
    | 'number'
    | 'select'
    | 'boolean'
): boolean {
  if (
    filterValue === null ||
    filterValue === undefined ||
    filterValue === ''
  ) {
    return true;
  }

  switch (filterType) {
    case 'boolean':
      return Boolean(value) ===
        Boolean(filterValue);

    case 'number': {
      const numericValue = Number(value);
      const numericFilter = Number(
        filterValue
      );

      return (
        Number.isFinite(numericValue) &&
        Number.isFinite(numericFilter) &&
        numericValue === numericFilter
      );
    }

    case 'select':
      return String(value) ===
        String(filterValue);

    case 'text':
    default:
      return normalizeSearchValue(value)
        .includes(
          normalizeSearchValue(
            filterValue
          )
        );
  }
}

export function sortRows<
  TRow extends object
>(
  rows: TRow[],
  columns: DataTableColumn<TRow>[],
  sort?: DataTableSort
): TRow[] {
  if (!sort) {
    return rows;
  }

  const column = columns.find(
    item =>
      (item.sortField ?? item.field) ===
        sort.field ||
      item.field === sort.field
  );

  if (!column) {
    return rows;
  }

  const direction =
    sort.direction === 'desc'
      ? -1
      : 1;

  return [...rows].sort(
    (first, second) => {
      const firstValue =
        resolveColumnValue(
          first,
          column
        );

      const secondValue =
        resolveColumnValue(
          second,
          column
        );

      return (
        compareValues(
          firstValue,
          secondValue
        ) * direction
      );
    }
  );
}

export function compareValues(
  first: unknown,
  second: unknown
): number {
  if (
    first === second
  ) {
    return 0;
  }

  if (
    first === null ||
    first === undefined
  ) {
    return -1;
  }

  if (
    second === null ||
    second === undefined
  ) {
    return 1;
  }

  if (
    typeof first === 'number' &&
    typeof second === 'number'
  ) {
    return first - second;
  }

  if (
    typeof first === 'boolean' &&
    typeof second === 'boolean'
  ) {
    return Number(first) -
      Number(second);
  }

  const firstDate =
    parseDateValue(first);

  const secondDate =
    parseDateValue(second);

  if (
    firstDate !== null &&
    secondDate !== null
  ) {
    return firstDate -
      secondDate;
  }

  return String(first).localeCompare(
    String(second),
    undefined,
    {
      numeric: true,
      sensitivity: 'base'
    }
  );
}

export function parseDateValue(
  value: unknown
): number | null {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (
    typeof value !== 'string'
  ) {
    return null;
  }

  const dateValue = Date.parse(value);

  return Number.isNaN(dateValue)
    ? null
    : dateValue;
}

export function sanitizeFilters(
  filters: DataTableFilters
): DataTableFilters {
  return Object.entries(filters).reduce<
    DataTableFilters
  >(
    (result, [key, value]) => {
      if (
        value !== null &&
        value !== undefined &&
        value !== ''
      ) {
        result[key] = value;
      }

      return result;
    },
    {}
  );
}

export function paginateRows<
  TRow
>(
  rows: TRow[],
  first: number,
  size: number
): TRow[] {
  if (size <= 0) {
    return rows;
  }

  return rows.slice(
    first,
    first + size
  );
}