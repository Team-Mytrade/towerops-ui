export type SplitWorkspaceLayout =
  | 'horizontal'
  | 'vertical';

export type SplitWorkspaceMobileView =
  | 'left'
  | 'right';

export type SplitWorkspacePanel =
  | 'left'
  | 'right';

export interface SplitWorkspaceResizeEvent {
  sizes: number[];
  leftSize: number;
  rightSize: number;
}

export interface SplitWorkspaceCollapseEvent {
  panel: SplitWorkspacePanel;
  collapsed: boolean;
}

export interface SplitWorkspaceFullscreenEvent {
  fullscreen: boolean;
}

export interface SplitWorkspaceMobileViewEvent {
  view: SplitWorkspaceMobileView;
}