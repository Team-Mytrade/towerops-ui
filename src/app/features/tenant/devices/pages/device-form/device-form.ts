import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  finalize,
  forkJoin
} from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

import {
  BaseFormComponent
} from '../../../../../core/base/base-form.component';

import {
  Device,
  DeviceCategory,
  DeviceModel,
  DevicePayload,
  DeviceStatus
} from '../../models/device.models';

import {
  DeviceService
} from '../../services/device.service';


import {
  DeviceModelService
} from '../../services/device-model.service';

import {
  Site
} from '../../../sites/models/site.models';

import {
  SiteService
} from '../../../sites/services/site.service';

export type DeviceFormMode =
  | 'create'
  | 'edit';

interface SelectOption<T> {
  label: string;
  value: T;
}

interface DeviceModelOption
  extends SelectOption<number> {
  code: string;
  category?: string;
}

interface SiteOption
  extends SelectOption<number> {
  code: string;
  category?: string;
}

@Component({
  selector: 'to-device-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule
  ],
  templateUrl: './device-form.html',
  styleUrl: './device-form.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class DeviceFormComponent
  extends BaseFormComponent {

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly deviceService =
    inject(DeviceService);

  private readonly deviceModelService =
    inject(DeviceModelService);

  private readonly siteService =
    inject(SiteService);

  readonly mode =
    input<DeviceFormMode>('create');

  readonly device =
    input<Device | null>(null);

  readonly saved =
    output<Device>();

  readonly cancelled =
    output<void>();

  readonly lookupLoading =
    signal(false);

  readonly deviceModelOptions =
    signal<DeviceModelOption[]>([]);

  readonly siteOptions =
    signal<SiteOption[]>([]);

  readonly categoryOptions:
    SelectOption<DeviceCategory>[] = [
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
      { label: 'Active', value: 'ACTIVE' },
      { label: 'Online', value: 'ONLINE' },
      { label: 'Offline', value: 'OFFLINE' },
      { label: 'Inactive', value: 'INACTIVE' },
      { label: 'Maintenance', value: 'MAINTENANCE' },
      { label: 'Fault', value: 'FAULT' },
      { label: 'Retired', value: 'RETIRED' },
      { label: 'Unknown', value: 'UNKNOWN' }
    ];

  readonly form =
    this.formBuilder.nonNullable.group({
      deviceCode: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
          Validators.pattern(
            /^[A-Za-z0-9_-]+$/
          )
        ]
      ],

      serialNumber: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],

      deviceName: [
        '',
        [
          Validators.required,
          Validators.maxLength(150)
        ]
      ],

      category: [
        null as DeviceCategory | null,
        Validators.required
      ],

      deviceModelId: [
        null as number | null
      ],

      siteId: [
        null as number | null
      ],

      firmwareVersion: [
        '',
        Validators.maxLength(100)
      ],

      ipAddress: [
        '',
        Validators.maxLength(50)
      ],

      macAddress: [
        '',
        Validators.maxLength(50)
      ],

      status: [
        'ACTIVE' as DeviceStatus,
        Validators.required
      ]
    });

  constructor() {
    super();

    this.loadAssignmentLookups();

    effect(() => {
      const device =
        this.device();

      if (
        this.mode() === 'edit' &&
        device
      ) {
        this.patchDevice(device);
        return;
      }

      if (this.mode() === 'create') {
        this.resetToDefaults();
      }
    });
  }

  submit(): void {
    if (!this.validateForm()) {
      return;
    }

    const payload =
      this.buildPayload();

    const currentDevice =
      this.device();

    this.startSubmitting();

    const request =
      this.mode() === 'edit' &&
      currentDevice
        ? this.deviceService.update(
            currentDevice.id,
            payload
          )
        : this.deviceService.create(
            payload
          );

    request
      .pipe(
        this.untilDestroyed(),
        finalize(() =>
          this.stopSubmitting()
        )
      )
      .subscribe({
        next: response => {
          this.toast.success(
            this.mode() === 'edit'
              ? 'Device updated successfully.'
              : 'Device created successfully.'
          );

          this.saved.emit(
            response.data
          );
        },
        error: error => {
          this.showError(
            error,
            this.mode() === 'edit'
              ? 'Unable to update the device.'
              : 'Unable to create the device.'
          );
        }
      });
  }

  cancel(): void {
    this.cancelled.emit();
  }

  error(
    controlName: string,
    label: string
  ): string | null {
    return this.getControlError(
      controlName,
      label
    );
  }

  private loadAssignmentLookups(): void {
    this.lookupLoading.set(true);

    forkJoin({
      deviceModels:
        this.deviceModelService.getDeviceModels(),

      sites:
        this.siteService.getSites()
    })
      .pipe(
        this.untilDestroyed(),
        finalize(() =>
          this.lookupLoading.set(false)
        )
      )
      .subscribe({
        next: response => {
          this.deviceModelOptions.set(
            this.mapDeviceModels(
              response.deviceModels.data
            )
          );

          this.siteOptions.set(
            this.mapSites(
              response.sites.data
            )
          );
        },
        error: error => {
          this.deviceModelOptions.set([]);
          this.siteOptions.set([]);

          this.showError(
            error,
            'Unable to load device models and sites.'
          );
        }
      });
  }

  private mapDeviceModels(
    models: DeviceModel[]
  ): DeviceModelOption[] {
    return models
      .map(model => ({
        value: model.id,

        label:
          model.modelName ||
          model.modelCode ||
          `Device Model #${model.id}`,

        code:
          model.modelCode ||
          `MODEL-${model.id}`,

        category:
          model.category ?? undefined
      }))
      .sort((first, second) =>
        first.label.localeCompare(
          second.label
        )
      );
  }

  private mapSites(
    sites: Site[]
  ): SiteOption[] {
    return sites
      .map(site => ({
        value: site.id,

        label:
          site.siteName ||
          site.siteCode ||
          `Site #${site.id}`,

        code:
          site.siteCode ||
          `SITE-${site.id}`,

        category:
          site.category ?? undefined
      }))
      .sort((first, second) =>
        first.label.localeCompare(
          second.label
        )
      );
  }

  private buildPayload():
    DevicePayload {
    const value =
      this.form.getRawValue();

    return {
      deviceCode:
        value.deviceCode.trim(),

      serialNumber:
        value.serialNumber.trim(),

      deviceName:
        value.deviceName.trim(),

      category:
        value.category!,

      deviceModelId:
        value.deviceModelId,

      siteId:
        value.siteId,

      firmwareVersion:
        value.firmwareVersion.trim(),

      ipAddress:
        value.ipAddress.trim(),

      macAddress:
        value.macAddress.trim(),

      status:
        value.status
    };
  }

  private patchDevice(
    device: Device
  ): void {
    this.form.reset({
      deviceCode:
        device.deviceCode,

      serialNumber:
        device.serialNumber,

      deviceName:
        device.deviceName,

      category:
        device.category,

      deviceModelId:
        device.deviceModelId ?? null,

      siteId:
        device.siteId ?? null,

      firmwareVersion:
        device.firmwareVersion ?? '',

      ipAddress:
        device.ipAddress ?? '',

      macAddress:
        device.macAddress ?? '',

      status:
        device.status
    });

    this.submitted.set(false);
  }

  private resetToDefaults(): void {
    this.form.reset({
      deviceCode: '',
      serialNumber: '',
      deviceName: '',
      category: null,
      deviceModelId: null,
      siteId: null,
      firmwareVersion: '',
      ipAddress: '',
      macAddress: '',
      status: 'ACTIVE'
    });

    this.submitted.set(false);
  }
}