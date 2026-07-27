import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    signal,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
    debounceTime,
    distinctUntilChanged,
    finalize,
    Subject,
} from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { TableLazyLoadEvent } from 'primeng/table';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { BaseComponent } from '../../../../../core/base/base.component';

import {
    DeviceCredential,
    DeviceCredentialStatus,
    DeviceCredentialType,
} from '../../models/device-credential.models';

import {
    DeviceCredentialService,
} from '../../services/device-credential.service';

interface SelectOption<T> {
    label: string;
    value: T;
}

type EnabledFilter =
    | 'ALL'
    | 'ENABLED'
    | 'DISABLED';

@Component({
    selector: 'to-device-credentials-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        ConfirmDialogModule,
        InputTextModule,
        MenuModule,
        SelectModule,
        TableModule,
        TagModule,
        TooltipModule,
    ],
    providers: [
        ConfirmationService,
    ],
    templateUrl:
        './device-credentials-list.html',
    styleUrl:
        './device-credentials-list.scss',
    changeDetection:
        ChangeDetectionStrategy.OnPush,
})
export class DeviceCredentialsListComponent
    extends BaseComponent {

    private readonly credentialService =
        inject(DeviceCredentialService);

    private readonly confirmationService =
        inject(ConfirmationService);

    private readonly searchChanges =
        new Subject<string>();

    readonly credentials =
        signal<DeviceCredential[]>([]);

    readonly totalRecords =
        signal(0);

    readonly page =
        signal(0);

    readonly pageSize =
        signal(20);

    readonly search =
        signal('');

    readonly typeFilter =
        signal<DeviceCredentialType | null>(
            null,
        );

    readonly statusFilter =
        signal<DeviceCredentialStatus | null>(
            null,
        );

    readonly enabledFilter =
        signal<EnabledFilter>('ALL');

    readonly updatingCredentialId =
        signal<number | null>(null);

    readonly deletingCredentialId =
        signal<number | null>(null);

    readonly hasFilters = computed(
        () =>
            Boolean(
                this.search().trim() ||
                this.typeFilter() ||
                this.statusFilter() ||
                this.enabledFilter() !== 'ALL',
            ),
    );

    readonly activeCredentials = computed(
        () =>
            this.credentials().filter(
                credential =>
                    credential.status === 'ACTIVE' &&
                    credential.enabled,
            ).length,
    );

    readonly revokedCredentials = computed(
        () =>
            this.credentials().filter(
                credential =>
                    credential.status === 'REVOKED',
            ).length,
    );

    readonly expiredCredentials = computed(
        () =>
            this.credentials().filter(
                credential =>
                    credential.status === 'EXPIRED',
            ).length,
    );

    readonly credentialTypeOptions:
        SelectOption<DeviceCredentialType>[] = [
            {
                label: 'API Key',
                value: 'API_KEY',
            },
            {
                label: 'Username & Password',
                value: 'USERNAME_PASSWORD',
            },
            {
                label: 'Access Token',
                value: 'ACCESS_TOKEN',
            },
            {
                label: 'Client Certificate',
                value: 'CLIENT_CERTIFICATE',
            },
            {
                label: 'SSH Key',
                value: 'SSH_KEY',
            },
            {
                label: 'MQTT',
                value: 'MQTT',
            },
            {
                label: 'SNMP',
                value: 'SNMP',
            },
            {
                label: 'Custom',
                value: 'CUSTOM',
            },
        ];

    readonly statusOptions:
        SelectOption<DeviceCredentialStatus>[] = [
            {
                label: 'Active',
                value: 'ACTIVE',
            },
            {
                label: 'Inactive',
                value: 'INACTIVE',
            },
            {
                label: 'Expired',
                value: 'EXPIRED',
            },
            {
                label: 'Revoked',
                value: 'REVOKED',
            },
        ];

    readonly enabledOptions:
        SelectOption<EnabledFilter>[] = [
            {
                label: 'All',
                value: 'ALL',
            },
            {
                label: 'Enabled',
                value: 'ENABLED',
            },
            {
                label: 'Disabled',
                value: 'DISABLED',
            },
        ];

    constructor() {
        super();

        this.searchChanges
            .pipe(
                debounceTime(350),
                distinctUntilChanged(),
                this.untilDestroyed(),
            )
            .subscribe(() => {
                this.page.set(0);
                this.loadCredentials();
            });

        this.loadCredentials();
    }

    onSearchChange(
        value: string,
    ): void {
        this.search.set(value);
        this.searchChanges.next(value);
    }

    onTypeFilterChange(
        value: DeviceCredentialType | null,
    ): void {
        this.typeFilter.set(value);
        this.page.set(0);
        this.loadCredentials();
    }

    onStatusFilterChange(
        value: DeviceCredentialStatus | null,
    ): void {
        this.statusFilter.set(value);
        this.page.set(0);
        this.loadCredentials();
    }

    onEnabledFilterChange(
        value: EnabledFilter,
    ): void {
        this.enabledFilter.set(value);
        this.page.set(0);
        this.loadCredentials();
    }

    onLazyLoad(
        event: TableLazyLoadEvent,
    ): void {
        const rows =
            event.rows ?? this.pageSize();

        const first =
            event.first ?? 0;

        this.pageSize.set(rows);
        this.page.set(
            Math.floor(first / rows),
        );

        this.loadCredentials();
    }

    refresh(): void {
        this.loadCredentials();
    }

    clearFilters(): void {
        this.search.set('');
        this.typeFilter.set(null);
        this.statusFilter.set(null);
        this.enabledFilter.set('ALL');
        this.page.set(0);

        this.loadCredentials();
    }

    createCredential(): void {
        void this.router.navigate([
            '/tenant/devices/credentials/create',
        ]);
    }

    openCredential(
        credential: DeviceCredential,
    ): void {
        void this.router.navigate([
            '/tenant/devices/credentials',
            credential.id,
        ]);
    }

    editCredential(
        credential: DeviceCredential,
        event?: Event,
    ): void {
        event?.stopPropagation();

        void this.router.navigate([
            '/tenant/devices/credentials',
            credential.id,
            'edit',
        ]);
    }

    toggleEnabled(
        credential: DeviceCredential,
        event?: Event,
    ): void {
        event?.stopPropagation();

        const nextStatus:
            DeviceCredentialStatus =
            credential.enabled
                ? 'INACTIVE'
                : 'ACTIVE';

        const actionLabel =
            credential.enabled
                ? 'disable'
                : 'enable';

        this.confirmationService.confirm({
            header:
                credential.enabled
                    ? 'Disable Credential'
                    : 'Enable Credential',

            message:
                `Are you sure you want to ${actionLabel} ` +
                `"${credential.credentialName}"?`,

            icon:
                credential.enabled
                    ? 'pi pi-ban'
                    : 'pi pi-check-circle',

            acceptLabel:
                credential.enabled
                    ? 'Disable'
                    : 'Enable',

            rejectLabel: 'Cancel',

            accept: () => {
                this.updateCredentialStatus(
                    credential,
                    nextStatus,
                );
            },
        });
    }

    revokeCredential(
        credential: DeviceCredential,
        event?: Event,
    ): void {
        event?.stopPropagation();

        if (
            credential.status === 'REVOKED'
        ) {
            return;
        }

        this.confirmationService.confirm({
            header: 'Revoke Credential',
            message:
                `Revoke "${credential.credentialName}"? ` +
                'Devices using this credential may immediately lose access.',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Revoke',
            rejectLabel: 'Cancel',
            acceptButtonStyleClass:
                'p-button-danger',
            accept: () => {
                this.updateCredentialStatus(
                    credential,
                    'REVOKED',
                );
            },
        });
    }

    confirmDelete(
        credential: DeviceCredential,
        event?: Event,
    ): void {
        event?.stopPropagation();

        this.confirmationService.confirm({
            header: 'Delete Credential',
            message:
                `Delete "${credential.credentialName}"? ` +
                'This action cannot be undone.',
            icon: 'pi pi-trash',
            acceptLabel: 'Delete',
            rejectLabel: 'Cancel',
            acceptButtonStyleClass:
                'p-button-danger',
            accept: () => {
                this.deleteCredential(
                    credential,
                );
            },
        });
    }

    getStatusSeverity(
        status: DeviceCredentialStatus,
    ):
        | 'success'
        | 'secondary'
        | 'warn'
        | 'danger'
        | 'info'
        | 'contrast' {
        switch (status) {
            case 'ACTIVE':
                return 'success';

            case 'INACTIVE':
                return 'secondary';

            case 'EXPIRED':
                return 'warn';

            case 'REVOKED':
                return 'danger';

            default:
                return 'info';
        }
    }

    getTypeIcon(
        type: DeviceCredentialType,
    ): string {
        switch (type) {
            case 'API_KEY':
                return 'pi pi-key';

            case 'USERNAME_PASSWORD':
                return 'pi pi-user';

            case 'ACCESS_TOKEN':
                return 'pi pi-ticket';

            case 'CLIENT_CERTIFICATE':
                return 'pi pi-verified';

            case 'SSH_KEY':
                return 'pi pi-lock';

            case 'MQTT':
                return 'pi pi-send';

            case 'SNMP':
                return 'pi pi-server';

            default:
                return 'pi pi-cog';
        }
    }

    formatEnum(
        value:
            | string
            | null
            | undefined,
    ): string {
        if (!value) {
            return '—';
        }

        return value
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(
                /\b\w/g,
                character =>
                    character.toUpperCase(),
            );
    }

    formatDate(
        value:
            | string
            | null
            | undefined,
    ): string {
        if (!value) {
            return '—';
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(date.getTime())
        ) {
            return '—';
        }

        return new Intl.DateTimeFormat(
            'en-US',
            {
                dateStyle: 'medium',
                timeStyle: 'short',
            },
        ).format(date);
    }

    private loadCredentials(): void {
        this.startLoading();
        this.clearPageError();

        this.credentialService
            .getAll({
                page: this.page(),
                size: this.pageSize(),
                search:
                    this.search().trim() ||
                    undefined,
                credentialType:
                    this.typeFilter(),
                status:
                    this.statusFilter(),
                enabled:
                    this.resolveEnabledFilter(),
            })
            .pipe(
                this.untilDestroyed(),
                finalize(() => {
                    this.stopLoading();
                }),
            )
            .subscribe({
                next: response => {
                    const pageData =
                        response.data;

                    this.credentials.set(
                        pageData.content ?? [],
                    );

                    this.totalRecords.set(
                        pageData.totalElements ?? 0,
                    );
                },

                error: (error: unknown) => {
                    this.credentials.set([]);
                    this.totalRecords.set(0);

                    this.setPageError(
                        error,
                        'Unable to load device credentials.',
                    );

                    this.showError(
                        error,
                        'Unable to load device credentials.',
                    );
                },
            });
    }

    private updateCredentialStatus(
        credential: DeviceCredential,
        status: DeviceCredentialStatus,
    ): void {
        this.updatingCredentialId.set(
            credential.id,
        );

        this.credentialService
            .updateStatus(
                credential.id,
                {
                    status,
                    reason: null,
                },
            )
            .pipe(
                this.untilDestroyed(),
                finalize(() => {
                    this.updatingCredentialId.set(
                        null,
                    );
                }),
            )
            .subscribe({
                next: response => {
                    this.replaceCredential(
                        response.data,
                    );

                    const message =
                        status === 'REVOKED'
                            ? 'Credential revoked successfully.'
                            : status === 'ACTIVE'
                                ? 'Credential enabled successfully.'
                                : 'Credential disabled successfully.';

                    this.toast.success(message);
                },

                error: (error: unknown) => {
                    this.showError(
                        error,
                        'Unable to update credential status.',
                    );
                },
            });
    }

    private deleteCredential(
        credential: DeviceCredential,
    ): void {
        this.deletingCredentialId.set(
            credential.id,
        );

        this.credentialService
            .delete(credential.id)
            .pipe(
                this.untilDestroyed(),
                finalize(() => {
                    this.deletingCredentialId.set(
                        null,
                    );
                }),
            )
            .subscribe({
                next: () => {
                    this.toast.success(
                        'Credential deleted successfully.',
                    );

                    const remainingItems =
                        this.credentials().length - 1;

                    if (
                        remainingItems === 0 &&
                        this.page() > 0
                    ) {
                        this.page.update(
                            page => page - 1,
                        );
                    }

                    this.loadCredentials();
                },

                error: (error: unknown) => {
                    this.showError(
                        error,
                        'Unable to delete the credential.',
                    );
                },
            });
    }

    private replaceCredential(
        updated:
            DeviceCredential,
    ): void {
        this.credentials.update(
            credentials =>
                credentials.map(
                    credential =>
                        credential.id ===
                            updated.id
                            ? updated
                            : credential,
                ),
        );
    }

    private resolveEnabledFilter():
        boolean | null {
        switch (this.enabledFilter()) {
            case 'ENABLED':
                return true;

            case 'DISABLED':
                return false;

            default:
                return null;
        }
    }
}