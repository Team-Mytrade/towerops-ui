import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';

import { MapComponent } from '../../../shared/components/map/map';
import { MapMarker } from '../../../shared/components/map/map.models';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge';

@Component({
  selector: 'to-platform-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    SelectModule,
    TagModule,
    ProgressBarModule,
    TooltipModule,
    MapComponent,
    StatusBadgeComponent
  ],
  templateUrl: './platform-dashboard.html',
  styleUrl: './platform-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlatformDashboard implements OnInit, OnDestroy {
  readonly selectedCustomer = signal<string>('All Customers');
  readonly selectedDateRange = signal<string>('May 20, 2025 - May 20, 2025');
  readonly isRefreshing = signal<boolean>(false);
  readonly currentTime = signal<string>('');
  readonly activeMarker = signal<MapMarker | null>(null);

  readonly customers = [
    'All Customers',
    'Enterprise Corp',
    'Global Telecom',
    'City Grid Systems'
  ];

  readonly dateRanges = [
    'May 20, 2025 - May 20, 2025',
    'Last 7 Days',
    'Last 30 Days',
    'This Month',
    'Year to Date'
  ];

  readonly mapMarkers: MapMarker[] = [
    { id: '1', latitude: 26.1383, longitude: 51.2158, title: 'Tower DOH-001', subtitle: 'Al Ruwais', category: 'TOWER', healthStatus: 'HEALTHY', siteCode: 'DOH-001', deviceCount: 8, openAlerts: 0, popupEnabled: true },
    { id: '2', latitude: 26.0800, longitude: 51.2300, title: 'Tower DOH-002', subtitle: 'Al Ruwais North', category: 'TOWER', healthStatus: 'HEALTHY', siteCode: 'DOH-002', deviceCount: 6, openAlerts: 0, popupEnabled: true },
    { id: '3', latitude: 25.6804, longitude: 51.4969, title: 'Tower DOH-003', subtitle: 'Al Khor Central', category: 'TOWER', healthStatus: 'HEALTHY', siteCode: 'DOH-003', deviceCount: 12, openAlerts: 1, popupEnabled: true },
    { id: '4', latitude: 25.6400, longitude: 51.4500, title: 'Tower DOH-004', subtitle: 'Al Khor West', category: 'TOWER', healthStatus: 'WARNING', siteCode: 'DOH-004', deviceCount: 5, openAlerts: 2, popupEnabled: true },
    { id: '5', latitude: 25.3800, longitude: 51.4800, title: 'Tower DOH-005', subtitle: 'Doha North', category: 'TOWER', healthStatus: 'HEALTHY', siteCode: 'DOH-005', deviceCount: 9, openAlerts: 0, popupEnabled: true },
    { id: '6', latitude: 25.2854, longitude: 51.5310, title: 'Tower DOH-006', subtitle: 'Doha Central', category: 'TOWER', healthStatus: 'HEALTHY', siteCode: 'DOH-006', deviceCount: 14, openAlerts: 0, popupEnabled: true },
    { id: '7', latitude: 25.2700, longitude: 51.5200, title: 'Tower DOH-007', subtitle: 'Doha Main', category: 'TOWER', healthStatus: 'CRITICAL', siteCode: 'DOH-007', deviceCount: 10, openAlerts: 4, popupEnabled: true },
    { id: '8', latitude: 25.3000, longitude: 51.5500, title: 'Tower DOH-008', subtitle: 'Doha Port', category: 'TOWER', healthStatus: 'HEALTHY', siteCode: 'DOH-008', deviceCount: 7, openAlerts: 1, popupEnabled: true },
    { id: '9', latitude: 25.2919, longitude: 51.4244, title: 'Tower DOH-009', subtitle: 'Rayyan Hub', category: 'TOWER', healthStatus: 'HEALTHY', siteCode: 'DOH-009', deviceCount: 11, openAlerts: 0, popupEnabled: true },
    { id: '10', latitude: 25.1700, longitude: 51.4300, title: 'Tower DOH-010', subtitle: 'Industrial Area', category: 'TOWER', healthStatus: 'WARNING', siteCode: 'DOH-010', deviceCount: 6, openAlerts: 2, popupEnabled: true },
    { id: '11', latitude: 25.1712, longitude: 51.6034, title: 'Tower DOH-011', subtitle: 'Al Wakrah Coast', category: 'TOWER', healthStatus: 'HEALTHY', siteCode: 'DOH-011', deviceCount: 8, openAlerts: 0, popupEnabled: true },
    { id: '12', latitude: 24.9906, longitude: 51.5492, title: 'Tower DOH-012', subtitle: 'Mesaieed South', category: 'TOWER', healthStatus: 'OFFLINE', siteCode: 'DOH-012', deviceCount: 4, openAlerts: 3, popupEnabled: true },
    { id: '13', latitude: 24.8500, longitude: 51.4500, title: 'Tower DOH-013', subtitle: 'South Grid', category: 'TOWER', healthStatus: 'HEALTHY', siteCode: 'DOH-013', deviceCount: 6, openAlerts: 0, popupEnabled: true },
    { id: '14', latitude: 25.8000, longitude: 51.5200, title: 'Tower DOH-014', subtitle: 'Coast North', category: 'TOWER', healthStatus: 'HEALTHY', siteCode: 'DOH-014', deviceCount: 9, openAlerts: 0, popupEnabled: true },
    { id: '15', latitude: 25.5000, longitude: 51.5800, title: 'Tower DOH-015', subtitle: 'East Hub', category: 'TOWER', healthStatus: 'HEALTHY', siteCode: 'DOH-015', deviceCount: 10, openAlerts: 0, popupEnabled: true }
  ];

  private timerId: any;

  ngOnInit(): void {
    this.updateClock();
    this.timerId = setInterval(() => this.updateClock(), 1000);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  updateClock(): void {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const pad = (num: number) => num.toString().padStart(2, '0');
    this.currentTime.set(`${pad(hours)}:${pad(minutes)}:${pad(seconds)} ${ampm}`);
  }

  refresh(): void {
    this.isRefreshing.set(true);
    setTimeout(() => {
      this.isRefreshing.set(false);
    }, 600);
  }

  onMarkerSelected(marker: MapMarker): void {
    this.activeMarker.set(marker);
  }

  exportData(): void {
    console.log('Exporting executive dashboard data...');
  }
}