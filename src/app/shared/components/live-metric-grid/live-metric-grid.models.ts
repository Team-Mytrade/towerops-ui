export type LiveMetricTone =
  | 'primary'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'secondary';

export type LiveMetricTrend =
  | 'up'
  | 'down'
  | 'stable'
  | 'unknown';

export type LiveMetricState =
  | 'normal'
  | 'warning'
  | 'critical'
  | 'offline'
  | 'unknown';

export type LiveMetricDisplayType =
  | 'value'
  | 'percentage'
  | 'progress'
  | 'boolean';

export interface LiveMetricThreshold {
  warningMin?: number;
  warningMax?: number;

  criticalMin?: number;
  criticalMax?: number;
}

export interface LiveMetricAction {
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

  visible?: boolean;
  disabled?: boolean;
  loading?: boolean;

  dataTestId?: string;
}

export interface LiveMetricItem {
  id: string;

  label: string;

  value:
    | string
    | number
    | boolean
    | null
    | undefined;

  unit?: string | null;

  displayType?: LiveMetricDisplayType;

  icon?: string;

  tone?: LiveMetricTone;
  state?: LiveMetricState;

  trend?: LiveMetricTrend;
  trendValue?: string | number | null;
  trendLabel?: string | null;

  minimum?: number;
  maximum?: number;

  thresholds?: LiveMetricThreshold;

  decimalPlaces?: number;

  description?: string | null;

  updatedAt?:
    | string
    | number
    | Date
    | null;

  online?: boolean;

  trueLabel?: string;
  falseLabel?: string;

  actions?: LiveMetricAction[];

  visible?: boolean;

  dataTestId?: string;
}

export interface LiveMetricActionEvent {
  metric: LiveMetricItem;
  action: LiveMetricAction;
}

export interface LiveMetricSelectEvent {
  metric: LiveMetricItem;
}