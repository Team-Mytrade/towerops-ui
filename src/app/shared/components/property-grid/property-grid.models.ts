export type PropertyFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'tag'
  | 'link'
  | 'email'
  | 'phone'
  | 'currency'
  | 'custom';

export interface PropertyField {
  label: string;
  value: unknown;

  type?: PropertyFieldType;
  icon?: string;
  emptyValue?: string;

  copyable?: boolean;
  multiline?: boolean;

  trueLabel?: string;
  falseLabel?: string;

  severity?:
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'secondary';

  href?: string;

  formatter?: (
    value: unknown
  ) => string;
}