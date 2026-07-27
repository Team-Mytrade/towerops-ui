export type ContentSectionTone =
  | 'primary'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'secondary';

export type ContentSectionPadding =
  | 'none'
  | 'compact'
  | 'default'
  | 'comfortable';

export interface ContentSectionAction {
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
  rounded?: boolean;

  visible?: boolean;
  disabled?: boolean;
  loading?: boolean;

  tooltip?: string;
  dataTestId?: string;
}

export interface ContentSectionActionEvent {
  action: ContentSectionAction;
}

export interface ContentSectionToggleEvent {
  collapsed: boolean;
}