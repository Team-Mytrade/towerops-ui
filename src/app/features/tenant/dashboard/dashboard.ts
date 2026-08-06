import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../../core/auth/auth.service';
import { MapComponent } from '../../../shared/components/map/map';
import { MapMarker } from '../../../shared/components/map/map.models';

type HealthStatus = 'Healthy' | 'Warning' | 'Critical' | 'Offline';
type TagSeverity = 'success' | 'warn' | 'danger' | 'secondary' | 'info';
type WorkOrderStatus = 'In progress' | 'Assigned' | 'Scheduled';
type TrendTone = 'positive' | 'negative' | 'neutral';

interface SiteSnapshot {
  id: string;
  name: string;
  code: string;
  location: string;
  devices: number;
  uptime: number;
  alerts: number;
  status: HealthStatus;
  signal: number;
  battery: number;
  fuel: number;
  temperature: number;
  latitude: number;
  longitude: number;
}

interface WorkOrderSnapshot {
  id: string;
  title: string;
  site: string;
  assignee: string;
  due: string;
  status: WorkOrderStatus;
}

interface KpiSnapshot {
  label: string;
  value: string;
  note: string;
  icon: string;
  tone: string;
  trend: TrendTone;
}

const HEALTH_SEVERITY: Record<HealthStatus, TagSeverity> = {
  Healthy: 'success',
  Warning: 'warn',
  Critical: 'danger',
  Offline: 'secondary'
};

const WORK_ORDER_SEVERITY: Record<WorkOrderStatus, TagSeverity> = {
  'In progress': 'warn',
  Assigned: 'info',
  Scheduled: 'secondary'
};

@Component({
  selector: 'to-tenant-dashboard',
  standalone: true,
  imports: [FormsModule, ButtonModule, SelectModule, TagModule, MapComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TenantDashboardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly dateRange = signal('Last 30 days');
  readonly isRefreshing = signal(false);
  readonly selectedSiteId = signal('site-003');
  readonly category = signal((this.route.snapshot.paramMap.get('category') ?? 'TOWER').toUpperCase());
  readonly categoryLabel = computed(() => this.category().replaceAll('_', ' '));
  readonly currentUser = this.authService.currentUser;
  readonly dateRanges = ['Today', 'Last 7 days', 'Last 30 days', 'This quarter'];

  readonly sites: SiteSnapshot[] = [
    { id: 'site-001', name: 'Doha Central Tower', code: 'DOH-001', location: 'West Bay, Doha', devices: 24, uptime: 99.98, alerts: 0, status: 'Healthy', signal: 96, battery: 91, fuel: 78, temperature: 26, latitude: 25.326, longitude: 51.531 },
    { id: 'site-002', name: 'Al Rayyan Hub', code: 'RYN-014', location: 'Al Rayyan', devices: 18, uptime: 99.72, alerts: 2, status: 'Warning', signal: 72, battery: 64, fuel: 51, temperature: 34, latitude: 25.2919, longitude: 51.4244 },
    { id: 'site-003', name: 'Lusail North Station', code: 'LSL-008', location: 'Lusail', devices: 31, uptime: 98.46, alerts: 4, status: 'Critical', signal: 61, battery: 38, fuel: 29, temperature: 42, latitude: 25.4209, longitude: 51.4903 },
    { id: 'site-004', name: 'Al Wakrah Exchange', code: 'WKR-021', location: 'Al Wakrah', devices: 16, uptime: 99.91, alerts: 0, status: 'Healthy', signal: 94, battery: 87, fuel: 73, temperature: 27, latitude: 25.1715, longitude: 51.6034 },
    { id: 'site-005', name: 'Mesaieed Relay', code: 'MSD-006', location: 'Mesaieed', devices: 12, uptime: 97.82, alerts: 1, status: 'Offline', signal: 0, battery: 14, fuel: 22, temperature: 31, latitude: 24.9909, longitude: 51.5493 }
  ];

  readonly mapMarkers = computed<MapMarker[]>(() =>
    this.sites.map(site => ({
      id: site.id,
      latitude: site.latitude,
      longitude: site.longitude,
      title: site.name,
      subtitle: site.location,
      healthStatus: site.status.toUpperCase() as MapMarker['healthStatus'],
      siteCode: site.code,
      deviceCount: site.devices,
      openAlerts: site.alerts,
      data: site
    }))
  );

  readonly selectedSite = computed(() =>
    this.sites.find(site => site.id === this.selectedSiteId()) ?? this.sites[0]
  );

  readonly kpis: KpiSnapshot[] = [
    { label: 'Total sites', value: '128', note: '6 added this month', icon: 'pi-map-marker', tone: 'blue', trend: 'positive' },
    { label: 'Healthy', value: '118', note: '92.2% of network', icon: 'pi-heart', tone: 'green', trend: 'positive' },
    { label: 'Critical', value: '2', note: 'Needs immediate action', icon: 'pi-exclamation-triangle', tone: 'red', trend: 'negative' },
    { label: 'Active alerts', value: '23', note: '7 raised today', icon: 'pi-bell', tone: 'amber', trend: 'negative' },
    { label: 'Open tickets', value: '18', note: '6 due today', icon: 'pi-briefcase', tone: 'violet', trend: 'neutral' },
    { label: 'SLA breaches', value: '3', note: '97.6% compliant', icon: 'pi-shield', tone: 'cyan', trend: 'neutral' }
  ];

  readonly workOrders: WorkOrderSnapshot[] = [
    { id: 'WO-2841', title: 'Replace backup battery bank', site: 'Lusail North Station', assignee: 'Omar Khalid', due: 'Today, 4:30 PM', status: 'In progress' },
    { id: 'WO-2837', title: 'Inspect antenna alignment', site: 'Al Rayyan Hub', assignee: 'Maya Thomas', due: 'Tomorrow, 9:00 AM', status: 'Assigned' },
    { id: 'WO-2829', title: 'Quarterly generator service', site: 'Doha Central Tower', assignee: 'Field Team 2', due: 'Aug 6, 11:00 AM', status: 'Scheduled' }
  ];

  refresh(): void {
    this.isRefreshing.set(true);
    window.setTimeout(() => this.isRefreshing.set(false), 550);
  }

  selectSite(site: SiteSnapshot): void {
    this.selectedSiteId.set(site.id);
  }

  onMarkerSelected(marker: MapMarker): void {
    const site = marker.data as SiteSnapshot | undefined;

    if (site) {
      this.selectSite(site);
    }
  }

  open(path: string): void {
    void this.router.navigateByUrl(`/tenant/${path}`);
  }

  changeCategory(): void {
    void this.router.navigateByUrl('/tenant/categories');
  }

  healthSeverity(status: HealthStatus): TagSeverity {
    return HEALTH_SEVERITY[status];
  }

  workOrderSeverity(status: WorkOrderStatus): TagSeverity {
    return WORK_ORDER_SEVERITY[status];
  }
}
