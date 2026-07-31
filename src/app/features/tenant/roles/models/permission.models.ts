export interface Permission {
  id: number;
  permissionCode: string;
  permissionName: string;
  description: string | null;
}

export interface PermissionPayload {
  permissionCode: string;
  permissionName: string;
  description: string;
}
