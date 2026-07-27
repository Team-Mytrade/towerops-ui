import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output
} from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import {
  WorkOrderFormMode
} from '../../../models/work-order-form.models';

import {
  WorkOrderStatus
} from '../../../../../../core/models/application.enums';

export type WorkOrderActionFooterStatusSeverity =
  | 'success'
  | 'info'
  | 'warn'
  | 'danger'
  | 'secondary'
  | 'contrast';

@Component({
  selector: 'to-work-order-action-footer',
  standalone: true,
  imports: [
    ButtonModule,
    ProgressSpinnerModule,
    TagModule,
    TooltipModule
  ],
  templateUrl: './action-footer.html',
  styleUrl: './action-footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkOrderActionFooterComponent {
  readonly mode =
    input.required<WorkOrderFormMode>();

  readonly status =
    input<WorkOrderStatus>('CREATED');

  readonly loading =
    input(false);

  readonly dirty =
    input(false);

  readonly valid =
    input(false);

  readonly readonly =
    input(false);

  readonly invalidFields =
    input<string[]>([]);

  readonly canSaveDraft =
    input(true);

  readonly canCreate =
    input(true);

  readonly canSave =
    input(true);

  readonly canAssign =
    input(false);

  readonly canStart =
    input(false);

  readonly canComplete =
    input(false);

  readonly canVerify =
    input(false);

  readonly canClose =
    input(false);

  readonly canCancel =
    input(false);

  readonly canDelete =
    input(false);

  readonly cancel =
    output<void>();

  readonly saveDraft =
    output<void>();

  readonly create =
    output<void>();

  readonly save =
    output<void>();

  readonly assign =
    output<void>();

  readonly start =
    output<void>();

  readonly complete =
    output<void>();

  readonly verify =
    output<void>();

  readonly close =
    output<void>();

  readonly cancelOrder =
    output<void>();

  readonly delete =
    output<void>();

  readonly isCreateMode = computed(
    () => this.mode() === 'CREATE'
  );

  readonly isEditMode = computed(
    () => this.mode() === 'EDIT'
  );

  readonly isTerminalStatus = computed(
    () =>
      this.status() === 'CLOSED' ||
      this.status() === 'CANCELLED'
  );

  readonly isActionLocked = computed(
    () =>
      this.loading() ||
      this.readonly() ||
      this.isTerminalStatus()
  );

  readonly normalizedStatusLabel = computed(
    () =>
      this.status()
        .replaceAll('_', ' ')
        .toLowerCase()
        .replace(/\b\w/g, character =>
          character.toUpperCase()
        )
  );

  readonly statusSeverity =
    computed<WorkOrderActionFooterStatusSeverity>(
      () => {
        switch (this.status()) {
          case 'ASSIGNED':
          case 'SCHEDULED':
            return 'info';

          case 'IN_PROGRESS':
            return 'warn';

          case 'COMPLETED':
          case 'CLOSED':
            return 'success';

          case 'VERIFIED':
            return 'contrast';

          case 'CANCELLED':
            return 'danger';

          case 'CREATED':
          default:
            return 'secondary';
        }
      }
    );

  readonly nextActionLabel = computed(() => {
    if (this.isCreateMode()) {
      return 'Create Work Order';
    }

    switch (this.status()) {
      case 'CREATED':
        return 'Assign Technician';

      case 'ASSIGNED':
      case 'SCHEDULED':
        return 'Start Work';

      case 'IN_PROGRESS':
        return 'Complete Work';

      case 'COMPLETED':
        return 'Verify Work';

      case 'VERIFIED':
        return 'Close Work Order';

      case 'CLOSED':
        return 'Work Order Closed';

      case 'CANCELLED':
        return 'Work Order Cancelled';

      default:
        return 'Save Changes';
    }
  });

  readonly workflowMessage = computed(() => {
    if (this.isCreateMode()) {
      return this.valid()
        ? 'The work order is ready to be created.'
        : 'Complete the required fields before creating the work order.';
    }

    switch (this.status()) {
      case 'CREATED':
        return 'Assign a technician before starting field work.';

      case 'ASSIGNED':
      case 'SCHEDULED':
        return 'The work order is ready to be started.';

      case 'IN_PROGRESS':
        return 'Add resolution and labor details before completing the work order.';

      case 'COMPLETED':
        return 'Review the completed work and verify the resolution.';

      case 'VERIFIED':
        return 'The verified work order can now be closed.';

      case 'CLOSED':
        return 'This work order is closed and cannot be modified.';

      case 'CANCELLED':
        return 'This work order has been cancelled.';

      default:
        return 'Review the work order details before continuing.';
    }
  });

  readonly validationMessage = computed(() => {
    const remaining =
      this.invalidFields().length;

    if (this.valid()) {
      return this.dirty()
        ? 'Ready to save'
        : 'No unsaved changes';
    }

    if (remaining === 0) {
      return 'Some fields require attention';
    }

    return remaining === 1
      ? '1 required field remaining'
      : `${remaining} required fields remaining`;
  });

  readonly validationState = computed<
    'valid' | 'invalid' | 'clean'
  >(() => {
    if (!this.valid()) {
      return 'invalid';
    }

    return this.dirty()
      ? 'valid'
      : 'clean';
  });

  readonly primaryActionDisabled = computed(
    () =>
      this.loading() ||
      this.readonly() ||
      !this.valid()
  );

  readonly saveDisabled = computed(
    () =>
      this.loading() ||
      this.readonly() ||
      !this.dirty()
  );

  onCancel(): void {
    if (this.loading()) {
      return;
    }

    this.cancel.emit();
  }

  onSaveDraft(): void {
    if (
      this.loading() ||
      this.readonly() ||
      !this.canSaveDraft()
    ) {
      return;
    }

    this.saveDraft.emit();
  }

  onCreate(): void {
    if (
      this.primaryActionDisabled() ||
      !this.canCreate()
    ) {
      return;
    }

    this.create.emit();
  }

  onSave(): void {
    if (
      this.saveDisabled() ||
      !this.canSave()
    ) {
      return;
    }

    this.save.emit();
  }

  onAssign(): void {
    if (
      this.isActionLocked() ||
      !this.valid() ||
      !this.canAssign()
    ) {
      return;
    }

    this.assign.emit();
  }

  onStart(): void {
    if (
      this.isActionLocked() ||
      !this.canStart()
    ) {
      return;
    }

    this.start.emit();
  }

  onComplete(): void {
    if (
      this.isActionLocked() ||
      !this.valid() ||
      !this.canComplete()
    ) {
      return;
    }

    this.complete.emit();
  }

  onVerify(): void {
    if (
      this.isActionLocked() ||
      !this.canVerify()
    ) {
      return;
    }

    this.verify.emit();
  }

  onClose(): void {
    if (
      this.isActionLocked() ||
      !this.canClose()
    ) {
      return;
    }

    this.close.emit();
  }

  onCancelOrder(): void {
    if (
      this.loading() ||
      this.readonly() ||
      !this.canCancel() ||
      this.isTerminalStatus()
    ) {
      return;
    }

    this.cancelOrder.emit();
  }

  onDelete(): void {
    if (
      this.loading() ||
      this.readonly() ||
      !this.canDelete()
    ) {
      return;
    }

    this.delete.emit();
  }
}