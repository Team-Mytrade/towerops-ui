export type StatusBadgeTone =
  | 'primary'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'secondary'
  | 'contrast';

export type StatusBadgeSize =
  | 'small'
  | 'medium';

export interface StatusBadgeConfig {
  label: string;
  tone: StatusBadgeTone;

  icon?: string;

  pulse?: boolean;
}

export type StatusBadgeMap =
  Record<string, StatusBadgeConfig>;