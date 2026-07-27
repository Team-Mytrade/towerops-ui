import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  CommonModule,
  DatePipe,
  DecimalPipe,
  TitleCasePipe
} from '@angular/common';

import {
  finalize,
  forkJoin
} from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';

import { BaseComponent } from '../../../core/base/base.component';

import {
  Severity,
  SiteCategory,
  SiteHealthStatus,
  WorkOrderStatus
} from '../../../core/models/application.enums';

import { STORAGE_KEYS } from '../../../core/storage/storage.keys';
import { StorageService } from '../../../core/storage/storage.service';

import { MapComponent } from '../../../shared/components/map/map';
import { MapMarker } from '../../../shared/components/map/map.models';

import {
  CategoryDashboardSummary,
  DashboardAlert,
  DashboardMapSite,
  DashboardWorkOrder
} from './dashboard.models';

import { TenantDashboardService } from './dashboard.service';
import { RouterLink } from '@angular/router';

const SITE_CATEGORIES: readonly SiteCategory[] = [
  'TOWER',
  'BUILDING',
  'WAREHOUSE',
  'TELECOM',
  'POWER',
  'GENERATOR',
  'FACILITY',
  'MARINE',
  'AVIATION',
  'DEFENSE',
  'AI_OPS_CENTER'
];

