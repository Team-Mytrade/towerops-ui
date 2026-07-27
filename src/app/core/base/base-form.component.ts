import {
  AbstractControl,
  FormGroup
} from '@angular/forms';
import {
  Directive,
  signal
} from '@angular/core';

import { BaseComponent } from './base.component';

@Directive()
export abstract class BaseFormComponent<
  TForm extends FormGroup = FormGroup
> extends BaseComponent {
  abstract readonly form: TForm;

  readonly submitted = signal(false);
  readonly submitting = signal(false);

  protected validateForm(): boolean {
    this.submitted.set(true);

    if (this.form.valid) {
      return true;
    }

    this.form.markAllAsTouched();
    this.focusFirstInvalidControl();

    return false;
  }

  protected startSubmitting(): void {
    this.submitting.set(true);
    this.form.disable({
      emitEvent: false
    });
  }

  protected stopSubmitting(): void {
    this.submitting.set(false);
    this.form.enable({
      emitEvent: false
    });
  }

  protected resetForm(
    value?: Parameters<TForm['reset']>[0]
  ): void {
    this.form.reset(value);
    this.submitted.set(false);
    this.submitting.set(false);
    this.clearPageError();
  }

  protected getControl(
    controlName: string
  ): AbstractControl | null {
    return this.form.get(controlName);
  }

  protected isControlInvalid(
    controlName: string
  ): boolean {
    const control = this.getControl(controlName);

    if (!control) {
      return false;
    }

    return (
      control.invalid &&
      (
        control.touched ||
        control.dirty ||
        this.submitted()
      )
    );
  }

  protected hasControlError(
    controlName: string,
    errorName: string
  ): boolean {
    const control = this.getControl(controlName);

    return Boolean(
      control &&
      this.isControlInvalid(controlName) &&
      control.hasError(errorName)
    );
  }

  protected getControlError(
    controlName: string,
    label: string
  ): string | null {
    const control = this.getControl(controlName);

    if (
      !control ||
      !this.isControlInvalid(controlName)
    ) {
      return null;
    }

    if (control.hasError('required')) {
      return `${label} is required.`;
    }

    if (control.hasError('email')) {
      return `Enter a valid ${label.toLowerCase()}.`;
    }

    if (control.hasError('minlength')) {
      const requiredLength =
        control.getError('minlength')?.requiredLength;

      return `${label} must contain at least ${requiredLength} characters.`;
    }

    if (control.hasError('maxlength')) {
      const requiredLength =
        control.getError('maxlength')?.requiredLength;

      return `${label} cannot exceed ${requiredLength} characters.`;
    }

    if (control.hasError('min')) {
      const minimum =
        control.getError('min')?.min;

      return `${label} must be at least ${minimum}.`;
    }

    if (control.hasError('max')) {
      const maximum =
        control.getError('max')?.max;

      return `${label} cannot exceed ${maximum}.`;
    }

    if (control.hasError('pattern')) {
      return `${label} has an invalid format.`;
    }

    return `${label} is invalid.`;
  }

  private focusFirstInvalidControl(): void {
    setTimeout(() => {
      const invalidElement =
        document.querySelector<HTMLElement>(
          '.ng-invalid:not(form), [aria-invalid="true"]'
        );

      invalidElement?.focus();
    });
  }
}