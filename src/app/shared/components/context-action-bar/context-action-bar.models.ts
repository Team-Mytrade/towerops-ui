export type ContextActionBarTone =
  | 'default'
  | 'primary'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger';

export type ContextActionBarPlacement =
  | 'inline'
  | 'sticky-top'
  | 'sticky-bottom'
  | 'floating-bottom';

export type ContextActionBarSeverity =
  | 'secondary'
  | 'success'
  | 'info'
  | 'warn'
  | 'help'
  | 'danger'
  | 'contrast';

export interface ContextActionBarAction {
  id: string;
  label: string;

  icon?: string;
  tooltip?: string;

  severity?: ContextActionBarSeverity;

  visible?: boolean;
  disabled?: boolean;
  loading?: boolean;

  outlined?: boolean;
  text?: boolean;
  rounded?: boolean;

  primary?: boolean;
  destructive?: boolean;

  confirmationRequired?: boolean;
  confirmationTitle?: string;
  confirmationMessage?: string;

  badge?: string | number | null;

  dataTestId?: string;
}

export interface ContextActionBarActionEvent {
  actionId: string;
  action: ContextActionBarAction;
  entityId: string | number | null;
}

export interface ContextActionBarCloseEvent {
  entityId: string | number | null;
}

export interface ContextActionBarRefreshEvent {
  entityId: string | number | null;
}