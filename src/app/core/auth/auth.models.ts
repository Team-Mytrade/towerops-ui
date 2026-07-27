import { UserType } from '../models/application.enums';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  tenantId: string;
  userType: UserType;
  roles: string[];
  permissions: string[];
}

export interface CurrentUser {
  userId: number;
  username: string;
  email?: string;
  tenantId: string;
  tenantName?: string;
  userType: UserType;
  technicianId?: number | null;
  roles: string[];
  permissions: string[];
}

export interface StoredSession {
  token: string;
  user: CurrentUser;
}