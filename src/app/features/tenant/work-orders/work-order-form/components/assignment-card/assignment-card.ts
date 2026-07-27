import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output
} from '@angular/core';
import {
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';

import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';

import {
  Severity
} from '../../../../../../core/models/application.enums';

import {
  WORK_ORDER_ESTIMATED_HOURS_MAX,
  WORK_ORDER_ESTIMATED_HOURS_MIN,
  WORK_ORDER_FORM_SEVERITY_OPTIONS,
  WORK_ORDER_PRIORITY_OPTIONS
} from '../../../constants/work-order-form.constants';

import {
  WorkOrderFormOption,
  WorkOrderTechnicianOption
} from '../../../models/work-order-form.models';

@Component({
  selector: 'to-work-order-assignment-card',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePickerModule,
    InputNumberModule,
    SelectModule,
    TooltipModule
  ],
  templateUrl: './assignment-card.html',
  styleUrl: './assignment-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkOrderAssignmentCardComponent {
  readonly form = input.required<FormGroup>();

  readonly technicians =
    input<WorkOrderTechnicianOption[]>([]);

  readonly loadingTechnicians =
    input(false);

  readonly readonly =
    input(false);

  readonly technicianChanged =
    output<number | null>();

  readonly scheduledAtChanged =
    output<Date | null>();

  readonly severityOptions:
    WorkOrderFormOption<Severity>[] = [
      ...WORK_ORDER_FORM_SEVERITY_OPTIONS
    ];

  readonly priorityOptions:
    WorkOrderFormOption<number>[] = [
      ...WORK_ORDER_PRIORITY_OPTIONS
    ];

  readonly estimatedHoursMin =
    WORK_ORDER_ESTIMATED_HOURS_MIN;

  readonly estimatedHoursMax =
    WORK_ORDER_ESTIMATED_HOURS_MAX;

  readonly activeTechnicians = computed(() =>
    this.technicians().filter(
      technician => technician.active !== false
    )
  );

  onTechnicianChange(
    technicianId: number | null
  ): void {
    this.technicianChanged.emit(
      technicianId ?? null
    );
  }

  onScheduledAtChange(
    scheduledAt: Date | null
  ): void {
    this.scheduledAtChanged.emit(
      scheduledAt ?? null
    );
  }

  isInvalid(controlName: string): boolean {
    const control =
      this.form().get(controlName);

    return Boolean(
      control?.invalid &&
      (control.dirty || control.touched)
    );
  }

  getErrorMessage(
    controlName: string
  ): string {
    const control =
      this.form().get(controlName);

    if (!control?.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }

    if (control.errors['min']) {
      return `Minimum value is ${control.errors['min'].min}.`;
    }

    if (control.errors['max']) {
      return `Maximum value is ${control.errors['max'].max}.`;
    }

    return 'Enter a valid value.';
  }
}