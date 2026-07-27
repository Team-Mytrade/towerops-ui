
export type DetailSectionTabTone =
  | 'primary'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'secondary';

export interface DetailSectionTab {
  id: string;
  label: string;

  icon?: string;
  description?: string;

  count?: number | null;
  badge?: string | number | null;

  tone?: DetailSectionTabTone;

  visible?: boolean;
  disabled?: boolean;
  loading?: boolean;

  dataTestId?: string;
}

export interface DetailSectionTabChangeEvent {
  previousTabId: string | null;
  tabId: string;
  tab: DetailSectionTab;
}