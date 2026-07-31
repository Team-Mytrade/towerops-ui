export interface Role {
  id: number;
  roleCode: string;
  roleName: string;
  description: string | null;
  permissions: string[];
}

export interface RolePayload {
  roleCode: string;
  roleName: string;
  description: string;
  permissionIds: number[];
}
