import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

import {
  BaseFormComponent
} from '../../../../../core/base/base-form.component';

import {
  Priority,
  Severity,
  TicketSource
} from '../../../../../core/models/application.enums';

import {
  Site
} from '../../../sites/models/site.models';

import {
  SiteService
} from '../../../sites/services/site.service';

import {
  Device
} from '../../../devices/models/device.models';

import {
  DeviceService
} from '../../../devices/services/device.service';

import {
  Alert
} from '../../../alerts/models/alert.models';

import {
  AlertService
} from '../../../alerts/services/alert.service';

import {
  Ticket,
  TicketPayload
} from '../../models/ticket.models';

import {
  TicketService
} from '../../services/ticket.service';
import { Technician } from '../../../../technician/models/technician.models';
import { TechnicianService } from '../../../../technician/services/technician.service';

export type TicketFormMode =
  | 'create'
  | 'edit';

interface SelectOption<T> {
  label: string;
  value: T;
}

@Component({
  selector: 'to-ticket-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    InputTextModule,
    SelectModule,
    TextareaModule
  ],
  templateUrl: './ticket-form.html',
  styleUrl: './ticket-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketFormComponent
  extends BaseFormComponent {

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly ticketService =
    inject(TicketService);

  private readonly siteService =
    inject(SiteService);

  private readonly deviceService =
    inject(DeviceService);

  private readonly alertService =
    inject(AlertService);

  private readonly technicianService =
    inject(TechnicianService);

  readonly mode =
    input<TicketFormMode>('create');

  readonly ticket =
    input<Ticket | null>(null);

  readonly saved =
    output<Ticket>();

  readonly cancelled =
    output<void>();

  readonly loadingLookups =
    signal(false);

  readonly sites =
    signal<Site[]>([]);

  readonly devices =
    signal<Device[]>([]);

  readonly alerts =
    signal<Alert[]>([]);

  readonly technicians =
    signal<Technician[]>([]);

  readonly priorityOptions:
    SelectOption<Priority>[] = [
      {
        label: 'Critical',
        value: 'CRITICAL'
      },
      {
        label: 'High',
        value: 'HIGH'
      },
      {
        label: 'Medium',
        value: 'MEDIUM'
      },
      {
        label: 'Low',
        value: 'LOW'
      }
    ];

  readonly severityOptions:
    SelectOption<Severity>[] = [
      {
        label: 'Critical',
        value: 'CRITICAL'
      },
      {
        label: 'Error',
        value: 'ERROR'
      },
      {
        label: 'High',
        value: 'HIGH'
      },
      {
        label: 'Medium',
        value: 'MEDIUM'
      },
      {
        label: 'Low',
        value: 'LOW'
      }
    ];

  readonly sourceOptions:
    SelectOption<TicketSource>[] = [
      {
        label: 'Manual',
        value: 'MANUAL'
      },
      {
        label: 'Alert',
        value: 'ALERT'
      },
      {
        label: 'Rule Engine',
        value: 'RULE_ENGINE'
      },
      {
        label: 'Device',
        value: 'DEVICE'
      },
      {
        label: 'Monitoring',
        value: 'MONITORING'
      },
      {
        label: 'System',
        value: 'SYSTEM'
      },
      {
        label: 'API',
        value: 'API'
      }
    ];

  readonly siteOptions = computed(() =>
    this.sites().map(site => ({
      label:
        `${site.siteCode} · ${site.siteName}`,
      value: site.id
    }))
  );

  readonly deviceOptions = computed(() =>
    this.devices().map(device => ({
      label:
        `${device.deviceCode} · ${device.deviceName}`,
      value: device.id
    }))
  );

  readonly alertOptions = computed(() =>
    this.alerts().map(alert => ({
      label:
        `${alert.alertCode} · ${alert.alertType}`,
      value: alert.id
    }))
  );

  readonly technicianOptions = computed(() =>
    this.technicians().map(technician => ({
      label:
        `${technician.technicianCode} · ${technician.firstName} ${technician.lastName}`,
      value: technician.id
    }))
  );

  readonly form =
    this.formBuilder.nonNullable.group({
      title: [
        '',
        [
          Validators.required,
          Validators.maxLength(180)
        ]
      ],

      description: [
        '',
        [
          Validators.required,
          Validators.maxLength(3000)
        ]
      ],

      priority: [
        'MEDIUM' as Priority,
        Validators.required
      ],

      severity: [
        'MEDIUM' as Severity,
        Validators.required
      ],

      source: [
        'MANUAL' as TicketSource,
        Validators.required
      ],

      siteId: [
        null as number | null,
        Validators.required
      ],

      deviceId: [
        null as number | null
      ],

      alertId: [
        null as number | null
      ],

      assignedTechnicianId: [
        null as number | null
      ],

      estimatedResolutionAt: [
        null as Date | null
      ],

      remarks: [
        '',
        Validators.maxLength(1000)
      ]
    });

  constructor() {
    super();

    this.loadInitialLookups();

    effect(() => {
      const currentTicket =
        this.ticket();

      if (
        this.mode() === 'edit' &&
        currentTicket
      ) {
        this.patchTicket(currentTicket);
        return;
      }

      if (this.mode() === 'create') {
        this.resetToDefaults();
      }
    });

    this.form.controls.siteId.valueChanges
      .pipe(this.untilDestroyed())
      .subscribe(siteId => {
        this.onSiteChanged(siteId);
      });

    this.form.controls.deviceId.valueChanges
      .pipe(this.untilDestroyed())
      .subscribe(deviceId => {
        this.onDeviceChanged(deviceId);
      });
  }

  submit(): void {
    if (!this.validateForm()) {
      return;
    }

    const payload =
      this.buildPayload();

    const currentTicket =
      this.ticket();

    this.startSubmitting();

    const request =
      this.mode() === 'edit' &&
      currentTicket
        ? this.ticketService.update(
            currentTicket.id,
            payload
          )
        : this.ticketService.create(
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
              ? 'Ticket updated successfully.'
              : 'Ticket created successfully.'
          );

          this.saved.emit(response.data);
        },

        error: error => {
          this.showError(
            error,
            this.mode() === 'edit'
              ? 'Unable to update the ticket.'
              : 'Unable to create the ticket.'
          );
        }
      });
  }

  cancel(): void {
    if (this.submitting()) {
      return;
    }

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

  private loadInitialLookups(): void {
    this.loadingLookups.set(true);

    forkJoin({
      sites: this.siteService.getSites({
        page: 0,
        size: 500,
        sort: 'siteName,asc',
        enabled: true
      }),

      technicians:
        this.technicianService.getTechnicians({
          page: 0,
          size: 500,
          active: true,
          sort: 'technicianName,asc'
        })
    })
      .pipe(
        this.untilDestroyed(),
        finalize(() =>
          this.loadingLookups.set(false)
        )
      )
      .subscribe({
        next: response => {
          this.sites.set(
            response.sites.data ?? []
          );

          this.technicians.set(
            response.technicians.data ?? []
          );

          const currentTicket =
            this.ticket();

          if (currentTicket?.siteId) {
            this.loadSiteDependentLookups(
              currentTicket.siteId,
              currentTicket.deviceId ?? undefined
            );
          }
        },

        error: error => {
          this.showError(
            error,
            'Unable to load ticket form lookups.'
          );
        }
      });
  }

  private onSiteChanged(
    siteId: number | null
  ): void {
    if (!siteId) {
      this.devices.set([]);
      this.alerts.set([]);

      this.form.patchValue(
        {
          deviceId: null,
          alertId: null
        },
        {
          emitEvent: false
        }
      );

      return;
    }

    const currentTicket =
      this.ticket();

    const keepExistingValues =
      this.mode() === 'edit' &&
      currentTicket?.siteId === siteId;

    if (!keepExistingValues) {
      this.form.patchValue(
        {
          deviceId: null,
          alertId: null
        },
        {
          emitEvent: false
        }
      );
    }

    this.loadSiteDependentLookups(
      siteId,
      keepExistingValues
        ? currentTicket?.deviceId ?? undefined
        : undefined
    );
  }

  private onDeviceChanged(
    deviceId: number | null
  ): void {
    const siteId =
      this.form.controls.siteId.value;

    if (!siteId) {
      return;
    }

    this.loadAlerts(
      siteId,
      deviceId ?? undefined
    );
  }

  private loadSiteDependentLookups(
    siteId: number,
    selectedDeviceId?: number
  ): void {
    this.loadingLookups.set(true);

    forkJoin({
      devices:
        this.deviceService.getDevices({
          siteId,
          page: 0,
          size: 500,
          sort: 'deviceName,asc'
        }),

      alerts:
        this.alertService.getAlerts({
          siteId,
          deviceId: selectedDeviceId,
          page: 0,
          size: 500,
          sort: 'createdAt,desc'
        })
    })
      .pipe(
        this.untilDestroyed(),
        finalize(() =>
          this.loadingLookups.set(false)
        )
      )
      .subscribe({
        next: response => {
          this.devices.set(
            response.devices.data ?? []
          );

          this.alerts.set(
            response.alerts.data ?? []
          );
        },

        error: error => {
          this.showError(
            error,
            'Unable to load devices and alerts.'
          );
        }
      });
  }

  private loadAlerts(
    siteId: number,
    deviceId?: number
  ): void {
    this.alertService
      .getAlerts({
        siteId,
        deviceId,
        page: 0,
        size: 500,
        sort: 'createdAt,desc'
      })
      .pipe(
        this.untilDestroyed()
      )
      .subscribe({
        next: response => {
          this.alerts.set(
            response.data ?? []
          );
        },

        error: error => {
          this.showError(
            error,
            'Unable to load alerts.'
          );
        }
      });
  }

  private patchTicket(
    ticket: Ticket
  ): void {
    this.form.reset({
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      severity: ticket.severity,
      source: ticket.source,
      siteId: ticket.siteId,
      deviceId: ticket.deviceId ?? null,
      alertId: ticket.alertId ?? null,
      assignedTechnicianId:
        ticket.assignedTechnicianId ?? null,
      estimatedResolutionAt:
        this.parseDate(
          ticket.estimatedResolutionAt
        ),
      remarks: ticket.remarks ?? ''
    });

    if (ticket.siteId) {
      this.loadSiteDependentLookups(
        ticket.siteId,
        ticket.deviceId ?? undefined
      );
    }

    this.submitted.set(false);
  }

  private resetToDefaults(): void {
    this.form.reset({
      title: '',
      description: '',
      priority: 'MEDIUM',
      severity: 'MEDIUM',
      source: 'MANUAL',
      siteId: null,
      deviceId: null,
      alertId: null,
      assignedTechnicianId: null,
      estimatedResolutionAt: null,
      remarks: ''
    });

    this.devices.set([]);
    this.alerts.set([]);
    this.submitted.set(false);
  }

  private buildPayload(): TicketPayload {
    const value =
      this.form.getRawValue();

    return {
      title:
        value.title.trim(),

      description:
        value.description.trim(),

      priority:
        value.priority,

      severity:
        value.severity,

      source:
        value.source,

      siteId:
        value.siteId!,

      deviceId:
        value.deviceId,

      alertId:
        value.alertId,

      assignedTechnicianId:
        value.assignedTechnicianId,

      estimatedResolutionAt:
        value.estimatedResolutionAt
          ? value.estimatedResolutionAt.toISOString()
          : null,

      remarks:
        value.remarks.trim()
    };
  }

  private parseDate(
    value?: string | null
  ): Date | null {
    if (!value) {
      return null;
    }

    const parsedDate =
      new Date(value);

    return Number.isNaN(
      parsedDate.getTime()
    )
      ? null
      : parsedDate;
  }
}
