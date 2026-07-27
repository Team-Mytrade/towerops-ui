import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { finalize } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

import { BaseComponent } from '../../../../../core/base/base.component';

import { DeviceModel } from '../../models/device-model.models';
import { DeviceModelService } from '../../services/device-model.service';

@Component({
  selector: 'to-device-model-detail',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './device-model-detail.html',
  styleUrl: './device-model-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeviceModelDetailComponent extends BaseComponent {
  private readonly route = inject(ActivatedRoute);

  private readonly deviceModelService =
    inject(DeviceModelService);

  private readonly confirmationService =
    inject(ConfirmationService);

  readonly isloading = signal(false);
  readonly updatingStatus = signal(false);
  readonly deleting = signal(false);

  readonly deviceModel =
    signal<DeviceModel | null>(null);

  readonly modelId = signal<number | null>(null);

  readonly statusLabel = computed(() =>
    this.deviceModel()?.enabled
      ? 'Enabled'
      : 'Disabled',
  );

  readonly statusSeverity = computed<
    'success' | 'secondary'
  >(() =>
    this.deviceModel()?.enabled
      ? 'success'
      : 'secondary',
  );

  readonly selectedMetrics = computed(
    () =>
      this.deviceModel()?.supportedMetrics ?? [],
  );

  constructor() {
    super();

    this.resolveModelId();
  }

  loadDeviceModel(): void {
    const modelId = this.modelId();

    if (!modelId || this.loading()) {
      return;
    }

    this.loading.set(true);

    this.deviceModelService
      .getById(modelId)
      .pipe(
        this.untilDestroyed(),
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.deviceModel.set(response.data);
        },
        error: (error: unknown) => {
          this.deviceModel.set(null);

          this.showError(
            error,
            'Unable to load the device model.',
          );
        },
      });
  }

  goBack(): void {
    void this.router.navigate([
      '/tenant/devices/models',
    ]);
  }

  editDeviceModel(): void {
    const modelId = this.modelId();

    if (!modelId) {
      return;
    }

    void this.router.navigate([
      '/tenant/devices/models',
      modelId,
      'edit',
    ]);
  }

  toggleStatus(): void {
    const deviceModel = this.deviceModel();

    if (!deviceModel || this.updatingStatus()) {
      return;
    }

    const enabled = !deviceModel.enabled;

    this.updatingStatus.set(true);

    this.deviceModelService
      .changeStatus(deviceModel.id, enabled)
      .pipe(
        this.untilDestroyed(),
        finalize(() => {
          this.updatingStatus.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.deviceModel.set(response.data);

          this.toast.success(
            enabled
              ? 'Device model enabled successfully.'
              : 'Device model disabled successfully.',
          );
        },
        error: (error: unknown) => {
          this.showError(
            error,
            'Unable to update device model status.',
          );
        },
      });
  }

  confirmDelete(): void {
    const deviceModel = this.deviceModel();

    if (!deviceModel) {
      return;
    }

    this.confirmationService.confirm({
      header: 'Delete device model',
      message:
        `Delete “${deviceModel.modelName}”? ` +
        'This action cannot be undone.',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteDeviceModel(deviceModel.id);
      },
    });
  }

  formatEnum(
    value: string | null | undefined,
  ): string {
    if (!value) {
      return '—';
    }

    return value
      .toLowerCase()
      .split('_')
      .map(
        (part) =>
          part.charAt(0).toUpperCase() +
          part.slice(1),
      )
      .join(' ');
  }

  formatMetricLabel(metric: string): string {
    return metric
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (character) =>
        character.toUpperCase(),
      );
  }

  formatInterval(
    seconds: number | null | undefined,
  ): string {
    if (
      seconds === null ||
      seconds === undefined
    ) {
      return '—';
    }

    if (seconds < 60) {
      return `${seconds} sec`;
    }

    if (seconds < 3600) {
      const minutes = seconds / 60;

      return Number.isInteger(minutes)
        ? `${minutes} min`
        : `${seconds} sec`;
    }

    const hours = seconds / 3600;

    return Number.isInteger(hours)
      ? `${hours} hr`
      : `${seconds} sec`;
  }

  private resolveModelId(): void {
    const routeId =
      this.route.snapshot.paramMap.get('id');

    const modelId = Number(routeId);

    if (
      !routeId ||
      !Number.isFinite(modelId) ||
      modelId <= 0
    ) {
      this.toast.error(
        'Invalid device model identifier.',
      );

      this.goBack();
      return;
    }

    this.modelId.set(modelId);
    this.loadDeviceModel();
  }

  private deleteDeviceModel(
    modelId: number,
  ): void {
    if (this.deleting()) {
      return;
    }

    this.deleting.set(true);

    this.deviceModelService
      .delete(modelId)
      .pipe(
        this.untilDestroyed(),
        finalize(() => {
          this.deleting.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.toast.success(
            'Device model deleted successfully.',
          );

          this.goBack();
        },
        error: (error: unknown) => {
          this.showError(
            error,
            'Unable to delete the device model.',
          );
        },
      });
  }
}