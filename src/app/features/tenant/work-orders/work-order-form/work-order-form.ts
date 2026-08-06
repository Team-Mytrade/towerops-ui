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
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin, of } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

import { AuthService } from '../../../../core/auth/auth.service';

import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';

import { ToastService } from '../../../../core/services/toast.service';
import { TechnicianService } from '../../../technician/services/technician.service';
import { AlertService } from '../../alerts/services/alert.service';
import { TicketService } from '../../tickets/services/ticket.service';
import { WorkOrderService } from '../work-order.service';

export type WorkOrderStatus =
  | 'CREATED'
  | 'ASSIGNED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'VERIFIED'
  | 'CLOSED'
  | 'CANCELLED';

export type WorkOrderRequest = {
  tenantId: string;
  workOrderCode: string;
  ticketId: number;
  alertId: number;
  technicianId: number;
  title: string;
  description: string;
  status: WorkOrderStatus;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  resolution: string;
  laborHours: number;
  remarks: string;
};

type SelectOption = {
  label: string;
  value: number;
};

@Component({
  selector: 'to-work-order-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    SkeletonModule,
    TagModule,
    TextareaModule
  ],
  templateUrl: './work-order-form.html',
  styleUrl: './work-order-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkOrderFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);
  private readonly workOrderService = inject(WorkOrderService);
  private readonly technicianService = inject(TechnicianService);
  private readonly alertService = inject(AlertService);
  private readonly ticketService = inject(TicketService);

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly loadingTechnicians = signal(false);
  readonly loadingAlerts = signal(false);
  readonly loadingTickets = signal(false);
  readonly workOrderId = signal<number | null>(null);

  readonly technicianOptions = signal<SelectOption[]>([]);
  readonly alertOptions = signal<SelectOption[]>([]);
  readonly ticketOptions = signal<SelectOption[]>([]);

  readonly statusOptions: Array<{
    label: string;
    value: WorkOrderStatus;
  }> = [
    { label: 'Created', value: 'CREATED' },
    { label: 'Assigned', value: 'ASSIGNED' },
    { label: 'Scheduled', value: 'SCHEDULED' },
    { label: 'In progress', value: 'IN_PROGRESS' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Verified', value: 'VERIFIED' },
    { label: 'Closed', value: 'CLOSED' },
    { label: 'Cancelled', value: 'CANCELLED' }
  ];

  readonly form = this.fb.group({
    workOrderCode: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(50)
    ]),
    ticketId: this.fb.control<number | null>(null, Validators.required),
    alertId: this.fb.control<number | null>(null),
    technicianId: this.fb.control<number | null>(null),
    title: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(150)
    ]),
    description: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(1000)
    ]),
    status: this.fb.nonNullable.control<WorkOrderStatus>(
      'CREATED',
      Validators.required
    ),
    scheduledAt: this.fb.control<Date | null>(null),
    startedAt: this.fb.control<Date | null>(null),
    completedAt: this.fb.control<Date | null>(null),
    resolution: this.fb.nonNullable.control('', Validators.maxLength(2000)),
    laborHours: this.fb.control<number | null>(0, [
      Validators.min(0),
      Validators.max(999)
    ]),
    remarks: this.fb.nonNullable.control('', Validators.maxLength(1000))
  });

  private readonly formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue()
  });

  readonly isCreateMode = computed(() => this.workOrderId() === null);
  readonly isEditMode = computed(() => !this.isCreateMode());

  readonly pageTitle = computed(() =>
    this.isCreateMode() ? 'Create work order' : 'Edit work order'
  );

  readonly pageDescription = computed(() =>
    this.isCreateMode()
      ? 'Turn an operational ticket into a clear, scheduled field assignment.'
      : 'Keep ownership, execution progress and resolution details accurate.'
  );

  readonly currentStatus = computed<WorkOrderStatus>(
    () => this.formValue().status ?? 'CREATED'
  );

  readonly showExecutionSection = computed(() =>
    ['IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'CLOSED'].includes(
      this.currentStatus()
    )
  );

  readonly formReadonly = computed(() =>
    this.submitting() ||
    ['CLOSED', 'CANCELLED'].includes(this.currentStatus())
  );

  readonly statusLabel = computed(() =>
    this.statusOptions.find(option => option.value === this.currentStatus())
      ?.label ?? 'Created'
  );

  readonly statusSeverity = computed<
    'success' | 'info' | 'warn' | 'danger' | 'secondary'
  >(() => {
    switch (this.currentStatus()) {
      case 'COMPLETED':
      case 'VERIFIED':
      case 'CLOSED':
        return 'success';
      case 'IN_PROGRESS':
        return 'info';
      case 'ASSIGNED':
      case 'SCHEDULED':
        return 'warn';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'secondary';
    }
  });

  readonly selectedTicketLabel = computed(() =>
    this.findOptionLabel(this.ticketOptions(), this.formValue().ticketId)
  );

  readonly selectedAlertLabel = computed(() =>
    this.findOptionLabel(this.alertOptions(), this.formValue().alertId)
  );

  readonly selectedTechnicianLabel = computed(() =>
    this.findOptionLabel(
      this.technicianOptions(),
      this.formValue().technicianId
    )
  );

  constructor() {
    this.configureStatusValidation();
    this.initialize();
  }

  private initialize(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const workOrderId = Number.isFinite(id) && id > 0 ? id : null;
    this.workOrderId.set(workOrderId);
    this.loadInitialData(workOrderId);
  }

  private loadInitialData(workOrderId: number | null): void {
    this.loading.set(true);
    this.loadingTechnicians.set(true);
    this.loadingAlerts.set(true);
    this.loadingTickets.set(true);

    forkJoin({
      technicians: this.technicianService.getTechnicians(),
      alerts: this.alertService.getAlerts(),
      tickets: this.ticketService.getTickets(),
      workOrder: workOrderId
        ? this.workOrderService.getWorkOrderById(workOrderId)
        : of(null)
    })
      .pipe(
        finalize(() => {
          this.loading.set(false);
          this.loadingTechnicians.set(false);
          this.loadingAlerts.set(false);
          this.loadingTickets.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: result => {
          this.technicianOptions.set(
            (result.technicians.data ?? []).map(technician => ({
              value: technician.id,
              label:
                `${technician.firstName ?? ''} ${technician.lastName ?? ''}`.trim() ||
                technician.username ||
                technician.technicianCode ||
                `Technician #${technician.id}`
            }))
          );

          this.alertOptions.set(
            (result.alerts.data ?? []).map(alert => ({
              value: alert.id,
              label:
                alert.alertCode
                  ? `${alert.alertCode} · ${alert.message ?? 'Alert'}`
                  : alert.message ?? `Alert #${alert.id}`
            }))
          );

          this.ticketOptions.set(
            (result.tickets.data ?? []).map(ticket => ({
              value: ticket.id,
              label:
                ticket.ticketCode
                  ? `${ticket.ticketCode} · ${ticket.title ?? 'Ticket'}`
                  : ticket.title ?? `Ticket #${ticket.id}`
            }))
          );

          if (result.workOrder?.data) {
            this.patchWorkOrder(result.workOrder.data);
          }
        },
        error: () => this.toast.error('Unable to load work order form data.')
      });
  }

  private patchWorkOrder(workOrder: any): void {
    this.form.patchValue(
      {
        workOrderCode: workOrder.workOrderCode ?? '',
        ticketId: workOrder.ticketId ?? null,
        alertId: workOrder.alertId ?? null,
        technicianId: workOrder.technicianId ?? null,
        title: workOrder.title ?? '',
        description: workOrder.description ?? '',
        status: workOrder.status ?? 'CREATED',
        scheduledAt: this.toDate(workOrder.scheduledAt),
        startedAt: this.toDate(workOrder.startedAt),
        completedAt: this.toDate(workOrder.completedAt),
        resolution: workOrder.resolution ?? '',
        laborHours: workOrder.laborHours ?? 0,
        remarks: workOrder.remarks ?? ''
      },
      { emitEvent: true }
    );

    this.form.markAsPristine();

    if (['CLOSED', 'CANCELLED'].includes(workOrder.status)) {
      this.form.disable({ emitEvent: false });
    }
  }

  private configureStatusValidation(): void {
    this.form.controls.status.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(status => {
        const startedAt = this.form.controls.startedAt;
        const completedAt = this.form.controls.completedAt;
        const resolution = this.form.controls.resolution;
        const completionStatuses: WorkOrderStatus[] = [
          'COMPLETED',
          'VERIFIED',
          'CLOSED'
        ];

        if (
          ['IN_PROGRESS', ...completionStatuses].includes(status)
        ) {
          startedAt.addValidators(Validators.required);
        } else {
          startedAt.removeValidators(Validators.required);
        }

        if (completionStatuses.includes(status)) {
          completedAt.addValidators(Validators.required);
          resolution.addValidators(Validators.required);
        } else {
          completedAt.removeValidators(Validators.required);
          resolution.removeValidators(Validators.required);
        }

        startedAt.updateValueAndValidity({ emitEvent: false });
        completedAt.updateValueAndValidity({ emitEvent: false });
        resolution.updateValueAndValidity({ emitEvent: false });
      });
  }

  hasError(controlName: keyof typeof this.form.controls, error: string): boolean {
    const control = this.form.controls[controlName];
    return control.touched && control.hasError(error);
  }

  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Complete the required work order fields.');
      return;
    }

    if (!this.auth.tenantId()) {
      this.toast.error('A tenant is required to create a work order.');
      return;
    }

    const request = this.buildRequest();
    const id = this.workOrderId();
    this.submitting.set(true);

    const operation$ = id
      ? this.workOrderService.updateWorkOrder(id, request)
      : this.workOrderService.createWorkOrder(request);

    operation$
      .pipe(
        finalize(() => this.submitting.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: response => {
          this.toast.success(
            id
              ? 'Work order updated successfully.'
              : 'Work order created successfully.'
          );

          const savedId = response.data?.id ?? id;
          if (savedId) {
            void this.router.navigate(['/tenant/work-orders', savedId, 'edit']);
          } else {
            this.cancelForm();
          }
        },
        error: () =>
          this.toast.error(
            id ? 'Unable to update the work order.' : 'Unable to create the work order.'
          )
      });
  }

  private buildRequest(): WorkOrderRequest {
    const value = this.form.getRawValue();

    return {
      tenantId: this.auth.tenantId()!,
      workOrderCode: value.workOrderCode.trim(),
      ticketId: Number(value.ticketId ?? 0),
      alertId: Number(value.alertId ?? 0),
      technicianId: Number(value.technicianId ?? 0),
      title: value.title.trim(),
      description: value.description.trim(),
      status: value.status,
      scheduledAt: this.toIso(value.scheduledAt),
      startedAt: this.toIso(value.startedAt),
      completedAt: this.toIso(value.completedAt),
      resolution: value.resolution.trim(),
      laborHours: Number(value.laborHours ?? 0),
      remarks: value.remarks.trim()
    };
  }

  cancelForm(): void {
    void this.router.navigate(['/tenant/work-orders']);
  }

  private findOptionLabel(
    options: SelectOption[],
    value: number | null | undefined
  ): string {
    if (!value) return 'Not selected';
    return options.find(option => option.value === value)?.label ?? `#${value}`;
  }

  private toDate(value: string | Date | null | undefined): Date | null {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private toIso(value: Date | null | undefined): string | null {
    return value instanceof Date ? value.toISOString() : null;
  }
}
