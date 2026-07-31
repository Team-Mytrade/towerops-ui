import { TechnicianStatus } from '../../../core/models/application.enums';

export interface Technician {
  id: number;
  technicianCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  designation: string;
  department: string;
  tenantId: string;
  siteCode: string;
  status: TechnicianStatus;
  enabled: boolean;
  skillSet: string;
  remarks: string;
  userId: number;
  username?: string | null;
}

export type TechnicianPayload = Omit<Technician, 'id' | 'username'>;
