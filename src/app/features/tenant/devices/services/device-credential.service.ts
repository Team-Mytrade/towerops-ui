import {
    inject,
    Injectable,
} from '@angular/core';

import { Observable } from 'rxjs';

import { ApiService } from '../../../../core/api/api.service';
import {
    ApiResponse,
    PageResponse,
} from '../../../../core/api/api.types';

import {
    DeviceCredential,
    DeviceCredentialAssignmentPayload,
    DeviceCredentialDetail,
    DeviceCredentialListQuery,
    DeviceCredentialPayload,
    DeviceCredentialSecretResponse,
    DeviceCredentialStatusPayload,
} from '../models/device-credential.models';

@Injectable({
    providedIn: 'root',
})
export class DeviceCredentialService {
    private readonly api =
        inject(ApiService);

    private readonly endpoint =
        '/device-credentials';

    getAll(
        query: DeviceCredentialListQuery = {},
    ): Observable<
        ApiResponse<PageResponse<DeviceCredential>>
    > {
        return this.api.get<
            PageResponse<DeviceCredential>
        >(
            this.endpoint,
            {
                query: this.toQuery(query),
            },
        );
    }

    getById(
        credentialId: number,
    ): Observable<
        ApiResponse<DeviceCredentialDetail>
    > {
        return this.api.get<
            DeviceCredentialDetail
        >(
            `${this.endpoint}/${credentialId}`,
        );
    }

    create(
        payload: DeviceCredentialPayload,
    ): Observable<
        ApiResponse<DeviceCredentialDetail>
    > {
        return this.api.post<
            DeviceCredentialDetail,
            DeviceCredentialPayload
        >(
            this.endpoint,
            payload,
        );
    }

    update(
        credentialId: number,
        payload: DeviceCredentialPayload,
    ): Observable<
        ApiResponse<DeviceCredentialDetail>
    > {
        return this.api.put<
            DeviceCredentialDetail,
            DeviceCredentialPayload
        >(
            `${this.endpoint}/${credentialId}`,
            payload,
        );
    }

    delete(
        credentialId: number,
    ): Observable<ApiResponse<void>> {
        return this.api.delete<
            void
        >(
            `${this.endpoint}/${credentialId}`,
        );
    }

    updateStatus(
        credentialId: number,
        payload: DeviceCredentialStatusPayload,
    ): Observable<
        ApiResponse<DeviceCredentialDetail>
    > {
        return this.api.patch<
            DeviceCredentialDetail,
            DeviceCredentialStatusPayload
        >(
            `${this.endpoint}/${credentialId}/status`,
            payload,
        );
    }

    assignToDevice(
        credentialId: number,
        payload: DeviceCredentialAssignmentPayload,
    ): Observable<
        ApiResponse<DeviceCredentialDetail>
    > {
        return this.api.patch<
            DeviceCredentialDetail,
            DeviceCredentialAssignmentPayload
        >(
            `${this.endpoint}/${credentialId}/assign`,
            payload,
        );
    }

    unassignFromDevice(
        credentialId: number,
    ): Observable<
        ApiResponse<DeviceCredentialDetail>
    > {
        return this.api.patch<
            DeviceCredentialDetail
        >(
            `${this.endpoint}/${credentialId}/unassign`,
            {},
        );
    }

    rotateSecret(
        credentialId: number,
    ): Observable<
        ApiResponse<DeviceCredentialDetail>
    > {
        return this.api.post<
            DeviceCredentialDetail
        >(
            `${this.endpoint}/${credentialId}/rotate`,
            {},
        );
    }

    revealSecret(
        credentialId: number,
    ): Observable<
        ApiResponse<DeviceCredentialSecretResponse>
    > {
        return this.api.post<
            DeviceCredentialSecretResponse
        >(
            `${this.endpoint}/${credentialId}/reveal`,
            {},
        );
    }

    private toQuery(
        query: DeviceCredentialListQuery,
    ): Record<
        string,
        string | number | boolean
    > {
        const params: Record<
            string,
            string | number | boolean
        > = {};

        if (query.page !== undefined) {
            params['page'] = query.page;
        }

        if (query.size !== undefined) {
            params['size'] = query.size;
        }

        if (query.search?.trim()) {
            params['search'] =
                query.search.trim();
        }

        if (query.credentialType) {
            params['credentialType'] =
                query.credentialType;
        }

        if (query.status) {
            params['status'] =
                query.status;
        }

        if (query.deviceId !== null &&
            query.deviceId !== undefined) {
            params['deviceId'] =
                query.deviceId;
        }

        if (query.enabled !== null &&
            query.enabled !== undefined) {
            params['enabled'] =
                query.enabled;
        }

        return params;
    }
}