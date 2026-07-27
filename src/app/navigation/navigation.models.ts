export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  permission?: string;
  exact?: boolean;
}

export interface NavigationGroup {
  id: string;
  title?: string;
  items: NavigationItem[];
}