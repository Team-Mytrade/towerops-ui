import { QueryParams } from '../../../../core/api/api-query.types';

import {
  SiteCategory,
  SiteHealthStatus
} from '../../../../core/models/application.enums';

export interface SiteAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface Site {
  id: number;

  siteCode: string;
  siteName: string;
  category: SiteCategory;

  address: SiteAddress | string | null;

  latitude: number | null;
  longitude: number | null;

  description?: string | null;
  healthStatus?: SiteHealthStatus | null;

  enabled: boolean;
  active: boolean;

  deviceCount?: number;
  openAlerts?: number;

  createdAt?: string;
  updatedAt?: string;
}

export interface SitePayload {
  siteCode: string;
  siteName: string;
  category: SiteCategory;

  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };

  latitude: number;
  longitude: number;

  description: string;
  enabled: boolean;
}

export interface SiteListQuery extends QueryParams {
  category?: SiteCategory;
  healthStatus?: SiteHealthStatus;

  enabled?: boolean;
  active?: boolean;

  search?: string;

  page?: number;
  size?: number;
  sort?: string;
}

export interface SiteListResponse {
  content: Site[];
  totalElements: number;
  totalPages?: number;
  page: number;
  size: number;
  first?: boolean;
  last?: boolean;
}