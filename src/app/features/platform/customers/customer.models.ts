export interface Customer {
  id: number;
  tenantId: string;
  tenantName: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  active: boolean;
}

export type CustomerPayload = Omit<Customer, 'id'>;
