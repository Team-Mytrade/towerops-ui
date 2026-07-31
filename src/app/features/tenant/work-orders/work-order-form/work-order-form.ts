import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  finalize,
  forkJoin,
  Observable,
  of,
  switchMap
} from 'rxjs';

import {
  takeUntilDestroyed,
  toSignal
} from '@angular/core/rxjs-interop';

import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

import {
  ToastService
} from '../../../../core/services/toast.service';

import {
  WorkOrderService
} from '../work-order.service';

import {
  WorkOrderAssignmentCardComponent
} from './components/assignment-card/assignment-card';

import {
  WorkOrderCardComponent
} from './components/work-order-card/work-order-card';

import {
  WorkOrderResourcesCardComponent
} from './components/resources-card/resources-card';

import {
  WorkOrderResolutionCardComponent
} from './components/resolution-card/resolution-card';

import {
  WorkOrderSiteContextCardComponent
} from './components/site-context-card/site-context-card';

import {
  WorkOrderActionFooterComponent
} from './components/action-footer/action-footer';

import {
  CREATE_WORK_ORDER_INITIAL_VALUE,
  WORK_ORDER_DESCRIPTION_MAX_LENGTH,
  WORK_ORDER_LABOR_HOURS_MAX,
  WORK_ORDER_LABOR_HOURS_MIN,
  WORK_ORDER_REMARKS_MAX_LENGTH,
  WORK_ORDER_RESOLUTION_MAX_LENGTH,
  WORK_ORDER_TITLE_MAX_LENGTH
} from '../constants/work-order-form.constants';

import {
  WorkOrderAlertOption,
  CreateWorkOrderRequest,
  WorkOrderDeviceOption,
  WorkOrderFormMode,
  WorkOrderFormValue,
  WorkOrderFormOption,
  WorkOrderSiteContext,
  WorkOrderSiteOption,
  WorkOrderTechnicianOption,
  WorkOrderTicketOption,
  UpdateWorkOrderRequest
} from '../models/work-order-form.models';

import {
  mapWorkOrderToForm,
  mapFormToCreateRequest,
  mapFormToUpdateRequest
} from '../constants/work-order-form.mapper';

import {
  WorkOrderStatus
} from '../../../../core/models/application.enums';
import { WorkOrder } from '../models/work-order.models';
import { ApiResponse } from '../../../../core/api/api.types';
import { TechnicianService } from '../../../technician/services/technician.service';
import { AlertService } from '../../alerts/services/alert.service';
import { DeviceService } from '../../devices/services/device.service';
import { SiteService } from '../../sites/services/site.service';
import { TicketService } from '../../tickets/services/ticket.service';

