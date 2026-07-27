import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
} from '@angular/router';

import {
  finalize,
} from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

import { BaseComponent } from '../../../../../core/base/base.component';

import {
  DeviceCategory,
} from '../../models/device.models';

import {
  DeviceConnectivityType,
  DeviceModel,
  DeviceModelPayload,
  DeviceProtocol,
} from '../../models/device-model.models';

import {
  DeviceModelService,
} from '../../services/device-model.service';

type DeviceModelFormMode =
  | 'CREATE'
  | 'EDIT';

interface SelectOption<T> {
  label: string;
  value: T;
}

@Component({
  selector: 'to-device-model-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './device-model-form.html',
  styleUrl: './device-model-form.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush,
})
export class DeviceModelFormComponent
  extends BaseComponent {

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly deviceModelService =
    inject(DeviceModelService);

  readonly saving = signal(false);

  readonly deviceModel =
    signal<DeviceModel | null>(null);

  readonly deviceModelId =
    signal<number | null>(null);

  readonly formMode =
    signal<DeviceModelFormMode>('CREATE');

  readonly isEditMode = computed(
    () => this.formMode() === 'EDIT',
  );

  readonly pageTitle = computed(
    () =>
      this.isEditMode()
        ? 'Edit Device Model'
        : 'Create Device Model',
  );

  readonly pageDescription = computed(
    () =>
      this.isEditMode()
        ? 'Update the hardware definition, connectivity and telemetry defaults.'
        : 'Create a reusable hardware definition for devices across tenant sites.',
  );

  readonly categoryOptions:
    SelectOption<DeviceCategory>[] = [
      {
        label: 'Sensor',
        value: 'SENSOR',
      },
      {
        label: 'Gateway',
        value: 'GATEWAY',
      },
      {
        label: 'Generator',
        value: 'GENERATOR',
      },
      {
        label: 'Power Meter',
        value: 'POWER_METER',
      },
      {
        label: 'Fuel Sensor',
        value: 'FUEL_SENSOR',
      },
      {
        label: 'Temperature Sensor',
        value: 'TEMPERATURE_SENSOR',
      },
      {
        label: 'Battery',
        value: 'BATTERY',
      },
      {
        label: 'Transmitter',
        value: 'TRANSMITTER',
      },
      {
        label: 'Receiver',
        value: 'RECEIVER',
      },
      {
        label: 'Network Device',
        value: 'NETWORK_DEVICE',
      },
      {
        label: 'Camera',
        value: 'CAMERA',
      },
      {
        label: 'Access Control',
        value: 'ACCESS_CONTROL',
      },
      {
        label: 'Other',
        value: 'OTHER',
      },
    ];

  readonly protocolOptions:
    SelectOption<DeviceProtocol>[] = [
      {
        label: 'MQTT',
        value: 'MQTT',
      },
      {
        label: 'HTTP',
        value: 'HTTP',
      },
      {
        label: 'HTTPS',
        value: 'HTTPS',
      },
      {
        label: 'Modbus',
        value: 'MODBUS',
      },
      {
        label: 'SNMP',
        value: 'SNMP',
      },
      {
        label: 'WebSocket',
        value: 'WEBSOCKET',
      },
      {
        label: 'LoRa',
        value: 'LORA',
      },
      {
        label: 'Zigbee',
        value: 'ZIGBEE',
      },
      {
        label: 'Bluetooth',
        value: 'BLE',
      },
      {
        label: 'Custom',
        value: 'CUSTOM',
      },
    ];

  readonly connectivityOptions:
    SelectOption<DeviceConnectivityType>[] = [
      {
        label: 'Ethernet',
        value: 'ETHERNET',
      },
      {
        label: 'Wi-Fi',
        value: 'WIFI',
      },
      {
        label: 'Cellular',
        value: 'CELLULAR',
      },
      {
        label: 'LoRa',
        value: 'LORA',
      },
      {
        label: 'Zigbee',
        value: 'ZIGBEE',
      },
      {
        label: 'Bluetooth',
        value: 'BLUETOOTH',
      },
      {
        label: 'Satellite',
        value: 'SATELLITE',
      },
      {
        label: 'Serial',
        value: 'SERIAL',
      },
      {
        label: 'Other',
        value: 'OTHER',
      },
    ];

  readonly metricOptions = [
    'temperature',
    'humidity',
    'fuelLevel',
    'batteryVoltage',
    'batteryPercentage',
    'signalStrength',
    'powerStatus',
    'generatorStatus',
    'generatorRuntime',
    'current',
    'voltage',
    'frequency',
    'energyConsumption',
    'networkLatency',
    'packetLoss',
    'doorStatus',
    'motionDetected',
  ];

  readonly form =
    this.formBuilder.nonNullable.group({
      modelCode: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
        ],
      ],

      modelName: [
        '',
        [
          Validators.required,
          Validators.maxLength(120),
        ],
      ],

      manufacturer: [
        '',
        [
          Validators.maxLength(120),
        ],
      ],

      category: [
        null as DeviceCategory | null,
        [
          Validators.required,
        ],
      ],

      description: [
        '',
        [
          Validators.maxLength(1000),
        ],
      ],

      protocol: [
        null as DeviceProtocol | null,
      ],

      connectivityType: [
        null as DeviceConnectivityType | null,
      ],

      defaultFirmwareVersion: [
        '',
        [
          Validators.maxLength(80),
        ],
      ],

      supportedMetrics: [
        [] as string[],
      ],

      samplingIntervalSeconds: [
        null as number | null,
        [
          Validators.min(1),
          Validators.max(86400),
        ],
      ],

      heartbeatIntervalSeconds: [
        null as number | null,
        [
          Validators.min(1),
          Validators.max(86400),
        ],
      ],

      enabled: [
        true,
      ],
    });

  constructor() {
    super();

    this.resolveMode();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      this.toast.error(
        'Please complete the required fields.',
      );

      return;
    }

    if (this.saving()) {
      return;
    }

    const payload = this.buildPayload();

    if (this.isEditMode()) {
      this.updateDeviceModel(payload);
      return;
    }

    this.createDeviceModel(payload);
  }

  cancel(): void {
    if (
      this.isEditMode() &&
      this.deviceModelId()
    ) {
      void this.router.navigate([
        '/tenant/devices/models',
        this.deviceModelId(),
      ]);

      return;
    }

    void this.router.navigate([
      '/tenant/devices/models',
    ]);
  }

  hasError(
    controlName: keyof typeof this.form.controls,
    errorName: string,
  ): boolean {
    const control =
      this.form.controls[controlName];

    return (
      control.touched &&
      control.hasError(errorName)
    );
  }

  toggleMetric(
    metric: string,
  ): void {
    const control =
      this.form.controls.supportedMetrics;

    const currentValues =
      control.value ?? [];

    const exists =
      currentValues.includes(metric);

    const nextValues =
      exists
        ? currentValues.filter(
            (value) => value !== metric,
          )
        : [
            ...currentValues,
            metric,
          ];

    control.setValue(nextValues);
    control.markAsDirty();
  }

  isMetricSelected(
    metric: string,
  ): boolean {
    return this.form.controls
      .supportedMetrics
      .value
      .includes(metric);
  }

  formatMetricLabel(
    metric: string,
  ): string {
    return metric
      .replace(
        /([a-z])([A-Z])/g,
        '$1 $2',
      )
      .replace(
        /_/g,
        ' ',
      )
      .replace(
        /\b\w/g,
        (character) =>
          character.toUpperCase(),
      );
  }

 private resolveMode(): void {
  const routeId =
    this.activatedRoute
      .snapshot
      .paramMap
      .get('id');

  if (!routeId) {
    this.formMode.set('CREATE');
    return;
  }

  const deviceModelId =
    Number(routeId);

  if (
    !Number.isFinite(deviceModelId) ||
    deviceModelId <= 0
  ) {
    this.toast.error(
      'Invalid device model identifier.',
    );

    void this.router.navigate([
      '/tenant/devices/models',
    ]);

    return;
  }

  this.formMode.set('EDIT');
  this.deviceModelId.set(deviceModelId);

  this.loadDeviceModel(deviceModelId);
}

  private loadDeviceModel(
    deviceModelId: number,
  ): void {
    this.loading.set(true);

    this.form.disable({
      emitEvent: false,
    });

    this.deviceModelService
      .getById(deviceModelId)
      .pipe(
        this.untilDestroyed(),
        finalize(() => {
          this.loading.set(false);

          this.form.enable({
            emitEvent: false,
          });
        }),
      )
      .subscribe({
        next: (response) => {
          this.deviceModel.set(
            response.data,
          );

          this.patchForm(
            response.data,
          );
        },
        error: (error: unknown) => {
          this.showError(
            error,
            'Unable to load the device model.',
          );

          void this.router.navigate([
            '/tenant/devices/models',
          ]);
        },
      });
  }

  private patchForm(
    deviceModel: DeviceModel,
  ): void {
    this.form.patchValue({
      modelCode:
        deviceModel.modelCode ?? '',

      modelName:
        deviceModel.modelName ?? '',

      manufacturer:
        deviceModel.manufacturer ?? '',

      category:
        deviceModel.category ?? null,

      description:
        deviceModel.description ?? '',

      protocol:
        deviceModel.protocol ?? null,

      connectivityType:
        deviceModel.connectivityType ?? null,

      defaultFirmwareVersion:
        deviceModel.defaultFirmwareVersion ?? '',

      supportedMetrics:
        deviceModel.supportedMetrics ?? [],

      samplingIntervalSeconds:
        deviceModel.samplingIntervalSeconds ??
        null,

      heartbeatIntervalSeconds:
        deviceModel.heartbeatIntervalSeconds ??
        null,

      enabled:
        deviceModel.enabled ?? true,
    });

    this.form.markAsPristine();
  }

  private buildPayload():
    DeviceModelPayload {
    const value =
      this.form.getRawValue();

    return {
      modelCode:
        value.modelCode.trim(),

      modelName:
        value.modelName.trim(),

      manufacturer:
        this.toNullableString(
          value.manufacturer,
        ),

      category:
        value.category!,

      description:
        this.toNullableString(
          value.description,
        ),

      protocol:
        value.protocol,

      connectivityType:
        value.connectivityType,

      defaultFirmwareVersion:
        this.toNullableString(
          value.defaultFirmwareVersion,
        ),

      supportedMetrics:
        value.supportedMetrics,

      samplingIntervalSeconds:
        value.samplingIntervalSeconds,

      heartbeatIntervalSeconds:
        value.heartbeatIntervalSeconds,

      enabled:
        value.enabled,
    };
  }

  private createDeviceModel(
    payload: DeviceModelPayload,
  ): void {
    this.saving.set(true);

    this.deviceModelService
      .create(payload)
      .pipe(
        this.untilDestroyed(),
        finalize(() => {
          this.saving.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.toast.success(
            'Device model created successfully.',
          );

          void this.router.navigate([
            '/tenant/devices/models',
            response.data.id,
          ]);
        },
        error: (error: unknown) => {
          this.showError(
            error,
            'Unable to create the device model.',
          );
        },
      });
  }

  private updateDeviceModel(
    payload: DeviceModelPayload,
  ): void {
    const deviceModelId =
      this.deviceModelId();

    if (!deviceModelId) {
      return;
    }

    this.saving.set(true);

    this.deviceModelService
      .update(
        deviceModelId,
        payload,
      )
      .pipe(
        this.untilDestroyed(),
        finalize(() => {
          this.saving.set(false);
        }),
      )
      .subscribe({
        next: (response) => {
          this.toast.success(
            'Device model updated successfully.',
          );

          void this.router.navigate([
            '/tenant/devices/models',
            response.data.id,
          ]);
        },
        error: (error: unknown) => {
          this.showError(
            error,
            'Unable to update the device model.',
          );
        },
      });
  }

  private toNullableString(
    value: string,
  ): string | null {
    const normalized =
      value.trim();

    return normalized || null;
  }
}