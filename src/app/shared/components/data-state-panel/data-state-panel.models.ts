export type DataStateType =
  | 'loading'
  | 'empty'
  | 'error'
  | 'offline'
  | 'forbidden'
  | 'not-found'
  | 'success'
  | 'custom';

export type DataStateTone =
  | 'primary'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'secondary';

export type DataStateSize =
  | 'compact'
  | 'default'
  | 'large';

export interface DataStateAction {
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

export interface DataStateActionEvent {
  action: DataStateAction;
}