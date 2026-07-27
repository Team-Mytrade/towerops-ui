export type PageHeaderActionSeverity =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warn'
  | 'danger'
  | 'contrast';

export interface PageHeaderAction {
  id: string;
  label: string;
  icon?: string;

  severity?: PageHeaderActionSeverity;

  outlined?: boolean;
  text?: boolean;
  rounded?: boolean;

  disabled?: boolean;
  loading?: boolean;
  visible?: boolean;

  dataTestId?: string;
}