export type EntityListValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined;

export type EntityListColumnType =
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'status'
  | 'code';

export type EntityListAlign =
  | 'left'
  | 'center'
  | 'right';

export type EntityListSortDirection =
  | 'asc'
  | 'desc';

export type EntityListSelectionMode =
  | 'none'
  | 'single'
  | 'multiple';

export interface EntityListColumn {
  id: string;
  label: string;

  field?: string;

  type?: EntityListColumnType;

  icon?: string;

  width?: string;
  minWidth?: string;

  align?: EntityListAlign;

  visible?: boolean;

  sortable?: boolean;
  mobileVisible?: boolean;

  dateFormat?: string;
  decimalPlaces?: number;

  emptyText?: string;

  valueResolver?: (
    row: EntityListRow
  ) => EntityListValue;
}

export interface EntityListStatus {
  value: string | boolean | null | undefined;

  label?: string;

  tone?:
    | 'primary'
    | 'success'
    | 'info'
    | 'warning'
    | 'danger'
    | 'secondary'
    | 'contrast';

  icon?: string;
  pulse?: boolean;
}

export interface EntityListRowAction {
  id: string;
  label: string;

  icon?: string;

  severity?:
    | 'secondary'
    | 'success'
    | 'info'
    | 'warn'
    | 'help'
    | 'danger'
    | 'contrast';

  outlined?: boolean;
  text?: boolean;

  visible?: boolean;
  disabled?: boolean;
  loading?: boolean;

  dataTestId?: string;
}

export interface EntityListRow {
  id: string | number;

  title?: string;
  subtitle?: string;
  code?: string;

  icon?: string;
  imageUrl?: string;

  status?: EntityListStatus;

  values?: Record<
    string,
    EntityListValue
  >;

  actions?: EntityListRowAction[];

  selectable?: boolean;
  disabled?: boolean;
  visible?: boolean;

  dataTestId?: string;

  source?: unknown;
}

export interface EntityListSort {
  columnId: string;
  direction: EntityListSortDirection;
}

export interface EntityListRowEvent {
  row: EntityListRow;
}

export interface EntityListActionEvent {
  row: EntityListRow;
  action: EntityListRowAction;
}

export interface EntityListSelectionEvent {
  selectedIds: Array<
    string | number
  >;

  selectedRows: EntityListRow[];
}

export interface EntityListSortEvent {
  sort: EntityListSort;
}

export interface EntityListLoadMoreEvent {
  currentCount: number;
}