import {
  SiteCategory,
  SiteHealthStatus
} from '../../../core/models/application.enums';

export interface SiteCategorySummary {
  category: SiteCategory;
  count: number;
  healthy?: number;
  warning?: number;
  critical?: number;
  offline?: number;
  maintenance?: number;
  unknown?: number;
  openAlerts?: number;
  criticalSites?: number;
}

export interface CategoryDisplayConfig {
  label: string;
  description: string;
  icon: string;
}

export interface CategoryHealthItem {
  label: string;
  value: number;
  status: SiteHealthStatus;
}