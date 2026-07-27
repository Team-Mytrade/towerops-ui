import { QueryParams } from '../../../core/api/api-query.types';

import {
  TechnicianSkill,
  TechnicianStatus
} from '../../../core/models/application.enums';

export interface Technician {
  id: number;

  technicianCode: string;
  technicianName: string;

  userId?: number | null;
  username?: string | null;

  email?: string | null;
  phoneNumber?: string | null;

  status: TechnicianStatus;

  skills: TechnicianSkill[];
  primarySkill?: TechnicianSkill | null;

  assignedSiteCount?: number;
  activeWorkOrderCount?: number;
  completedWorkOrderCount?: number;

  currentLatitude?: number | null;
  currentLongitude?: number | null;
  lastLocationAt?: string | null;

  vehicleNumber?: string | null;

  shiftStartTime?: string | null;
  shiftEndTime?: string | null;

  availableFrom?: string | null;
  availableUntil?: string | null;

  rating?: number | null;

  enabled: boolean;
  active: boolean;

  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface TechnicianPayload {
  technicianCode: string;
  technicianName: string;

  userId?: number | null;

  email?: string | null;
  phoneNumber?: string | null;

  status: TechnicianStatus;

  skills: TechnicianSkill[];
  primarySkill?: TechnicianSkill | null;

  vehicleNumber?: string | null;

  shiftStartTime?: string | null;
  shiftEndTime?: string | null;

  availableFrom?: string | null;
  availableUntil?: string | null;

  enabled: boolean;
}

export type TechnicianListQuery = QueryParams & {
  search?: string;

  status?: TechnicianStatus;
  skill?: TechnicianSkill;

  siteId?: number;

  available?: boolean;
  enabled?: boolean;
  active?: boolean;

  page?: number;
  size?: number;
  sort?: string;
};

export type AvailableTechnicianQuery = QueryParams & {
  siteId?: number;
  skill?: TechnicianSkill;
  status?: TechnicianStatus;

  page?: number;
  size?: number;
  sort?: string;
};

export interface TechnicianAvailability {
  technicianId: number;

  available: boolean;
  status: TechnicianStatus;

  availableFrom?: string | null;
  availableUntil?: string | null;

  currentLatitude?: number | null;
  currentLongitude?: number | null;
  lastLocationAt?: string | null;

  activeWorkOrderCount: number;
}

export interface TechnicianAssignmentSummary {
  technicianId: number;
  technicianCode: string;
  technicianName: string;

  status: TechnicianStatus;

  activeWorkOrders: number;
  scheduledWorkOrders: number;
  completedToday: number;

  nextAssignmentAt?: string | null;
}

export interface UpdateTechnicianStatusPayload {
  status: TechnicianStatus;
  remarks?: string;
}

export interface UpdateTechnicianLocationPayload {
  latitude: number;
  longitude: number;
  recordedAt?: string;
}

export interface TechnicianSkillPayload {
  skills: TechnicianSkill[];
  primarySkill?: TechnicianSkill | null;
}