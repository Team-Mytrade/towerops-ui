export type ActivityTimelineTone =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'secondary';

export type ActivityTimelineStatus =
  | 'completed'
  | 'current'
  | 'pending'
  | 'failed';

export interface ActivityTimelineAction {
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

  visible?: boolean;
  disabled?: boolean;
  loading?: boolean;

  dataTestId?: string;
}

export interface ActivityTimelineItem {
  id: string | number;

  title: string;

  description?: string | null;

  timestamp?: string | number | Date | null;

  actorName?: string | null;
  actorRole?: string | null;
  actorAvatarUrl?: string | null;

  icon?: string;

  tone?: ActivityTimelineTone;

  status?: ActivityTimelineStatus;

  metadata?: Record<string, string | number | null | undefined>;

  actions?: ActivityTimelineAction[];

  dataTestId?: string;
}

export interface ActivityTimelineActionEvent {
  item: ActivityTimelineItem;
  action: ActivityTimelineAction;
}

export interface ActivityTimelineItemEvent {
  item: ActivityTimelineItem;
}