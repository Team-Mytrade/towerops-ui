import {
  SiteCategory,
  SiteHealthStatus
} from '../../../core/models/application.enums';

export type MapCoordinate = [number, number];

export interface MapMarker {
  id: number | string;

  latitude: number;
  longitude: number;

  title: string;
  subtitle?: string;

  category?: SiteCategory;
  healthStatus?: SiteHealthStatus;

  siteCode?: string;
  deviceCount?: number;
  openAlerts?: number;

  popupEnabled?: boolean;

  data?: unknown;
}

export interface MapViewport {
  center: MapCoordinate;
  zoom: number;
}

export interface MapBoundsValue {
  north: number;
  south: number;
  east: number;
  west: number;
}