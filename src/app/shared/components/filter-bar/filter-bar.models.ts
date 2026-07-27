export type FilterFieldType =
  | 'search'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'daterange'
  | 'toggle';

export type FilterValue =
  | string
  | number
  | boolean
  | Date
  | Array<string | number>
  | [Date | null, Date | null]
  | null;

export interface FilterOption {
  label: string;
  value: string | number;
  icon?: string;
  disabled?: boolean;
}

export interface FilterField {
  key: string;
  type: FilterFieldType;
  label?: string;
  placeholder?: string;
  icon?: string;

  options?: FilterOption[];

  optionLabel?: string;
  optionValue?: string;

  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  visible?: boolean;

  advanced?: boolean;

  dateFormat?: string;
  minDate?: Date;
  maxDate?: Date;

  trueLabel?: string;
  falseLabel?: string;

  dataTestId?: string;
}

export type FilterState = Record<
  string,
  FilterValue
>;

export interface FilterChangeEvent {
  key: string;
  value: FilterValue;
  filters: FilterState;
}

export interface FilterApplyEvent {
  filters: FilterState;
  activeCount: number;
}