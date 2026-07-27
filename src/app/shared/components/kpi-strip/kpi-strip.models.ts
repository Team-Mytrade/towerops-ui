export type KpiTone =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'secondary';

export interface KpiItem {
  id: string;

  label: string;

  value:
    | string
    | number
    | null
    | undefined;

  icon?: string;

  tone?: KpiTone;

  description?: string;

  trend?: number | null;

  trendLabel?: string;

  loading?: boolean;

  clickable?: boolean;

  active?: boolean;

  disabled?: boolean;

  dataTestId?: string;
}