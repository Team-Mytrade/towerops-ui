export type ColumnManagerAlign =
  | 'left'
  | 'center'
  | 'right';

export interface ColumnManagerItem {
  key: string;
  label: string;

  description?: string;
  icon?: string;

  visible: boolean;
  defaultVisible?: boolean;

  locked?: boolean;
  disabled?: boolean;
  required?: boolean;

  width?: number | null;
  minimumWidth?: number;
  maximumWidth?: number;

  align?: ColumnManagerAlign;

  order?: number;
  group?: string;
}

export interface ColumnManagerChangeEvent {
  columns: ColumnManagerItem[];
  visibleColumnKeys: string[];
  hiddenColumnKeys: string[];
  orderedColumnKeys: string[];
  dirty: boolean;
}

export interface ColumnManagerVisibilityEvent {
  column: ColumnManagerItem;
  columnKey: string;
  visible: boolean;
}

export interface ColumnManagerOrderEvent {
  column: ColumnManagerItem;
  columnKey: string;
  previousIndex: number;
  currentIndex: number;
  columns: ColumnManagerItem[];
}

export interface ColumnManagerWidthEvent {
  column: ColumnManagerItem;
  columnKey: string;
  width: number | null;
}

export interface ColumnManagerResetEvent {
  columns: ColumnManagerItem[];
}

export interface ColumnManagerApplyEvent {
  columns: ColumnManagerItem[];
  visibleColumnKeys: string[];
  orderedColumnKeys: string[];
}