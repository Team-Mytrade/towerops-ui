import {
  StatusBadgeTone
} from '../status-badge/status-badge.models';

export interface EntitySummaryBadge {
  id: string;

  value:
    | string
    | boolean
    | null
    | undefined;

  label?: string | null;
  icon?: string | null;
  tone?: StatusBadgeTone | null;

  pulse?: boolean;
  visible?: boolean;
}

export interface EntitySummaryMetadata {
  id: string;
  label: string;

  value:
    | string
    | number
    | boolean
    | null
    | undefined;

  icon?: string;
  visible?: boolean;

  copyable?: boolean;
  tooltip?: string;
}

export interface EntitySummaryMetadataEvent {
  metadata: EntitySummaryMetadata;
}

export interface EntitySummaryAction {
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

  loading?: boolean;
  disabled?: boolean;
  visible?: boolean;

  dataTestId?: string;
}

export interface EntitySummaryActionEvent {
  action: EntitySummaryAction;
}