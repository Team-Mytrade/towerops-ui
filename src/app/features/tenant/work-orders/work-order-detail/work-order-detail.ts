import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal
} from '@angular/core';

import {
  DatePipe,
  DecimalPipe
} from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  finalize
} from 'rxjs';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  ButtonModule
} from 'primeng/button';

import {
  TagModule
} from 'primeng/tag';

import {
  SkeletonModule
} from 'primeng/skeleton';

import {
  DividerModule
} from 'primeng/divider';

import {
  ToastService
} from '../../../../core/services/toast.service';

import {
  WorkOrderService
} from '../work-order.service';

import {
  WorkOrder
} from '../models/work-order.models';

import {
  Severity,
  WorkOrderStatus
} from '../../../../core/models/application.enums';

type TagSeverity =
  | 'success'
  | 'info'
  | 'warn'
  | 'danger'
  | 'secondary'
  | 'contrast';

@Component({
  selector: 'to-work-order-detail',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    ButtonModule,
    TagModule,
    SkeletonModule,
    DividerModule
  ],
  templateUrl: './work-order-detail.html',
  styleUrl: './work-order-detail.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class WorkOrderDetailComponent {
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

  readonly loading =
    signal(true);

  readonly deleting =
    signal(false);

  readonly workOrder =
    signal<WorkOrder | null>(null);

  readonly workOrderId =
    signal<number | null>(null);

  readonly status = computed(
    () =>
      this.workOrder()?.status ??
      'CREATED'
  );

  readonly isTerminalStatus = computed(
    () =>
      this.status() === 'CLOSED' ||
      this.status() === 'CANCELLED'
  );

  readonly canEdit = computed(
    () =>
      !!this.workOrder() &&
      !this.isTerminalStatus()
  );

  readonly canDelete = computed(
    () =>
      this.status() === 'CREATED'
  );

  readonly pageTitle = computed(
    () =>
      this.workOrder()?.workOrderCode ??
      'Work Order Detail'
  );

  readonly technicianDisplay = computed(
    () => {
      const workOrder =
        this.workOrder();

      if (!workOrder) {
        return 'Unassigned';
      }

      return (
        workOrder.technicianName ??
        workOrder.technicianCode ??
        (
          workOrder.technicianId
            ? `Technician #${workOrder.technicianId}`
            : 'Unassigned'
        )
      );
    }
  );

  readonly scheduleStatus = computed(
    () => {
      const workOrder =
        this.workOrder();

      if (!workOrder?.scheduledAt) {
        return 'Not scheduled';
      }

      const scheduledDate =
        new Date(workOrder.scheduledAt);

      if (
        Number.isNaN(
          scheduledDate.getTime()
        )
      ) {
        return 'Not scheduled';
      }

      if (
        this.isTerminalStatus() ||
        this.status() === 'COMPLETED' ||
        this.status() === 'VERIFIED'
      ) {
        return 'Completed lifecycle';
      }

      return scheduledDate.getTime() <
        Date.now()
        ? 'Overdue'
        : 'Scheduled';
    }
  );

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    const idParam =
      this.route.snapshot.paramMap.get('id');

    const id =
      idParam
        ? Number(idParam)
        : null;

    if (
      id === null ||
      !Number.isFinite(id)
    ) {
      this.toast.error(
        'Invalid work order identifier.'
      );

      this.navigateBack();
      return;
    }

    this.workOrderId.set(id);
    this.loadWorkOrder(id);
  }

  private loadWorkOrder(
    id: number
  ): void {
    this.loading.set(true);

    this.workOrderService
      .getWorkOrderById(id)
      .pipe(
        finalize(() =>
          this.loading.set(false)
        ),
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({
        next: response => {
          const workOrder =
            response.data;

          if (!workOrder) {
            this.toast.error(
              'Work order was not found.'
            );

            this.navigateBack();
            return;
          }

          this.workOrder.set(
            workOrder
          );
        },
        error: () => {
          this.toast.error(
            'Unable to load the work order.'
          );

          this.navigateBack();
        }
      });
  }

  formatTagValue(
  value:
    | string
    | number
    | null
    | undefined
): string | undefined {
  if (
    value === null ||
    value === undefined
  ) {
    return undefined;
  }

  return String(value);
}

  refresh(): void {
    const id =
      this.workOrderId();

    if (!id) {
      return;
    }

    this.loadWorkOrder(id);
  }

  editWorkOrder(): void {
    const id =
      this.workOrderId();

    if (
      !id ||
      !this.canEdit()
    ) {
      return;
    }

    void this.router.navigate([
      '/tenant/work-orders',
      id,
      'edit'
    ]);
  }

  deleteWorkOrder(): void {
    const id =
      this.workOrderId();

    if (
      !id ||
      !this.canDelete()
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        'Delete this work order permanently?'
      );

    if (!confirmed) {
      return;
    }

    this.deleting.set(true);

    this.workOrderService
      .deleteWorkOrder(id)
      .pipe(
        finalize(() =>
          this.deleting.set(false)
        ),
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({
        next: () => {
          this.toast.success(
            'Work order deleted successfully.'
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

  navigateToSite(): void {
    const siteId =
      this.workOrder()?.siteId;

    if (!siteId) {
      return;
    }

    void this.router.navigate([
      '/tenant/sites',
      siteId
    ]);
  }

  navigateToDevice(): void {
    const deviceId =
      this.workOrder()?.deviceId;

    if (!deviceId) {
      return;
    }

    void this.router.navigate([
      '/tenant/devices',
      deviceId
    ]);
  }

  navigateToAlert(): void {
    const alertId =
      this.workOrder()?.alertId;

    if (!alertId) {
      return;
    }

    void this.router.navigate([
      '/tenant/alerts',
      alertId
    ]);
  }

  navigateToTicket(): void {
    const ticketId =
      this.workOrder()?.ticketId;

    if (!ticketId) {
      return;
    }

    void this.router.navigate([
      '/tenant/tickets',
      ticketId
    ]);
  }

  statusSeverity(
    status:
      | WorkOrderStatus
      | string
      | null
      | undefined
  ): TagSeverity {
    switch (status) {
      case 'COMPLETED':
      case 'VERIFIED':
      case 'CLOSED':
        return 'success';

      case 'ASSIGNED':
      case 'SCHEDULED':
        return 'info';

      case 'IN_PROGRESS':
        return 'warn';

      case 'CANCELLED':
        return 'danger';

      case 'CREATED':
      default:
        return 'secondary';
    }
  }

severitySeverity(
  severity:
    | Severity
    | null
    | undefined
): TagSeverity {
  switch (severity) {
    case 'CRITICAL':
      return 'danger';

    case 'HIGH':
      return 'warn';

    case 'MEDIUM':
      return 'info';

    case 'LOW':
    default:
      return 'secondary';
  }
}

prioritySeverity(
  priority:
    | number
    | string
    | null
    | undefined
): TagSeverity {
  const normalizedPriority =
    typeof priority === 'number'
      ? priority
      : Number(priority);

  if (
    Number.isNaN(
      normalizedPriority
    )
  ) {
    return 'secondary';
  }

  if (normalizedPriority >= 90) {
    return 'danger';
  }

  if (normalizedPriority >= 70) {
    return 'warn';
  }

  if (normalizedPriority >= 40) {
    return 'info';
  }

  return 'secondary';
}

  formatValue(
    value:
      | string
      | number
      | null
      | undefined
  ): string {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return '—';
    }

    return String(value);
  }

  private navigateBack(): void {
    void this.router.navigate([
      '/tenant/work-orders'
    ]);
  }

  goBack(): void {
    this.navigateBack();
  }
}