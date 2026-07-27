import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

import {
  ConfirmActionOption,
  ConfirmActionPayload,
  ConfirmActionTone
} from './confirm-action-panel.models';

type PrimeButtonSeverity =
  | 'secondary'
  | 'success'
  | 'info'
  | 'warn'
  | 'help'
  | 'danger'
  | 'contrast'
  | undefined;

@Component({
  selector: 'to-confirm-action-panel',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    SelectModule,
    TextareaModule
  ],
  templateUrl: './confirm-action-panel.html',
  styleUrl: './confirm-action-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmActionPanelComponent {
  readonly title =
    input.required<string>();

  readonly message =
    input<string | null>(null);

  readonly icon =
    input('pi pi-exclamation-triangle');

  readonly tone =
    input<ConfirmActionTone>('warning');

  readonly inputLabel =
    input('Remarks');

  readonly inputPlaceholder =
    input('Enter remarks');

  readonly inputRequired =
    input(false);

  readonly maxLength =
    input(1000);

  readonly initialValue =
    input('');

  readonly options =
    input<ConfirmActionOption[]>([]);

  readonly optionLabel =
    input('Reason');

  readonly optionPlaceholder =
    input('Select reason');

  readonly optionRequired =
    input(false);

  readonly confirmLabel =
    input('Confirm');

  readonly confirmIcon =
    input('pi pi-check');

  readonly cancelLabel =
    input('Cancel');

  readonly loading =
    input(false);

  readonly disabled =
    input(false);

  readonly compact =
    input(false);

  readonly dataTestId =
    input('confirm-action-panel');

  readonly confirmed =
    output<ConfirmActionPayload>();

  readonly cancelled =
    output<void>();

  readonly value =
    signal('');

  readonly selectedOption =
    signal<string | null>(null);

  readonly validationMessage =
    signal<string | null>(null);

  readonly canSubmit = computed(() => {
    if (
      this.loading() ||
      this.disabled()
    ) {
      return false;
    }

    if (
      this.inputRequired() &&
      !this.value().trim()
    ) {
      return false;
    }

    if (
      this.optionRequired() &&
      !this.selectedOption()
    ) {
      return false;
    }

    return true;
  });

  constructor() {
    queueMicrotask(() => {
      this.value.set(
        this.initialValue()
      );
    });
  }

  confirm(): void {
    if (!this.canSubmit()) {
      this.validationMessage.set(
        this.validationText()
      );
      return;
    }

    this.validationMessage.set(null);

    const selectedOption =
      this.selectedOption();

    const remarks =
      this.value().trim();

    const finalValue = [
      selectedOption,
      remarks
    ]
      .filter(Boolean)
      .join(': ');

    this.confirmed.emit({
      value: finalValue
    });
  }

  cancel(): void {
    if (this.loading()) {
      return;
    }

    this.cancelled.emit();
  }

  onValueChange(
    value: string
  ): void {
    this.value.set(value);

    if (this.validationMessage()) {
      this.validationMessage.set(null);
    }
  }

  onOptionChange(
    value: string | null
  ): void {
    this.selectedOption.set(value);

    if (this.validationMessage()) {
      this.validationMessage.set(null);
    }
  }

  private validationText(): string {
    if (
      this.optionRequired() &&
      !this.selectedOption()
    ) {
      return `${this.optionLabel()} is required.`;
    }

    if (
      this.inputRequired() &&
      !this.value().trim()
    ) {
      return `${this.inputLabel()} is required.`;
    }

    return 'Complete the required fields.';
  }

  confirmButtonSeverity(): PrimeButtonSeverity {
  switch (this.tone()) {
    case 'warning':
      return 'warn';

    case 'success':
      return 'success';

    case 'danger':
      return 'danger';

    case 'info':
      return 'info';

    case 'secondary':
      return 'secondary';

    case 'primary':
    default:
      return undefined;
  }
}
}