@Component({
  selector: 'to-tenant-dashboard',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    TitleCasePipe,
    ButtonModule,
    ProgressSpinnerModule,
    TagModule,
    MapComponent,
    CommonModule,
    RouterLink
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TenantDashboardComponent extends BaseComponent {
  private readonly dashboardService =
    inject(TenantDashboardService);

  private readonly storageService =
    inject(StorageService);

  readonly category = signal<SiteCategory>('TOWER');

  readonly summary =
    signal<CategoryDashboardSummary | null>(null);

  readonly mapSites =
    signal<DashboardMapSite[]>([]);

  readonly criticalAlerts =
    signal<DashboardAlert[]>([]);

  readonly activeWorkOrders =
    signal<DashboardWorkOrder[]>([]);

  readonly loadingDashboard = signal(false);

  readonly categoryLabel = computed(() =>
    this.category()
      .replaceAll('_', ' ')
      .toLowerCase()
  );

  readonly healthyPercentage = computed(() => {
    const dashboard = this.summary();
    const total = dashboard?.sites.total ?? 0;
    const healthy = dashboard?.sites.healthy ?? 0;

    if (total <= 0) {
      return 0;
    }

    return Math.round(
      (healthy / total) * 100
    );
  });

  readonly onlineDevicePercentage = computed(() => {
    const dashboard = this.summary();
    const total = dashboard?.devices.total ?? 0;
    const online = dashboard?.devices.online ?? 0;

    if (total <= 0) {
      return 0;
    }

    return Math.round(
      (online / total) * 100
    );
  });

  readonly mapMarkers = computed<MapMarker[]>(() =>
    this.mapSites()
      .filter(site =>
        this.hasValidCoordinates(site)
      )
      .map(site => ({
        id: site.siteId,
        latitude: site.latitude,
        longitude: site.longitude,
        title: site.siteName,
        subtitle: `${site.deviceCount ?? 0} connected devices`,
        category: site.category,
        healthStatus: site.healthStatus,
        siteCode: site.siteCode,
        deviceCount: site.deviceCount ?? 0,
        openAlerts: site.openAlerts ?? 0,
        data: site
      }))
  );

  constructor() {
    super();

    this.activatedRoute.paramMap
      .pipe(this.untilDestroyed())
      .subscribe(params => {
        const routeCategory = params
          .get('category')
          ?.trim()
          .toUpperCase();

        if (!this.isSiteCategory(routeCategory)) {
          void this.navigateByUrl(
            '/tenant/categories'
          );

          return;
        }

        this.category.set(routeCategory);

        this.storageService.set(
          STORAGE_KEYS.selectedCategory,
          routeCategory
        );

        this.resetDashboard();
        this.loadDashboard();
      });
  }

  refresh(): void {
    if (this.loadingDashboard()) {
      return;
    }

    this.loadDashboard();
  }

  changeCategory(): void {
    void this.navigateByUrl(
      '/tenant/categories'
    );
  }

  openSites(): void {
    void this.navigate(
      ['/tenant/sites'],
      {
        queryParams: {
          category: this.category()
        }
      }
    );
  }

  openDevices(): void {
    void this.navigate(
      ['/tenant/devices'],
      {
        queryParams: {
          category: this.category()
        }
      }
    );
  }

  openAlerts(): void {
    void this.navigate(
      ['/tenant/alerts'],
      {
        queryParams: {
          category: this.category()
        }
      }
    );
  }

  openTickets(): void {
    void this.navigate(
      ['/tenant/tickets'],
      {
        queryParams: {
          category: this.category()
        }
      }
    );
  }

  openWorkOrders(): void {
    void this.navigate(
      ['/tenant/work-orders'],
      {
        queryParams: {
          category: this.category()
        }
      }
    );
  }

  openSite(site: DashboardMapSite): void {
    void this.navigate([
      '/tenant/sites',
      site.siteId
    ]);
  }

  openAlert(alert: DashboardAlert): void {
    void this.navigate([
      '/tenant/alerts',
      alert.id
    ]);
  }

  openWorkOrder(
    workOrder: DashboardWorkOrder
  ): void {
    void this.navigate([
      '/tenant/work-orders',
      workOrder.id
    ]);
  }

  onMarkerSelected(marker: MapMarker): void {
    const site =
      marker.data as DashboardMapSite | undefined;

    if (site) {
      this.openSite(site);
      return;
    }

    void this.navigate([
      '/tenant/sites',
      marker.id
    ]);
  }

  severityClass(
    severity: Severity | null | undefined
  ): string {
    return `to-severity--${(
      severity ?? 'LOW'
    ).toLowerCase()}`;
  }

  healthClass(
    status: SiteHealthStatus | null | undefined
  ): string {
    return status
      ? `to-health--${status.toLowerCase()}`
      : 'to-health--unknown';
  }

  workOrderClass(
    status: WorkOrderStatus | null | undefined
  ): string {
    return `to-work-order--${(
      status ?? 'CREATED'
    ).toLowerCase()}`;
  }

  private loadDashboard(): void {
    this.loadingDashboard.set(true);
    this.clearPageError();

    const category = this.category();

    forkJoin({
      summary:
        this.dashboardService.getSummary(category),

      sites:
        this.dashboardService.getMapSites(category),

      alerts:
        this.dashboardService.getCriticalAlerts(
          category
        ),

      workOrders:
        this.dashboardService.getActiveWorkOrders(
          category
        )
    })
      .pipe(
        this.untilDestroyed(),
        finalize(() => {
          this.loadingDashboard.set(false);
        })
      )
      .subscribe({
        next: response => {
          this.summary.set(
            response.summary.data ?? null
          );

          this.mapSites.set(
            response.sites.data ?? []
          );

          this.criticalAlerts.set(
            response.alerts.data ?? []
          );

          this.activeWorkOrders.set(
            response.workOrders.data ?? []
          );
        },

        error: error => {
          this.resetDashboard();

          this.setPageError(
            error,
            'Unable to load the category dashboard.'
          );
        }
      });
  }

  private resetDashboard(): void {
    this.summary.set(null);
    this.mapSites.set([]);
    this.criticalAlerts.set([]);
    this.activeWorkOrders.set([]);
  }

  private hasValidCoordinates(
    site: DashboardMapSite
  ): boolean {
    const latitude = Number(site.latitude);
    const longitude = Number(site.longitude);

    return (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }

  private isSiteCategory(
    value: string | null | undefined
  ): value is SiteCategory {
    return Boolean(
      value &&
      SITE_CATEGORIES.includes(
        value as SiteCategory
      )
    );
  }
}