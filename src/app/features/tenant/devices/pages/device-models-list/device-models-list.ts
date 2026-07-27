import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router
} from '@angular/router';

import {
  finalize
} from 'rxjs';

import {
  FormsModule
} from '@angular/forms';

import {
  ButtonModule
} from 'primeng/button';

import {
  InputTextModule
} from 'primeng/inputtext';

import {
  SelectModule
} from 'primeng/select';

import {
  TagModule
} from 'primeng/tag';

import {
  TableModule
} from 'primeng/table';

import {
  TooltipModule
} from 'primeng/tooltip';

import {
  ConfirmDialogModule
} from 'primeng/confirmdialog';

import {
  ConfirmationService
} from 'primeng/api';

import {
  BaseComponent
} from '../../../../../core/base/base.component';

import {
  DeviceCategory
} from '../../models/device.models';

import {
  DeviceModelService
} from '../../services/device-model.service';
import {
  DeviceConnectivityType,
  DeviceModel,
  DeviceProtocol
} from '../../models/device-model.models';

interface SelectOption<T> {
  label: string;
  value: T;
}

@Component({
  selector: 'to-device-models-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    TableModule,
    TooltipModule,
    ConfirmDialogModule
  ],
  providers: [
    ConfirmationService
  ],
  templateUrl: './device-models-list.html',
  styleUrl: './device-models-list.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class DeviceModelsListComponent extends BaseComponent {


  private readonly deviceModelService =
    inject(DeviceModelService);

  private readonly confirmationService =
    inject(ConfirmationService);

  readonly iloading = signal(false);

  readonly deviceModels =
    signal<DeviceModel[]>([]);

  readonly search = signal('');

  readonly categoryFilter =
    signal<DeviceCategory | null>(null);

  readonly protocolFilter =
    signal<DeviceProtocol | null>(null);

  readonly connectivityFilter =
    signal<DeviceConnectivityType | null>(
      null
    );

  readonly enabledFilter =
    signal<boolean | null>(null);

  readonly categoryOptions:
    SelectOption<DeviceCategory>[] = [
      {
        label: 'Sensor',
        value: 'SENSOR'
      },
      {
        label: 'Gateway',
        value: 'GATEWAY'
      },
      {
        label: 'Generator',
        value: 'GENERATOR'
      },
      {
        label: 'Power Meter',
        value: 'POWER_METER'
      },
      {
        label: 'Fuel Sensor',
        value: 'FUEL_SENSOR'
      },
      {
        label: 'Temperature Sensor',
        value: 'TEMPERATURE_SENSOR'
      },
      {
        label: 'Battery',
        value: 'BATTERY'
      },
      {
        label: 'Transmitter',
        value: 'TRANSMITTER'
      },
      {
        label: 'Receiver',
        value: 'RECEIVER'
      },
      {
        label: 'Network Device',
        value: 'NETWORK_DEVICE'
      },
      {
        label: 'Camera',
        value: 'CAMERA'
      },
      {
        label: 'Access Control',
        value: 'ACCESS_CONTROL'
      },
      {
        label: 'Other',
        value: 'OTHER'
      }
    ];

  readonly protocolOptions:
    SelectOption<DeviceProtocol>[] = [
      {
        label: 'MQTT',
        value: 'MQTT'
      },
      {
        label: 'HTTP',
        value: 'HTTP'
      },
      {
        label: 'HTTPS',
        value: 'HTTPS'
      },
      {
        label: 'Modbus',
        value: 'MODBUS'
      },
      {
        label: 'SNMP',
        value: 'SNMP'
      },
      {
        label: 'WebSocket',
        value: 'WEBSOCKET'
      },
      {
        label: 'LoRa',
        value: 'LORA'
      },
      {
        label: 'Zigbee',
        value: 'ZIGBEE'
      },
      {
        label: 'Bluetooth',
        value: 'BLE'
      },
      {
        label: 'Custom',
        value: 'CUSTOM'
      }
    ];

  readonly connectivityOptions:
    SelectOption<DeviceConnectivityType>[] = [
      {
        label: 'Ethernet',
        value: 'ETHERNET'
      },
      {
        label: 'Wi-Fi',
        value: 'WIFI'
      },
      {
        label: 'Cellular',
        value: 'CELLULAR'
      },
      {
        label: 'LoRa',
        value: 'LORA'
      },
      {
        label: 'Zigbee',
        value: 'ZIGBEE'
      },
      {
        label: 'Bluetooth',
        value: 'BLUETOOTH'
      },
      {
        label: 'Satellite',
        value: 'SATELLITE'
      },
      {
        label: 'Serial',
        value: 'SERIAL'
      },
      {
        label: 'Other',
        value: 'OTHER'
      }
    ];

  readonly statusOptions:
    SelectOption<boolean>[] = [
      {
        label: 'Enabled',
        value: true
      },
      {
        label: 'Disabled',
        value: false
      }
    ];

  readonly filteredDeviceModels =
    computed(() => {
      const search =
        this.search()
          .trim()
          .toLowerCase();

      const category =
        this.categoryFilter();

      const protocol =
        this.protocolFilter();

      const connectivity =
        this.connectivityFilter();

      const enabled =
        this.enabledFilter();

      return this.deviceModels().filter(
        model => {
          const matchesSearch =
            !search ||
            model.modelCode
              .toLowerCase()
              .includes(search) ||
            model.modelName
              .toLowerCase()
              .includes(search) ||
            (
              model.manufacturer ?? ''
            )
              .toLowerCase()
              .includes(search);

          const matchesCategory =
            !category ||
            model.category === category;

          const matchesProtocol =
            !protocol ||
            model.protocol === protocol;

          const matchesConnectivity =
            !connectivity ||
            model.connectivityType ===
              connectivity;

          const matchesEnabled =
            enabled === null ||
            model.enabled === enabled;

          return (
            matchesSearch &&
            matchesCategory &&
            matchesProtocol &&
            matchesConnectivity &&
            matchesEnabled
          );
        }
      );
    });

  readonly totalModels =
    computed(
      () => this.deviceModels().length
    );

  readonly enabledModels =
    computed(
      () =>
        this.deviceModels().filter(
          model => model.enabled
        ).length
    );

  readonly disabledModels =
    computed(
      () =>
        this.deviceModels().filter(
          model => !model.enabled
        ).length
    );

  readonly manufacturers =
    computed(() => {
      const values =
        this.deviceModels()
          .map(
            model =>
              model.manufacturer
          )
          .filter(
            (
              manufacturer
            ): manufacturer is string =>
              Boolean(manufacturer)
          );

      return new Set(values).size;
    });

  constructor() {
    super();

    this.loadDeviceModels();
  }

  loadDeviceModels(): void {
    this.loading.set(true);

    this.deviceModelService
      .getDeviceModels({
        page: 0,
        size: 200,
        sort: 'modelName,asc'
      })
      .pipe(
        this.untilDestroyed(),
        finalize(() =>
          this.loading.set(false)
        )
      )
      .subscribe({
        next: response => {
          this.deviceModels.set(
            response.data ?? []
          );
        },
        error: error => {
          this.deviceModels.set([]);

          this.showError(
            error,
            'Unable to load device models.'
          );
        }
      });
  }

  createDeviceModel(): void {
    void this.router.navigate([
      '/tenant/devices/models/create'
    ]);
  }

  viewDeviceModel(
    deviceModel: DeviceModel
  ): void {
    void this.router.navigate([
      '/tenant/devices/models',
      deviceModel.id
    ]);
  }

  editDeviceModel(
    deviceModel: DeviceModel
  ): void {
    void this.router.navigate([
      '/tenant/devices/models',
      deviceModel.id,
      'edit'
    ]);
  }

  confirmDelete(
    deviceModel: DeviceModel
  ): void {
    this.confirmationService.confirm({
      header: 'Delete device model',
      message:
        `Delete “${deviceModel.modelName}”? ` +
        'This action cannot be undone.',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass:
        'p-button-danger',
      accept: () =>
        this.deleteDeviceModel(
          deviceModel
        )
    });
  }

  toggleStatus(
    deviceModel: DeviceModel
  ): void {
    const enabled =
      !deviceModel.enabled;

    this.deviceModelService
      .changeStatus(
        deviceModel.id,
        enabled
      )
      .pipe(
        this.untilDestroyed()
      )
      .subscribe({
        next: response => {
          this.deviceModels.update(
            models =>
              models.map(model =>
                model.id ===
                deviceModel.id
                  ? response.data
                  : model
              )
          );

          this.toast.success(
            enabled
              ? 'Device model enabled.'
              : 'Device model disabled.'
          );
        },
        error: error => {
          this.showError(
            error,
            'Unable to update device model status.'
          );
        }
      });
  }

  clearFilters(): void {
    this.search.set('');
    this.categoryFilter.set(null);
    this.protocolFilter.set(null);
    this.connectivityFilter.set(null);
    this.enabledFilter.set(null);
  }

  formatEnum(
    value:
      | string
      | null
      | undefined
  ): string {
    if (!value) {
      return '—';
    }

    return value
      .toLowerCase()
      .split('_')
      .map(
        part =>
          part.charAt(0).toUpperCase() +
          part.slice(1)
      )
      .join(' ');
  }

  private deleteDeviceModel(
    deviceModel: DeviceModel
  ): void {
    this.deviceModelService
      .delete(deviceModel.id)
      .pipe(
        this.untilDestroyed()
      )
      .subscribe({
        next: () => {
          this.deviceModels.update(
            models =>
              models.filter(
                model =>
                  model.id !==
                  deviceModel.id
              )
          );

          this.toast.success(
            'Device model deleted successfully.'
          );
        },
        error: error => {
          this.showError(
            error,
            'Unable to delete the device model.'
          );
        }
      });
  }
}
