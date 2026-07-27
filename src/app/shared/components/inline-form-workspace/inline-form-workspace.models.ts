export type InlineFormWorkspaceMode =
  | 'create'
  | 'edit'
  | 'review'
  | 'view';

export type InlineFormWorkspaceTone =
  | 'primary'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'secondary';

export type InlineFormWorkspaceWidth =
  | 'narrow'
  | 'default'
  | 'wide'
  | 'full';

export interface InlineFormWorkspaceStep {
  id: string;
  label: string;

  description?: string;
  icon?: string;

  completed?: boolean;
  optional?: boolean;
  disabled?: boolean;
  visible?: boolean;
  error?: boolean;
}

export interface InlineFormWorkspaceStepEvent {
  previousStepId: string | null;
  stepId: string;
  step: InlineFormWorkspaceStep;
}

export interface InlineFormWorkspaceAction {
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

export interface InlineFormWorkspaceActionEvent {
  action: InlineFormWorkspaceAction;
}

export interface InlineFormWorkspaceCloseEvent {
  dirty: boolean;
}

export interface InlineFormWorkspaceSubmitEvent {
  mode: InlineFormWorkspaceMode;
}