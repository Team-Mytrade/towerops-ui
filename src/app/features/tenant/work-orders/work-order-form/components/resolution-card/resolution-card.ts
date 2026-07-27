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
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';

import {
  WORK_ORDER_LABOR_HOURS_MAX,
  WORK_ORDER_LABOR_HOURS_MIN,
  WORK_ORDER_REMARKS_MAX_LENGTH,
  WORK_ORDER_RESOLUTION_MAX_LENGTH
} from '../../../constants/work-order-form.constants';

@Component({
  selector: 'to-work-order-resolution-card',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePickerModule,
    InputNumberModule,
    TextareaModule,
    TooltipModule
  ],
  templateUrl: './resolution-card.html',
  styleUrl: './resolution-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkOrderResolutionCardComponent {
  readonly form = input.required<FormGroup>();

  readonly readonly = input(false);

  readonly completionRequired = input(false);

  readonly startedAtChanged =
    output<Date | null>();

  readonly completedAtChanged =
    output<Date | null>();

  readonly laborHoursChanged =
    output<number | null>();

  readonly resolutionMaxLength =
    WORK_ORDER_RESOLUTION_MAX_LENGTH;

  readonly remarksMaxLength =
    WORK_ORDER_REMARKS_MAX_LENGTH;

  readonly laborHoursMin =
    WORK_ORDER_LABOR_HOURS_MIN;

  readonly laborHoursMax =
    WORK_ORDER_LABOR_HOURS_MAX;

  readonly resolutionLength = computed(() => {
    const value =
      this.form().get('resolution')?.value;

    return typeof value === 'string'
      ? value.length
      : 0;
  });

  readonly remarksLength = computed(() => {
    const value =
      this.form().get('remarks')?.value;

    return typeof value === 'string'
      ? value.length
      : 0;
  });

  readonly startedAt = computed(() => {
    const value =
      this.form().get('startedAt')?.value;

    return value instanceof Date
      ? value
      : null;
  });

  readonly completedAt = computed(() => {
    const value =
      this.form().get('completedAt')?.value;

    return value instanceof Date
      ? value
      : null;
  });

  readonly invalidCompletionRange =
    computed(() => {
      const startedAt = this.startedAt();
      const completedAt = this.completedAt();

      if (!startedAt || !completedAt) {
        return false;
      }

      return completedAt.getTime() <
        startedAt.getTime();
    });

  onStartedAtChange(
    value: Date | null | undefined
  ): void {
    this.startedAtChanged.emit(
      value ?? null
    );
  }

  onCompletedAtChange(
    value: Date | null | undefined
  ): void {
    this.completedAtChanged.emit(
      value ?? null
    );
  }

  onLaborHoursChange(
    value: number | null | undefined
  ): void {
    this.laborHoursChanged.emit(
      value ?? null
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

    if (control.errors['maxlength']) {
      return `Maximum length is ${
        control.errors['maxlength']
          .requiredLength
      } characters.`;
    }

    if (control.errors['min']) {
      return `Minimum value is ${
        control.errors['min'].min
      }.`;
    }

    if (control.errors['max']) {
      return `Maximum value is ${
        control.errors['max'].max
      }.`;
    }

    return 'Enter a valid value.';
  }
}