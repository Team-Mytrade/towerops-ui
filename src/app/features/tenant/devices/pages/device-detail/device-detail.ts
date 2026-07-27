import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  DatePipe,
  TitleCasePipe
} from '@angular/common';

import {
  finalize,
  forkJoin
} from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';

import {
  BaseComponent
} from '../../../../../core/base/base.component';

import {
  Severity,
  SiteHealthStatus
} from '../../../../../core/models/application.enums';

import {
  Device
} from '../../models/device.models';

import {
  DeviceAlertSummary,
  DeviceCredentialSummary,
  DeviceEvent,
  DeviceHealthSummary,
  DeviceTelemetryMetric
} from '../../models/device-detail.models';

import {
  DeviceService
} from '../../services/device.service';

@Component({
  selector: 'to-device-detail',
  standalone: true,
  imports: [
    DatePipe,
    TitleCasePipe,
    ButtonModule,
    ProgressBarModule,
    TagModule
  ],
  templateUrl: './device-detail.html',
  styleUrl: './device-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceDetailComponent extends BaseComponent {
  private readonly deviceService =
    inject(DeviceService);

  readonly deviceId =
    signal<number | null>(null);

  readonly device =
    signal<Device | null>(null);

  readonly health =
    signal<DeviceHealthSummary | null>(null);

  readonly telemetry =
    signal<DeviceTelemetryMetric[]>([]);

  readonly events =
    signal<DeviceEvent[]>([]);

  readonly alerts =
    signal<DeviceAlertSummary[]>([]);

  readonly credentials =
    signal<DeviceCredentialSummary[]>([]);

  readonly connectivityLabel = computed(() =>
    this.health()?.connected
      ? 'Connected'
      : 'Disconnected'
  );

  readonly healthScore = computed(() =>
    this.health()?.healthScore ??
    this.device()?.healthScore ??
    0
  );

  readonly hasNetworkDetails = computed(() => {
    const device = this.device();

    return Boolean(
      device?.ipAddress ||
      device?.macAddress
    );
  });

  constructor() {
    super();

    this.activatedRoute.paramMap
      .pipe(this.untilDestroyed())
      .subscribe(params => {
        const deviceId = Number(
          params.get('deviceId')
        );

        if (
          !Number.isInteger(deviceId) ||
          deviceId <= 0
        ) {
          void this.navigateByUrl(
            '/tenant/devices'
          );

          return;
        }

        this.deviceId.set(deviceId);
        this.loadDevice();
      });
  }

  refresh(): void {
    this.loadDevice();
  }

  goBack(): void {
    void this.navigateByUrl(
      '/tenant/devices'
    );
  }

  editDevice(): void {
    const deviceId = this.deviceId();

    if (!deviceId) {
      return;
    }

    void this.navigate(
      ['/tenant/devices'],
      {
        queryParams: {
          mode: 'edit',
          deviceId
        }
      }
    );
  }

  openSite(): void {
    const siteId = this.device()?.siteId;

    if (!siteId) {
      return;
    }

    void this.navigateByUrl(
      `/tenant/sites/${siteId}`
    );
  }

  openAlert(
    alert: DeviceAlertSummary
  ): void {
    void this.navigateByUrl(
      `/tenant/alerts/${alert.id}`
    );
  }

  viewAllAlerts(): void {
    void this.navigate(
      ['/tenant/alerts'],
      {
        queryParams: {
          deviceId: this.deviceId()
        }
      }
    );
  }

  statusSeverity(
    status?: string | null
  ): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    switch (status) {
      case 'ONLINE':
      case 'ACTIVE':
      case 'HEALTHY':
        return 'success';

      case 'WARNING':
      case 'MAINTENANCE':
        return 'warn';

      case 'FAULT':
      case 'CRITICAL':
      case 'ERROR':
        return 'danger';

      case 'OFFLINE':
      case 'INACTIVE':
      case 'RETIRED':
        return 'secondary';

      default:
        return 'info';
    }
  }

  severityTag(
    severity: Severity
  ): 'success' | 'warn' | 'danger' | 'info' {
    switch (severity) {
      case 'CRITICAL':
      case 'ERROR':
        return 'danger';

      case 'HIGH':
      case 'MEDIUM':
        return 'warn';

      case 'LOW':
      default:
        return 'info';
    }
  }

  telemetryValue(
    metric: DeviceTelemetryMetric
  ): string {
    if (
      metric.value === null ||
      metric.value === undefined ||
      metric.value === ''
    ) {
      return '—';
    }

    return `${metric.value}${
      metric.unit
        ? ` ${metric.unit}`
        : ''
    }`;
  }

  healthClass(
    status?: SiteHealthStatus | null
  ): string {
    return `to-device-detail__metric--${
      (status ?? 'UNKNOWN').toLowerCase()
    }`;
  }

  private loadDevice(): void {
    const deviceId = this.deviceId();

    if (!deviceId) {
      return;
    }

    this.startLoading();
    this.clearPageError();

    forkJoin({
      device:
        this.deviceService.getById(deviceId),

      health:
        this.deviceService.getHealth(deviceId),

      telemetry:
        this.deviceService.getLatestTelemetry(
          deviceId
        ),

      events:
        this.deviceService.getEvents(deviceId),

      alerts:
        this.deviceService.getAlerts(deviceId),

      credentials:
        this.deviceService.getCredentials(
          deviceId
        )
    })
      .pipe(
        this.untilDestroyed(),
        finalize(() => this.stopLoading())
      )
      .subscribe({
        next: response => {
          this.device.set(
            response.device.data
          );

          this.health.set(
            response.health.data
          );

          this.telemetry.set(
            response.telemetry.data ?? []
          );

          this.events.set(
            response.events.data ?? []
          );

          this.alerts.set(
            response.alerts.data ?? []
          );

          this.credentials.set(
            response.credentials.data ?? []
          );
        },

        error: error => {
          this.setPageError(
            error,
            'Unable to load device details.'
          );
        }
      });
  }
}
