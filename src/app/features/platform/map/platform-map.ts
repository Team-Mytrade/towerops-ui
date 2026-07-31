import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

import { SiteHealthStatus } from '../../../core/models/application.enums';
import { MapComponent } from '../../../shared/components/map/map';
import { MapMarker } from '../../../shared/components/map/map.models';

interface HealthFilterOption {
  label: string;
  value: SiteHealthStatus | null;
}

@Component({
  selector: 'to-platform-map',
  standalone: true,
  imports: [
    FormsModule,
    InputTextModule,
    SelectModule,
    MapComponent
  ],
  templateUrl: './platform-map.html',
  styleUrl: './platform-map.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlatformMapComponent {
  readonly search = signal('');
  readonly healthFilter = signal<SiteHealthStatus | null>(null);
  readonly selectedMarker = signal<MapMarker | null>(null);

  readonly healthOptions: HealthFilterOption[] = [
    { label: 'All health states', value: null },
    { label: 'Healthy', value: 'HEALTHY' },
    { label: 'Warning', value: 'WARNING' },
    { label: 'Critical', value: 'CRITICAL' },
    { label: 'Offline', value: 'OFFLINE' }
  ];

  readonly markers: MapMarker[] = [
    { id: 1, latitude: 26.1383, longitude: 51.2158, title: 'Tower DOH-001', subtitle: 'Enterprise Corp · Al Ruwais', category: 'TOWER', healthStatus: 'HEALTHY', siteCode: 'DOH-001', deviceCount: 8, openAlerts: 0 },
    { id: 2, latitude: 26.08, longitude: 51.23, title: 'Tower DOH-002', subtitle: 'Enterprise Corp · Al Ruwais North', category: 'TOWER', healthStatus: 'HEALTHY', siteCode: 'DOH-002', deviceCount: 6, openAlerts: 0 },
    { id: 3, latitude: 25.6804, longitude: 51.4969, title: 'Tower DOH-003', subtitle: 'Global Telecom · Al Khor', category: 'TOWER', healthStatus: 'HEALTHY', siteCode: 'DOH-003', deviceCount: 12, openAlerts: 1 },
    { id: 4, latitude: 25.64, longitude: 51.45, title: 'Tower DOH-004', subtitle: 'Global Telecom · Al Khor West', category: 'TOWER', healthStatus: 'WARNING', siteCode: 'DOH-004', deviceCount: 5, openAlerts: 2 },
    { id: 5, latitude: 25.38, longitude: 51.48, title: 'Tower DOH-005', subtitle: 'City Grid Systems · Doha North', category: 'TOWER', healthStatus: 'HEALTHY', siteCode: 'DOH-005', deviceCount: 9, openAlerts: 0 },
    { id: 6, latitude: 25.2854, longitude: 51.531, title: 'Tower DOH-006', subtitle: 'City Grid Systems · Doha Central', category: 'TOWER', healthStatus: 'HEALTHY', siteCode: 'DOH-006', deviceCount: 14, openAlerts: 0 },
    { id: 7, latitude: 25.27, longitude: 51.52, title: 'Tower DOH-007', subtitle: 'Enterprise Corp · Doha Main', category: 'TOWER', healthStatus: 'CRITICAL', siteCode: 'DOH-007', deviceCount: 10, openAlerts: 4 },
    { id: 8, latitude: 25.3, longitude: 51.55, title: 'Tower DOH-008', subtitle: 'Global Telecom · Doha Port', category: 'TOWER', healthStatus: 'HEALTHY', siteCode: 'DOH-008', deviceCount: 7, openAlerts: 1 },
    { id: 9, latitude: 25.2919, longitude: 51.4244, title: 'Tower DOH-009', subtitle: 'City Grid Systems · Rayyan Hub', category: 'TOWER', healthStatus: 'HEALTHY', siteCode: 'DOH-009', deviceCount: 11, openAlerts: 0 },
    { id: 10, latitude: 25.17, longitude: 51.43, title: 'Tower DOH-010', subtitle: 'Enterprise Corp · Industrial Area', category: 'TOWER', healthStatus: 'WARNING', siteCode: 'DOH-010', deviceCount: 6, openAlerts: 2 },
    { id: 11, latitude: 25.1712, longitude: 51.6034, title: 'Tower DOH-011', subtitle: 'Global Telecom · Al Wakrah', category: 'TOWER', healthStatus: 'HEALTHY', siteCode: 'DOH-011', deviceCount: 8, openAlerts: 0 },
    { id: 12, latitude: 24.9906, longitude: 51.5492, title: 'Tower DOH-012', subtitle: 'City Grid Systems · Mesaieed', category: 'TOWER', healthStatus: 'OFFLINE', siteCode: 'DOH-012', deviceCount: 4, openAlerts: 3 }
  ];

  readonly visibleMarkers = computed(() => {
    const search = this.search().trim().toLowerCase();
    const health = this.healthFilter();

    return this.markers.filter(marker => {
      const matchesSearch =
        !search ||
        marker.title.toLowerCase().includes(search) ||
        marker.siteCode?.toLowerCase().includes(search) ||
        marker.subtitle?.toLowerCase().includes(search);

      return matchesSearch && (!health || marker.healthStatus === health);
    });
  });

  readonly healthyCount = computed(
    () => this.markers.filter(marker => marker.healthStatus === 'HEALTHY').length
  );
  readonly attentionCount = computed(
    () => this.markers.filter(marker =>
      marker.healthStatus === 'WARNING' || marker.healthStatus === 'CRITICAL'
    ).length
  );
  readonly offlineCount = computed(
    () => this.markers.filter(marker => marker.healthStatus === 'OFFLINE').length
  );
  readonly openAlertCount = computed(
    () => this.markers.reduce((total, marker) => total + (marker.openAlerts ?? 0), 0)
  );

  selectMarker(marker: MapMarker): void {
    this.selectedMarker.set(marker);
  }

  clearFilters(): void {
    this.search.set('');
    this.healthFilter.set(null);
  }
}
