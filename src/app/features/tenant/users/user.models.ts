import { UserType } from '../../../core/models/application.enums';

export interface UserAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface TenantUser {
  id: number;
  userCode: string;
  userType: UserType;
  username: string;
  email: string;
  roleIds: number[];
  enabled: boolean;
  phoneNumber: string;
  address: UserAddress;
  active: boolean;
}

export interface UserPayload {
  userCode: string;
  userType: UserType;
  username: string;
  email: string;
  password: string;
  roleIds: number[];
  enabled: boolean;
  phoneNumber: string;
  address: UserAddress;
}
