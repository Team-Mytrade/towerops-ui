import { TemplateRef } from '@angular/core';

export type DataTableValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined;

export type DataTableColumnType =
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'tag'
  | 'template';

export type DataTableFilterType =
  | 'text'
  | 'number'
  | 'select'
  | 'boolean';

export type DataTableAlignment =
  | 'left'
  | 'center'
  | 'right';

export type DataTableSelectionMode =
  | 'none'
  | 'single'
  | 'multiple';

export type DataTableSortDirection =
  | 'asc'
  | 'desc';

export interface DataTableSelectOption<
  TValue = DataTableValue
> {
  label: string;
  value: TValue;
}

export interface DataTableTagConfig {
  severityMap?: Record<
    string,
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'contrast'
  >;

  labelMap?: Record<string, string>;

  defaultSeverity?:
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'contrast';
}

export interface DataTableColumn<
  TRow extends object = Record<string, unknown>
> {
  /**
   * Supports nested paths:
   * site.name
   * customer.address.city
   */
  field: string;

  header: string;

  type?: DataTableColumnType;

  /**
   * Optional server-side field when it differs from field.
   */
  sortField?: string;

  /**
   * Optional server-side filter field when it differs from field.
   */
  filterField?: string;

  sortable?: boolean;
  filterable?: boolean;

  filterType?: DataTableFilterType;
  filterPlaceholder?: string;
  filterOptions?: DataTableSelectOption[];

  width?: string;
  minWidth?: string;
  maxWidth?: string;

  align?: DataTableAlignment;

  visible?: boolean;

  dateFormat?: string;
  numberDigits?: string;

  trueLabel?: string;
  falseLabel?: string;
  emptyValue?: string;

  tag?: DataTableTagConfig;

  /**
   * Optional direct template configuration.
   *
   * Content templates named cell-{field} are also supported.
   */
  template?: TemplateRef<{
    $implicit: TRow;
    row: TRow;
    column: DataTableColumn<TRow>;
    value: unknown;
    rowIndex: number;
  }>;

  /**
   * Optional custom value resolver.
   */
  valueGetter?: (
    row: TRow,
    column: DataTableColumn<TRow>
  ) => unknown;

  /**
   * Optional custom display formatter.
   */
  formatter?: (
    value: unknown,
    row: TRow,
    column: DataTableColumn<TRow>
  ) => string;

  /**
   * Enables text wrapping for the column.
   */
  wrap?: boolean;

  /**
   * Prevents this column from being hidden.
   */
  locked?: boolean;

  /**
   * Optional CSS class for the column.
   */
  className?: string;
}

export interface DataTableSort {
  field: string;
  direction: DataTableSortDirection;
}

export type DataTableFilterValue =
  | string
  | number
  | boolean
  | null;

export type DataTableFilters = Record<
  string,
  DataTableFilterValue
>;

export interface DataTableLazyEvent {
  page: number;
  size: number;
  first: number;

  sort?: DataTableSort;

  globalSearch?: string;

  filters: DataTableFilters;
}

export interface DataTablePageChangeEvent {
  page: number;
  size: number;
  first: number;
}

export interface DataTableColumnVisibilityEvent {
  field: string;
  visible: boolean;
}

export interface DataTableState {
  page: number;
  size: number;
  first: number;

  sort?: DataTableSort;

  globalSearch: string;

  filters: DataTableFilters;
}

export interface DataTableCellContext<
  TRow extends object
> {
  $implicit: TRow;
  row: TRow;
  column: DataTableColumn<TRow>;
  value: unknown;
  rowIndex: number;
}