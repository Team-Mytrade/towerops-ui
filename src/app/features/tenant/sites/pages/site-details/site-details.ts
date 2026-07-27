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
import { forkJoin, finalize } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

import { BaseComponent } from '../../../../../core/base/base.component';
import {
  Severity,
  SiteHealthStatus,
  WorkOrderStatus
} from '../../../../../core/models/application.enums';
import {
  MapComponent
} from '../../../../../shared/components/map/map';
import {
  MapMarker
} from '../../../../../shared/components/map/map.models';
import {
  Site
} from '../../models/site.models';
import {
  SiteAlertSummary,
  SiteDeviceSummary,
  SiteOperationalSummary,
  SiteTelemetryMetric,
  SiteWorkOrderSummary
} from '../../models/site-detail.models';
import {
  SiteService
} from '../../services/site.service';

@Component({
  selector: 'to-site-detail',
  standalone: true,
  imports: [
    DatePipe,
    TitleCasePipe,
    ButtonModule,
    TagModule,
    MapComponent
  ],
  templateUrl: './site-details.html',
  styleUrl: './site-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteDetailComponent extends BaseComponent {
  private readonly siteService = inject(SiteService);

  readonly siteId = signal<number | null>(null);
  readonly site = signal<Site | null>(null);
  
  readonly summary =
    signal<SiteOperationalSummary | null>(null);
  readonly telemetry =
    signal<SiteTelemetryMetric[]>([]);
  readonly devices =
    signal<SiteDeviceSummary[]>([]);
  readonly alerts =
    signal<SiteAlertSummary[]>([]);
  readonly workOrders =
    signal<SiteWorkOrderSummary[]>([]);

  readonly siteMarker = computed<MapMarker[]>(() => {
    const site = this.site();

    if (
      !site ||
      site.latitude === null ||
      site.longitude === null
    ) {
      return [];
    }

    return [
      {
        id: site.id,
        latitude: site.latitude,
        longitude: site.longitude,
        title: site.siteName,
        subtitle: this.formatAddress(site.address),
        category: site.category,
        healthStatus:
          site.healthStatus ?? 'UNKNOWN',
        siteCode: site.siteCode,
        deviceCount:
          this.summary()?.devices.total ??
          site.deviceCount ??
          0,
        openAlerts:
          this.summary()?.alerts.open ??
          site.openAlerts ??
          0,
        popupEnabled: false,
        data: site
      }
    ];
  });

  readonly onlineDevicePercentage = computed(() => {
    const devices = this.summary()?.devices;

    if (!devices?.total) {
      return 0;
    }

    return Math.round(
      (devices.online / devices.total) * 100
    );
  });

  constructor() {
    super();

    this.activatedRoute.paramMap
      .pipe(this.untilDestroyed())
      .subscribe(params => {
        const siteId = Number(params.get('siteId'));

        if (!Number.isInteger(siteId) || siteId <= 0) {
          void this.navigateByUrl('/tenant/sites');
          return;
        }

        this.siteId.set(siteId);
        this.loadSite();
      });
  }

  refresh(): void {
    this.loadSite();
  }

  goBack(): void {
    void this.navigateByUrl('/tenant/sites');
  }

  editSite(): void {
    const siteId = this.siteId();

    if (!siteId) {
      return;
    }

    void this.navigate(
      ['/tenant/sites'],
      {
        queryParams: {
          mode: 'edit',
          siteId
        }
      }
    );
  }

  openDevice(device: SiteDeviceSummary): void {
    void this.navigateByUrl(
      `/tenant/devices/${device.id}`
    );
  }

  openAlert(alert: SiteAlertSummary): void {
    void this.navigateByUrl(
      `/tenant/alerts/${alert.id}`
    );
  }

  openWorkOrder(
    workOrder: SiteWorkOrderSummary
  ): void {
    void this.navigateByUrl(
      `/tenant/work-orders/${workOrder.id}`
    );
  }

  viewAllDevices(): void {
    void this.navigate(
      ['/tenant/devices'],
      {
        queryParams: {
          siteId: this.siteId()
        }
      }
    );
  }

  viewAllAlerts(): void {
    void this.navigate(
      ['/tenant/alerts'],
      {
        queryParams: {
          siteId: this.siteId()
        }
      }
    );
  }

  viewAllWorkOrders(): void {
    void this.navigate(
      ['/tenant/work-orders'],
      {
        queryParams: {
          siteId: this.siteId()
        }
      }
    );
  }

  formatAddress(address: Site['address']): string {
    if (!address) {
      return 'Address not available';
    }

    if (typeof address === 'string') {
      return address;
    }

    return [
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.country,
      address.postalCode
    ]
      .filter(Boolean)
      .join(', ');
  }

healthSeverity(
  status?: SiteHealthStatus | null
):
  | 'success'
  | 'info'
  | 'warn'
  | 'danger'
  | 'secondary'
  | 'contrast' {
  switch (status) {
    case 'HEALTHY':
      return 'success';

    case 'WARNING':
      return 'warn';

    case 'CRITICAL':
      return 'danger';

    case 'OFFLINE':
      return 'secondary';

    case 'MAINTENANCE':
      return 'info';

    case 'UNKNOWN':
    case null:
    case undefined:
    default:
      return 'secondary';
  }
}

  alertSeverity(
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

  workOrderSeverity(
    status: WorkOrderStatus
  ): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    switch (status) {
      case 'COMPLETED':
      case 'VERIFIED':
      case 'CLOSED':
        return 'success';

      case 'IN_PROGRESS':
      case 'SCHEDULED':
        return 'warn';

      case 'CANCELLED':
        return 'danger';

      case 'ASSIGNED':
        return 'info';

      default:
        return 'secondary';
    }
  }

  telemetryValue(
    metric: SiteTelemetryMetric
  ): string {
    if (
      metric.value === null ||
      metric.value === undefined ||
      metric.value === ''
    ) {
      return '—';
    }

    return `${metric.value}${
      metric.unit ? ` ${metric.unit}` : ''
    }`;
  }

selectSite(selectedSite: Site): void {
  this.site.set(selectedSite);
}
  private loadSite(): void {
    const siteId = this.siteId();

    if (!siteId) {
      return;
    }

    this.startLoading();
    this.clearPageError();

    forkJoin({
      site: this.siteService.getById(siteId),
      summary:
        this.siteService.getOperationalSummary(siteId),
      telemetry:
        this.siteService.getLatestTelemetry(siteId),
      devices:
        this.siteService.getSiteDevices(siteId),
      alerts:
        this.siteService.getSiteAlerts(siteId),
      workOrders:
        this.siteService.getSiteWorkOrders(siteId)
    })
      .pipe(
        this.untilDestroyed(),
        finalize(() => this.stopLoading())
      )
      .subscribe({
        next: response => {
          this.site.set(response.site.data);
          this.summary.set(response.summary.data);
          this.telemetry.set(
            response.telemetry.data ?? []
          );
          this.devices.set(
            response.devices.data ?? []
          );
          this.alerts.set(
            response.alerts.data ?? []
          );
          this.workOrders.set(
            response.workOrders.data ?? []
          );
        },
        error: error => {
          this.setPageError(
            error,
            'Unable to load the site details.'
          );
        }
      });
  }
}