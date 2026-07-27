import { DeviceLookup } from './device.models';

export type DeviceCredentialType =
    | 'API_KEY'
    | 'USERNAME_PASSWORD'
    | 'ACCESS_TOKEN'
    | 'CLIENT_CERTIFICATE'
    | 'SSH_KEY'
    | 'MQTT'
    | 'SNMP'
    | 'CUSTOM';

export type DeviceCredentialStatus =
    | 'ACTIVE'
    | 'INACTIVE'
    | 'EXPIRED'
    | 'REVOKED';

export interface DeviceCredential {
    id: number;

    credentialCode: string;
    credentialName: string;

    credentialType: DeviceCredentialType;
    status: DeviceCredentialStatus;

    username: string | null;

    apiKeyMasked: string | null;
    accessTokenMasked: string | null;
    passwordMasked: string | null;

    clientId: string | null;
    certificateName: string | null;

    deviceId: number | null;
    deviceCode: string | null;
    deviceName: string | null;

    description: string | null;

    validFrom: string | null;
    expiresAt: string | null;

    lastUsedAt: string | null;

    enabled: boolean;

    createdAt: string;
    createdBy: string | null;

    updatedAt: string | null;
    updatedBy: string | null;
}

export interface DeviceCredentialDetail
    extends DeviceCredential {
    device: DeviceLookup | null;

    metadata: Record<
        string,
        string | number | boolean | null
    >;
}

export interface DeviceCredentialPayload {
    credentialCode: string;
    credentialName: string;

    credentialType: DeviceCredentialType;

    username: string | null;
    password: string | null;

    apiKey: string | null;
    accessToken: string | null;

    clientId: string | null;
    clientSecret: string | null;

    certificate: string | null;
    privateKey: string | null;

    deviceId: number | null;

    description: string | null;

    validFrom: string | null;
    expiresAt: string | null;

    enabled: boolean;

    metadata: Record<
        string,
        string | number | boolean | null
    >;
}

export interface DeviceCredentialListQuery {
    page?: number;
    size?: number;

    search?: string;

    credentialType?: DeviceCredentialType | null;
    status?: DeviceCredentialStatus | null;

    deviceId?: number | null;

    enabled?: boolean | null;
}

export interface DeviceCredentialStatusPayload {
    status: DeviceCredentialStatus;
    reason?: string | null;
}

export interface DeviceCredentialAssignmentPayload {
    deviceId: number;
}

export interface DeviceCredentialSecretResponse {
    credentialId: number;
    credentialType: DeviceCredentialType;

    apiKey: string | null;
    accessToken: string | null;
    username: string | null;
    password: string | null;

    clientId: string | null;
    clientSecret: string | null;

    certificate: string | null;
    privateKey: string | null;
}