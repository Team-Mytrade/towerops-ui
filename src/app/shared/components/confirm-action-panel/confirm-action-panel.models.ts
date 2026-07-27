export type ConfirmActionTone =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'secondary';

export interface ConfirmActionPayload {
  value: string;
}

export interface ConfirmActionOption {
  label: string;
  value: string;
}