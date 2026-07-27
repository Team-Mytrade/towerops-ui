export type SavedViewScope =
  | 'PRIVATE'
  | 'SHARED'
  | 'SYSTEM';

export interface SavedViewItem<
  TState = Record<string, unknown>
> {
  id: string;
  name: string;
  description?: string;

  icon?: string;
  scope?: SavedViewScope;

  state: TState;

  default?: boolean;
  favourite?: boolean;
  readonly?: boolean;
  disabled?: boolean;

  createdBy?: string;
  updatedAt?: string | Date | null;
}

export interface SavedViewSelectEvent<
  TState = Record<string, unknown>
> {
  previousViewId: string | null;
  viewId: string;
  view: SavedViewItem<TState>;
  state: TState;
}

export interface SavedViewCreateEvent<
  TState = Record<string, unknown>
> {
  name: string;
  description: string;
  scope: SavedViewScope;
  setAsDefault: boolean;
  state: TState;
}

export interface SavedViewUpdateEvent<
  TState = Record<string, unknown>
> {
  viewId: string;
  view: SavedViewItem<TState>;
  state: TState;
}

export interface SavedViewDeleteEvent<
  TState = Record<string, unknown>
> {
  viewId: string;
  view: SavedViewItem<TState>;
}

export interface SavedViewFavouriteEvent<
  TState = Record<string, unknown>
> {
  viewId: string;
  view: SavedViewItem<TState>;
  favourite: boolean;
}

export interface SavedViewDefaultEvent<
  TState = Record<string, unknown>
> {
  viewId: string;
  view: SavedViewItem<TState>;
}

export interface SavedViewResetEvent {
  activeViewId: string | null;
}

export interface SavedViewDirtyStateEvent {
  dirty: boolean;
  activeViewId: string | null;
}