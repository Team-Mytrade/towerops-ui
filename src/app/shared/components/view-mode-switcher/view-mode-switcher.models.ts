export type ViewModeId =
  | 'LIST'
  | 'TABLE'
  | 'GRID'
  | 'MAP'
  | 'BOARD'
  | 'TIMELINE'
  | string;

export type ViewDensity =
  | 'COMPACT'
  | 'COMFORTABLE'
  | 'SPACIOUS';

export interface ViewModeOption {
  id: ViewModeId;
  label: string;

  icon?: string;
  description?: string;
  tooltip?: string;

  visible?: boolean;
  disabled?: boolean;

  count?: number | null;
  badge?: string | number | null;

  dataTestId?: string;
}

export interface ViewModeChangeEvent {
  previousMode: ViewModeId | null;
  mode: ViewModeId;
  option: ViewModeOption;
}

export interface ViewDensityChangeEvent {
  previousDensity: ViewDensity;
  density: ViewDensity;
}

export interface ViewModeRefreshEvent {
  mode: ViewModeId | null;
}