@Component({
  selector: 'to-work-order-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    SkeletonModule,

    WorkOrderAssignmentCardComponent,
    WorkOrderCardComponent,
    WorkOrderResourcesCardComponent,
    WorkOrderResolutionCardComponent,
    WorkOrderSiteContextCardComponent,
    WorkOrderActionFooterComponent
  ],
  templateUrl: './work-order-form.html',
  styleUrl: './work-order-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkOrderFormComponent {
  private readonly fb =
    inject(FormBuilder);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly destroyRef =
    inject(DestroyRef);

  private readonly toast =
    inject(ToastService);

  private readonly workOrderService =
    inject(WorkOrderService);

    private readonly technicianService =
  inject(TechnicianService);

private readonly siteService =
  inject(SiteService);

private readonly deviceService =
  inject(DeviceService);

private readonly alertService =
  inject(AlertService);

private readonly ticketService =
  inject(TicketService);

  readonly loading =
    signal(true);

  readonly submitting =
    signal(false);

  readonly loadingTechnicians =
    signal(false);

  readonly loadingSites =
    signal(false);

  readonly loadingDevices =
    signal(false);

  readonly loadingAlerts =
    signal(false);

  readonly loadingTickets =
    signal(false);

  readonly loadingSiteContext =
    signal(false);

  readonly workOrderId =
    signal<number | null>(null);

  readonly formMode =
    signal<WorkOrderFormMode>('CREATE');

  readonly currentStatus =
    signal<WorkOrderStatus>('CREATED');

  readonly technicianOptions =
    signal<WorkOrderTechnicianOption[]>([]);

  readonly siteOptions =
    signal<WorkOrderSiteOption[]>([]);

  readonly deviceOptions =
    signal<WorkOrderDeviceOption[]>([]);

  readonly alertOptions =
    signal<WorkOrderAlertOption[]>([]);

  readonly ticketOptions =
    signal<WorkOrderTicketOption[]>([]);

  readonly siteContext =
    signal<WorkOrderSiteContext | null>(null);

  readonly form = this.fb.group({
    workOrderCode: [
      CREATE_WORK_ORDER_INITIAL_VALUE.workOrderCode,
      [
        Validators.required,
        Validators.maxLength(50)
      ]
    ],

    title: [
      CREATE_WORK_ORDER_INITIAL_VALUE.title,
      [
        Validators.required,
        Validators.maxLength(
          WORK_ORDER_TITLE_MAX_LENGTH
        )
      ]
    ],

    description: [
      CREATE_WORK_ORDER_INITIAL_VALUE.description,
      [
        Validators.required,
        Validators.maxLength(
          WORK_ORDER_DESCRIPTION_MAX_LENGTH
        )
      ]
    ],

    status: [
      CREATE_WORK_ORDER_INITIAL_VALUE.status,
      Validators.required
    ],

    severity: [
      CREATE_WORK_ORDER_INITIAL_VALUE.severity,
      Validators.required
    ],

    priority: [
      CREATE_WORK_ORDER_INITIAL_VALUE.priority,
      Validators.required
    ],

    technicianId: [
      CREATE_WORK_ORDER_INITIAL_VALUE.technicianId
    ],

    siteId: [
      CREATE_WORK_ORDER_INITIAL_VALUE.siteId,
      Validators.required
    ],

    deviceId: [
      CREATE_WORK_ORDER_INITIAL_VALUE.deviceId
    ],

    alertId: [
      CREATE_WORK_ORDER_INITIAL_VALUE.alertId
    ],

    ticketId: [
      CREATE_WORK_ORDER_INITIAL_VALUE.ticketId
    ],

    scheduledAt: [
      CREATE_WORK_ORDER_INITIAL_VALUE.scheduledAt
    ],

    estimatedHours: [
      CREATE_WORK_ORDER_INITIAL_VALUE.estimatedHours,
      [
        Validators.min(0),
        Validators.max(999)
      ]
    ],

    startedAt: [
      CREATE_WORK_ORDER_INITIAL_VALUE.startedAt
    ],

    completedAt: [
      CREATE_WORK_ORDER_INITIAL_VALUE.completedAt
    ],

    resolution: [
      CREATE_WORK_ORDER_INITIAL_VALUE.resolution,
      Validators.maxLength(
        WORK_ORDER_RESOLUTION_MAX_LENGTH
      )
    ],

    laborHours: [
      CREATE_WORK_ORDER_INITIAL_VALUE.laborHours,
      [
        Validators.min(
          WORK_ORDER_LABOR_HOURS_MIN
        ),
        Validators.max(
          WORK_ORDER_LABOR_HOURS_MAX
        )
      ]
    ],

    remarks: [
      CREATE_WORK_ORDER_INITIAL_VALUE.remarks,
      Validators.maxLength(
        WORK_ORDER_REMARKS_MAX_LENGTH
      )
    ]
  });

  readonly formStatus = toSignal(
    this.form.statusChanges,
    {
      initialValue: this.form.status
    }
  );

  readonly formValue = toSignal(
    this.form.valueChanges,
    {
      initialValue:
        this.form.getRawValue()
    }
  );

  readonly isCreateMode = computed(
    () => this.formMode() === 'CREATE'
  );

  readonly isEditMode = computed(
    () => this.formMode() === 'EDIT'
  );

  readonly isTerminalStatus = computed(
    () =>
      this.currentStatus() === 'CLOSED' ||
      this.currentStatus() === 'CANCELLED'
  );

  readonly formReadonly = computed(
    () =>
      this.submitting() ||
      this.isTerminalStatus()
  );

  readonly completionMode = computed(
    () =>
      this.currentStatus() === 'IN_PROGRESS' ||
      this.currentStatus() === 'COMPLETED'
  );

  readonly selectedSiteId = computed(
    () =>
      this.formValue()?.siteId ?? null
  );

  readonly canSaveDraft = computed(
    () => this.isCreateMode()
  );

  readonly canCreate = computed(
    () => this.isCreateMode()
  );

  readonly canSave = computed(
    () =>
      this.isEditMode() &&
      !this.isTerminalStatus()
  );

  readonly canAssign = computed(
    () =>
      this.isEditMode() &&
      this.currentStatus() === 'CREATED'
  );

  readonly canStart = computed(
    () =>
      this.isEditMode() &&
      (
        this.currentStatus() === 'ASSIGNED' ||
        this.currentStatus() === 'SCHEDULED'
      )
  );

  readonly canComplete = computed(
    () =>
      this.isEditMode() &&
      this.currentStatus() === 'IN_PROGRESS'
  );

  readonly canVerify = computed(
    () =>
      this.isEditMode() &&
      this.currentStatus() === 'COMPLETED'
  );

  readonly canClose = computed(
    () =>
      this.isEditMode() &&
      this.currentStatus() === 'VERIFIED'
  );

  readonly canCancel = computed(
    () =>
      this.isEditMode() &&
      !this.isTerminalStatus()
  );

  readonly canDelete = computed(
    () =>
      this.isEditMode() &&
      this.currentStatus() === 'CREATED'
  );

  readonly invalidFieldLabels = computed(() => {
    this.formStatus();

    const labels: Record<string, string> = {
      workOrderCode: 'Work Order Code',
      title: 'Title',
      description: 'Description',
      severity: 'Severity',
      priority: 'Priority',
      technicianId: 'Technician',
      siteId: 'Site',
      scheduledAt: 'Scheduled Date',
      completedAt: 'Completed Date',
      laborHours: 'Labor Hours',
      resolution: 'Resolution'
    };

    return Object.entries(
      this.form.controls
    )
      .filter(([, control]) =>
        control.invalid
      )
      .map(([name]) =>
        labels[name] ?? name
      );
  });

  readonly pageTitle = computed(() =>
    this.isCreateMode()
      ? 'Create Work Order'
      : 'Edit Work Order'
  );

  readonly pageDescription = computed(() =>
    this.isCreateMode()
      ? 'Plan resources, assign ownership and define the operational scope.'
      : 'Update planning details and progress the work order through its lifecycle.'
  );

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    const idParam =
      this.route.snapshot.paramMap.get('id');

    const workOrderId =
      idParam ? Number(idParam) : null;

    if (
      workOrderId !== null &&
      Number.isFinite(workOrderId)
    ) {
      this.formMode.set('EDIT');
      this.workOrderId.set(workOrderId);
    }

    this.loadInitialData(workOrderId);
  }

  private loadInitialData(
    workOrderId: number | null
  ): void {
    this.loading.set(true);

    forkJoin({
      technicians:
        this.technicianService.getTechnicians(),
      sites:
        this.siteService.getSites(),

      workOrder:
        workOrderId
          ? this.workOrderService
              .getWorkOrderById(workOrderId)
          : of(null)
    })
      .pipe(
        finalize(() =>
          this.loading.set(false)
        ),
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({
        next: result => {
  const technicians =
    result.technicians.data ?? [];

  const sites =
    result.sites.data ?? [];

  this.technicianOptions.set(
    technicians.map(
      technician => ({
        label:
          `${technician.firstName} ${technician.lastName}`.trim() ||
          technician.username ||
          technician.technicianCode ||
          `Technician #${technician.id}`,

        value:
          technician.id,

        technicianCode:
          technician.technicianCode,

        email:
          technician.email,

        phoneNumber:
          technician.phoneNumber,

        active:
          technician.enabled
      })
    )
  );

  this.siteOptions.set(
    sites.map(
      site => ({
        label:
          site.siteName ??
          site.siteCode ??
          `Site #${site.id}`,

        value:
          site.id,

        siteCode:
          site.siteCode,

        siteName:
          site.siteName,

        category:
          site.category ?? null,

        healthStatus:
          site.healthStatus ?? null
      })
    )
  );

  if (result.workOrder?.data) {
    this.applyWorkOrder(
      result.workOrder.data
    );
  }
},
        error: () => {
          this.toast.error(
            'Unable to load work order form data.'
          );
        }
      });
  }

private applyWorkOrder(
  workOrder: WorkOrder
): void {
  const formValue =
    mapWorkOrderToForm(workOrder);

  this.currentStatus.set(
    workOrder.status
  );

  this.form.patchValue(
    formValue,
    {
      emitEvent: false
    }
  );

  this.form.markAsPristine();

  if (formValue.siteId) {
    this.loadSiteDependencies(
      formValue.siteId,
      {
        deviceId:
          formValue.deviceId,

        alertId:
          formValue.alertId,

        ticketId:
          formValue.ticketId
      }
    );
  }

  this.updateCompletionValidators(
    workOrder.status === 'IN_PROGRESS'
  );

  if (
    workOrder.status === 'CLOSED' ||
    workOrder.status === 'CANCELLED'
  ) {
    this.form.disable({
      emitEvent: false
    });
  }
}

  onSiteChanged(
    siteId: number | null
  ): void {
    this.form.patchValue({
      deviceId: null,
      alertId: null,
      ticketId: null
    });

    this.deviceOptions.set([]);
    this.alertOptions.set([]);
    this.ticketOptions.set([]);
    this.siteContext.set(null);

    if (!siteId) {
      return;
    }

    this.loadSiteDependencies(siteId);
  }

  onDeviceChanged(
    deviceId: number | null
  ): void {
    this.form.patchValue({
      deviceId
    });
  }

  onAlertChanged(
    alertId: number | null
  ): void {
    this.form.patchValue({
      alertId
    });
  }

  onTicketChanged(
    ticketId: number | null
  ): void {
    this.form.patchValue({
      ticketId
    });
  }

  onTechnicianChanged(
    technicianId: number | null
  ): void {
    this.form.patchValue({
      technicianId
    });
  }

  onScheduledAtChanged(
    scheduledAt: Date | null
  ): void {
    this.form.patchValue({
      scheduledAt
    });
  }

  onStartedAtChanged(
    startedAt: Date | null
  ): void {
    this.form.patchValue({
      startedAt
    });
  }

  onCompletedAtChanged(
    completedAt: Date | null
  ): void {
    this.form.patchValue({
      completedAt
    });
  }

  onLaborHoursChanged(
    laborHours: number | null
  ): void {
    this.form.patchValue({
      laborHours
    });
  }

 private loadSiteDependencies(
  siteId: number,
  selected?: {
    deviceId?: number | null;
    alertId?: number | null;
    ticketId?: number | null;
  }
): void {
  this.loadingDevices.set(true);
  this.loadingAlerts.set(true);
  this.loadingTickets.set(true);
  this.loadingSiteContext.set(true);

  forkJoin({
    devices:
      this.deviceService.getDevices({
        siteId
      }),

    alerts:
      this.alertService.getAlerts({
        siteId
      }),

    tickets:
      this.ticketService.getTickets({
        siteId
      }),

    site:
      this.siteService.getById(siteId),

    siteDevices:
      this.siteService.getSiteDevices(siteId),

    siteAlerts:
      this.siteService.getSiteAlerts(
        siteId,
        100
      ),

    siteWorkOrders:
      this.siteService.getSiteWorkOrders(
        siteId,
        100
      )
  })
    .pipe(
      finalize(() => {
        this.loadingDevices.set(false);
        this.loadingAlerts.set(false);
        this.loadingTickets.set(false);
        this.loadingSiteContext.set(false);
      }),
      takeUntilDestroyed(
        this.destroyRef
      )
    )
    .subscribe({
      next: result => {
        const devices =
          result.devices.data ?? [];

        const alerts =
          result.alerts.data ?? [];

        const tickets =
          result.tickets.data ?? [];

        this.deviceOptions.set(
          devices.map(device => ({
            label:
              device.deviceName ??
              device.deviceCode ??
              `Device #${device.id}`,

            value:
              device.id,

            deviceCode:
              device.deviceCode,

            deviceName:
              device.deviceName,

            siteId:
              device.siteId ?? null,

            category:
              device.category ?? null,

            status:
              device.status ?? null
          }))
        );

        this.alertOptions.set(
          alerts.map(alert => ({
            label:
              alert.message ??
              alert.alertCode ??
              `Alert #${alert.id}`,

            value:
              alert.id,

            alertCode:
              alert.alertCode,

            message:
              alert.message,

            siteId:
              alert.siteId ?? null,

            siteCode:
              alert.siteCode ?? null,

            siteName:
              alert.siteName ?? null,

            deviceId:
              null,

            deviceCode:
              alert.deviceCode ?? null,

            deviceName:
              alert.deviceName ?? null,

            ticketId:
              alert.ticketId ?? null,

            severity:
              alert.severity ?? null
          }))
        );

        this.ticketOptions.set(
          tickets.map(ticket => ({
            label:
              ticket.title ??
              ticket.ticketCode ??
              `Ticket #${ticket.id}`,

            value:
              ticket.id,

            ticketCode:
              ticket.ticketCode,

            title:
              ticket.title,

            siteId:
              ticket.siteId ?? null,

            siteCode:
              ticket.siteCode ?? null,

            siteName:
              ticket.siteName ?? null,

            deviceId:
              ticket.deviceId ?? null,

            deviceCode:
              ticket.deviceCode ?? null,

            deviceName:
              ticket.deviceName ?? null,

            alertId:
              ticket.alertId ?? null,

            alertCode:
              ticket.alertCode ?? null,

            severity:
              ticket.severity ?? null,

            status:
              ticket.status ?? null
          }))
        );

        const site =
          result.site.data;

        const siteDevices =
          result.siteDevices.data ?? [];

        const siteAlerts =
          result.siteAlerts.data ?? [];

        const siteWorkOrders =
          result.siteWorkOrders.data ?? [];

        if (site) {
          this.siteContext.set({
            siteId:
              site.id,

            siteCode:
              site.siteCode,

            siteName:
              site.siteName,

            category:
              site.category ?? null,

            healthStatus:
              site.healthStatus ?? null,

            devices: {
              total:
                siteDevices.length,

              online:
                siteDevices.filter(
                  device =>
                    device.status === 'ONLINE'
                ).length,

              offline:
                siteDevices.filter(
                  device =>
                    device.status === 'OFFLINE'
                ).length
            },

            alerts: {
              open:
                siteAlerts.length,

              critical:
                siteAlerts.filter(
                  alert =>
                    alert.severity ===
                    'CRITICAL'
                ).length
            },

            tickets: {
              open:
                tickets.filter(
                  ticket =>
                    ticket.status !==
                    'CLOSED' &&
                    ticket.status !==
                    'CANCELLED'
                ).length
            },

            workOrders: {
              open:
                siteWorkOrders.filter(
                  workOrder =>
                    workOrder.status !==
                    'CLOSED' &&
                    workOrder.status !==
                    'CANCELLED'
                ).length
            }
          });
        } else {
          this.siteContext.set(null);
        }

        if (selected) {
          this.form.patchValue(
            {
              deviceId:
                selected.deviceId ?? null,

              alertId:
                selected.alertId ?? null,

              ticketId:
                selected.ticketId ?? null
            },
            {
              emitEvent: false
            }
          );
        }
      },
      error: () => {
        this.deviceOptions.set([]);
        this.alertOptions.set([]);
        this.ticketOptions.set([]);
        this.siteContext.set(null);

        this.toast.error(
          'Unable to load the selected site context.'
        );
      }
    });
}

  saveDraft(): void {
    const request =
      mapFormToCreateRequest(
        this.form.getRawValue() as WorkOrderFormValue
      );

    request.status = 'CREATED';

    this.createRequest(
      request,
      'Work order draft saved.'
    );
  }

  createWorkOrder(): void {
    if (!this.validateForm()) {
      return;
    }

    const request =
      mapFormToCreateRequest(
        this.form.getRawValue() as WorkOrderFormValue
      );

    this.createRequest(
      request,
      'Work order created successfully.'
    );
  }

private createRequest(
  request: CreateWorkOrderRequest,
  successMessage: string
): void {
  this.submitting.set(true);

  this.workOrderService
    .createWorkOrder(request)
    .pipe(
      finalize(() =>
        this.submitting.set(false)
      ),
      takeUntilDestroyed(
        this.destroyRef
      )
    )
    .subscribe({
      next: response => {
        this.toast.success(
          successMessage
        );

        const id =
          response.data?.id;

        if (id) {
          void this.router.navigate([
            '/tenant/work-orders',
            id,
            'edit'
          ]);

          return;
        }

        this.navigateBack();
      },
      error: () => {
        this.toast.error(
          'Unable to create the work order.'
        );
      }
    });
}

  saveWorkOrder(): void {
    const id =
      this.workOrderId();

    if (!id || !this.validateForm()) {
      return;
    }

    const request =
      mapFormToUpdateRequest(
        this.form.getRawValue() as WorkOrderFormValue
      );

    this.updateRequest(
      id,
      request
    );
  }

  private updateRequest(
  id: number,
  request: UpdateWorkOrderRequest
): void {
  this.submitting.set(true);

  this.workOrderService
    .updateWorkOrder(id, request)
    .pipe(
      finalize(() =>
        this.submitting.set(false)
      ),
      takeUntilDestroyed(
        this.destroyRef
      )
    )
    .subscribe({
      next: response => {
        this.form.markAsPristine();

        if (response.data?.status) {
          this.currentStatus.set(
            response.data.status
          );
        }

        this.toast.success(
          'Work order updated successfully.'
        );
      },
      error: () => {
        this.toast.error(
          'Unable to update the work order.'
        );
      }
    });
}

assignWorkOrder(): void {
  const id = this.workOrderId();

  const technicianId =
    this.form.controls.technicianId.value;

  if (!id) {
    return;
  }

  if (!technicianId) {
    this.form.controls
      .technicianId
      .markAsTouched();

    this.toast.error(
      'Select a technician before assigning the work order.'
    );

    return;
  }

  this.runWorkflowAction(
    this.workOrderService.assignTechnician(
      id,
      technicianId
    ),
    'Work order assigned successfully.'
  );
}

  startWorkOrder(): void {
    const id =
      this.workOrderId();

    if (!id) {
      return;
    }

    this.runWorkflowAction(
      this.workOrderService.startWorkOrder(id),
      'Work order started.'
    );
  }

completeWorkOrder(): void {
  const id = this.workOrderId();

  if (!id) {
    return;
  }

  this.updateCompletionValidators(true);

  if (!this.validateForm()) {
    return;
  }

  const value =
    this.form.getRawValue();

  const resolution =
    value.resolution?.trim() ?? '';

  if (!resolution) {
    this.form.controls
      .resolution
      .markAsTouched();

    this.toast.error(
      'Enter the work resolution before completing the work order.'
    );

    return;
  }

  this.runWorkflowAction(
    this.workOrderService.completeWorkOrder(
      id,
      {
        resolution,
        laborHours:
          value.laborHours ?? null,
        remarks:
          value.remarks?.trim() ||
          null
      }
    ),
    'Work order completed successfully.'
  );
}

verifyWorkOrder(): void {
  const id = this.workOrderId();

  if (!id) {
    return;
  }

  const remarks =
    this.form.controls.remarks.value ?? null;

  this.runWorkflowAction(
    this.workOrderService.verifyWorkOrder(
      id,
      remarks
    ),
    'Work order verified successfully.'
  );
}

  closeWorkOrder(): void {
  const id = this.workOrderId();

  if (!id) {
    return;
  }

  const remarks =
    this.form.controls.remarks.value ?? null;

  this.runWorkflowAction(
    this.workOrderService.closeWorkOrder(
      id,
      remarks
    ),
    'Work order closed successfully.'
  );
}

  cancelWorkOrder(): void {
  const id = this.workOrderId();

  if (!id) {
    return;
  }

  const remarks =
    this.form.controls.remarks.value?.trim() ?? '';

  if (!remarks) {
    this.form.controls.remarks.markAsTouched();

    this.toast.error(
      'Enter cancellation remarks before cancelling the work order.'
    );

    return;
  }

  this.runWorkflowAction(
    this.workOrderService.cancelWorkOrder(
      id,
      remarks
    ),
    'Work order cancelled.'
  );
}

 deleteWorkOrder(): void {
  const id = this.workOrderId();

  if (!id) {
    return;
  }

  const confirmed = window.confirm(
    'Delete this work order permanently?'
  );

  if (!confirmed) {
    return;
  }

  this.submitting.set(true);

  this.workOrderService
    .deleteWorkOrder(id)
    .pipe(
      finalize(() =>
        this.submitting.set(false)
      ),
      takeUntilDestroyed(
        this.destroyRef
      )
    )
    .subscribe({
      next: () => {
        this.toast.success(
          'Work order deleted.'
        );

        this.navigateBack();
      },
      error: () => {
        this.toast.error(
          'Unable to delete the work order.'
        );
      }
    });
}

private runWorkflowAction(
  request$: Observable<
    ApiResponse<WorkOrder>
  >,
  successMessage: string
): void {
  this.submitting.set(true);

  request$
    .pipe(
      finalize(() =>
        this.submitting.set(false)
      ),
      takeUntilDestroyed(
        this.destroyRef
      )
    )
    .subscribe({
      next: (response: { data: any; }) => {
        const workOrder =
          response.data;

        if (workOrder) {
          this.applyWorkOrder(
            workOrder
          );
        }

        this.toast.success(
          successMessage
        );
      },
      error: () => {
        this.toast.error(
          'Unable to complete the requested workflow action.'
        );
      }
    });
}

  private validateForm(): boolean {
    if (this.form.valid) {
      return true;
    }

    this.form.markAllAsTouched();

    this.toast.error(
      'Review the required fields before continuing.'
    );

    return false;
  }

  private updateCompletionValidators(
    required: boolean
  ): void {
    const completedAt =
      this.form.controls.completedAt;

    const laborHours =
      this.form.controls.laborHours;

    const resolution =
      this.form.controls.resolution;

    if (required) {
      completedAt.addValidators(
        Validators.required
      );

      laborHours.addValidators([
        Validators.required,
        Validators.min(
          WORK_ORDER_LABOR_HOURS_MIN
        ),
        Validators.max(
          WORK_ORDER_LABOR_HOURS_MAX
        )
      ]);

      resolution.addValidators([
        Validators.required,
        Validators.maxLength(
          WORK_ORDER_RESOLUTION_MAX_LENGTH
        )
      ]);
    } else {
      completedAt.removeValidators(
        Validators.required
      );

      laborHours.removeValidators(
        Validators.required
      );

      resolution.removeValidators(
        Validators.required
      );
    }

    completedAt.updateValueAndValidity({
      emitEvent: false
    });

    laborHours.updateValueAndValidity({
      emitEvent: false
    });

    resolution.updateValueAndValidity({
      emitEvent: false
    });
  }

  private toIsoString(
    value: Date | string | null | undefined
  ): string | null {
    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    const date =
      new Date(value);

    return Number.isNaN(
      date.getTime()
    )
      ? null
      : date.toISOString();
  }

  cancelForm(): void {
    if (
      this.form.dirty &&
      !this.submitting()
    ) {
      const confirmed =
        window.confirm(
          'You have unsaved changes. Leave this page?'
        );

      if (!confirmed) {
        return;
      }
    }

    this.navigateBack();
  }

  private navigateBack(): void {
    this.router.navigate([
      '/tenant/work-orders'
    ]);
  }
}
