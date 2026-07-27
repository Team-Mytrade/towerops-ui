export interface RecordNavigatorItem {
  id: string | number;
  label: string;
  subtitle?: string;
  code?: string;
  icon?: string;
  disabled?: boolean;
}

export interface RecordNavigatorChangeEvent {
  previousItemId: string | number | null;
  itemId: string | number;
  item: RecordNavigatorItem;
  index: number;
  total: number;
  direction:
    | 'previous'
    | 'next'
    | 'first'
    | 'last'
    | 'select';
}

export interface RecordNavigatorBackEvent {
  currentItemId: string | number | null;
}

export interface RecordNavigatorRefreshEvent {
  currentItemId: string | number | null;
}