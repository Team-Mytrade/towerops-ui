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
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

import { BaseComponent } from '../../../../../core/base/base.component';

import {
  Device,
  DeviceCategory,
  DeviceStatus
} from '../../models/device.models';

import { DeviceService } from '../../services/device.service';
import { DeviceFormComponent, DeviceFormMode } from '../device-form/device-form';

interface SelectOption<T> {
  label: string;
  value: T | null;
}

@Component({
  selector: 'to-devices-list',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    TitleCasePipe,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    DeviceFormComponent,
  ],
  templateUrl: './devices-list.html',
  styleUrl: './devices-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevicesListComponent extends BaseComponent {
  private readonly deviceService = inject(DeviceService);

  readonly devices = signal<Device[]>([]);
  readonly selectedDevice = signal<Device | null>(null);

  readonly search = signal('');
  readonly categoryFilter =
    signal<DeviceCategory | null>(null);
  readonly statusFilter =
    signal<DeviceStatus | null>(null);

  readonly categoryOptions:
    SelectOption<DeviceCategory>[] = [
      { label: 'All categories', value: null },
      { label: 'Sensor', value: 'SENSOR' },
      { label: 'Gateway', value: 'GATEWAY' },
      { label: 'Generator', value: 'GENERATOR' },
      { label: 'Power Meter', value: 'POWER_METER' },
      { label: 'Fuel Sensor', value: 'FUEL_SENSOR' },
      {
        label: 'Temperature Sensor',
        value: 'TEMPERATURE_SENSOR'
      },
      { label: 'Battery', value: 'BATTERY' },
      { label: 'Transmitter', value: 'TRANSMITTER' },
      { label: 'Receiver', value: 'RECEIVER' },
      {
        label: 'Network Device',
        value: 'NETWORK_DEVICE'
      },
      { label: 'Camera', value: 'CAMERA' },
      {
        label: 'Access Control',
        value: 'ACCESS_CONTROL'
      },
      { label: 'Other', value: 'OTHER' }
    ];

  readonly statusOptions:
    SelectOption<DeviceStatus>[] = [
      { label: 'All statuses', value: null },
      { label: 'Online', value: 'ONLINE' },
      { label: 'Active', value: 'ACTIVE' },
      { label: 'Offline', value: 'OFFLINE' },
      { label: 'Inactive', value: 'INACTIVE' },
      { label: 'Maintenance', value: 'MAINTENANCE' },
      { label: 'Fault', value: 'FAULT' },
      { label: 'Retired', value: 'RETIRED' },
      { label: 'Unknown', value: 'UNKNOWN' }
    ];

  readonly filteredDevices = computed(() => {
    const search =
      this.search().trim().toLowerCase();

    return this.devices().filter(device => {
      const matchesSearch =
        !search ||
        device.deviceName
          .toLowerCase()
          .includes(search) ||
        device.deviceCode
          .toLowerCase()
          .includes(search) ||
        device.serialNumber
          .toLowerCase()
          .includes(search) ||
        (device.siteName ?? '')
          .toLowerCase()
          .includes(search) ||
        (device.siteCode ?? '')
          .toLowerCase()
          .includes(search);

      const matchesCategory =
        !this.categoryFilter() ||
        device.category === this.categoryFilter();

      const matchesStatus =
        !this.statusFilter() ||
        device.status === this.statusFilter();

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  });

  readonly totalDevices = computed(
    () => this.filteredDevices().length
  );

  readonly onlineDevices = computed(
    () =>
      this.filteredDevices().filter(
        device =>
          device.status === 'ONLINE' ||
          device.status === 'ACTIVE'
      ).length
  );

  readonly offlineDevices = computed(
    () =>
      this.filteredDevices().filter(
        device => device.status === 'OFFLINE'
      ).length
  );

  readonly maintenanceDevices = computed(
    () =>
      this.filteredDevices().filter(
        device => device.status === 'MAINTENANCE'
      ).length
  );
readonly formMode =
  signal<DeviceFormMode | null>(null);

readonly editingDevice =
  signal<Device | null>(null);
  readonly faultDevices = computed(
    () =>
      this.filteredDevices().filter(
        device => device.status === 'FAULT'
      ).length
  );

constructor() {
  super();

  this.activatedRoute.queryParamMap
    .pipe(this.untilDestroyed())
    .subscribe(params => {
      const siteId = this.parsePositiveNumber(
        params.get('siteId')
      );

      const mode = params.get('mode');

      const deviceId = this.parsePositiveNumber(
        params.get('deviceId')
      );

      if (mode === 'create') {
        this.formMode.set('create');
        this.editingDevice.set(null);
      } else if (mode === 'edit' && deviceId) {
        this.formMode.set('edit');

        const existingDevice =
          this.devices().find(
            device => device.id === deviceId
          );

        if (existingDevice) {
          this.editingDevice.set(existingDevice);
        } else {
          this.loadDeviceForEdit(deviceId);
        }
      } else {
        this.closeFormState();
      }

      this.loadDevices(siteId);
    });
}

  refresh(): void {
    const siteId = Number(
      this.activatedRoute.snapshot
        .queryParamMap
        .get('siteId')
    );

    this.loadDevices(
      Number.isInteger(siteId) && siteId > 0
        ? siteId
        : undefined
    );
  }

createDevice(): void {
  void this.navigate([], {
    relativeTo: this.activatedRoute,
    queryParams: {
      mode: 'create',
      deviceId: null
    },
    queryParamsHandling: 'merge'
  });
}

  selectDevice(device: Device): void {
    this.selectedDevice.set(device);
  }

  closeDetails(): void {
    this.selectedDevice.set(null);
  }

  openDevice(device: Device): void {
    void this.navigateByUrl(
      `/tenant/devices/${device.id}`
    );
  }

editDevice(device: Device): void {
  this.selectedDevice.set(null);

  void this.navigate([], {
    relativeTo: this.activatedRoute,
    queryParams: {
      mode: 'edit',
      deviceId: device.id
    },
    queryParamsHandling: 'merge'
  });
}

  clearFilters(): void {
    this.search.set('');
    this.categoryFilter.set(null);
    this.statusFilter.set(null);
  }

  statusSeverity(
    status: DeviceStatus
  ): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    switch (status) {
      case 'ONLINE':
      case 'ACTIVE':
        return 'success';

      case 'MAINTENANCE':
        return 'warn';

      case 'FAULT':
        return 'danger';

      case 'OFFLINE':
      case 'INACTIVE':
      case 'RETIRED':
        return 'secondary';

      default:
        return 'info';
    }
  }
closeForm(): void {
  void this.navigate([], {
    relativeTo: this.activatedRoute,
    queryParams: {
      mode: null,
      deviceId: null
    },
    queryParamsHandling: 'merge'
  });
}

onDeviceSaved(device: Device): void {
  this.devices.update(currentDevices => {
    const exists = currentDevices.some(
      current => current.id === device.id
    );

    if (!exists) {
      return [
        device,
        ...currentDevices
      ];
    }

    return currentDevices.map(current =>
      current.id === device.id
        ? device
        : current
    );
  });

  this.selectedDevice.set(device);
  this.closeForm();
}

private loadDeviceForEdit(deviceId: number): void {
  this.deviceService
    .getById(deviceId)
    .pipe(this.untilDestroyed())
    .subscribe({
      next: response => {
        this.editingDevice.set(response.data);
      },
      error: error => {
        this.showError(
          error,
          'Unable to load the device for editing.'
        );

        this.closeForm();
      }
    });
}

private closeFormState(): void {
  this.formMode.set(null);
  this.editingDevice.set(null);
}

private parsePositiveNumber(
  value: string | null
): number | undefined {
  const parsedValue = Number(value);

  return (
    Number.isInteger(parsedValue) &&
    parsedValue > 0
  )
    ? parsedValue
    : undefined;
}
  healthClass(
    healthScore?: number | null
  ): string {
    if (healthScore === null || healthScore === undefined) {
      return 'to-device-health--unknown';
    }

    if (healthScore >= 80) {
      return 'to-device-health--healthy';
    }

    if (healthScore >= 50) {
      return 'to-device-health--warning';
    }

    return 'to-device-health--critical';
  }

  private loadDevices(siteId?: number): void {
    this.startLoading();
    this.clearPageError();

    this.deviceService
      .getDevices({
        siteId,
        page: 0,
        size: 500,
        sort: 'deviceName,asc'
      })
      .pipe(
        this.untilDestroyed(),
        finalize(() => this.stopLoading())
      )
      .subscribe({
        next: response => {
          this.devices.set(response.data ?? []);
        },
        error: error => {
          this.setPageError(
            error,
            'Unable to load devices.'
          );
        }
      });
  }
}