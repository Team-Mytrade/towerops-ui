export type BulkActionBarTone =
  | 'primary'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'secondary';

export interface BulkActionBarAction {
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

  requiresConfirmation?: boolean;
  confirmationTitle?: string;
  confirmationMessage?: string;

  dataTestId?: string;
}

export interface BulkActionBarActionEvent {
  action: BulkActionBarAction;
  selectedCount: number;
}

export interface BulkActionBarClearEvent {
  selectedCount: number;
}