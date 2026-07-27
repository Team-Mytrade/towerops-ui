export type EmptyStateTone =
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'secondary';

export interface EmptyStateAction {
  id: string;
  label: string;

  icon?: string;

  severity?:
    | 'secondary'
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'contrast';

  outlined?: boolean;
  text?: boolean;

  disabled?: boolean;
  loading?: boolean;
  visible?: boolean;

  dataTestId?: string;
}