import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input
} from '@angular/core';

import {
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';

import {
  WORK_ORDER_TITLE_MAX_LENGTH,
  WORK_ORDER_DESCRIPTION_MAX_LENGTH
} from '../../../constants/work-order-form.constants';

@Component({
  selector: 'to-work-order-card',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    TagModule
  ],
  templateUrl: './work-order-card.html',
  styleUrl: './work-order-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkOrderCardComponent {

  readonly form =
    input.required<FormGroup>();

  readonly readonly =
    input(false);

  readonly editMode =
    input(false);

  readonly titleMaxLength =
    WORK_ORDER_TITLE_MAX_LENGTH;

  readonly descriptionMaxLength =
    WORK_ORDER_DESCRIPTION_MAX_LENGTH;

  readonly titleLength = computed(() =>
    this.form()
      .get('title')
      ?.value?.length ?? 0
  );

  readonly descriptionLength = computed(() =>
    this.form()
      .get('description')
      ?.value?.length ?? 0
  );

  isInvalid(name: string): boolean {

    const control =
      this.form().get(name);

    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty)
    );
  }

  error(name: string): string {

    const control =
      this.form().get(name);

    if (!control?.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'Required';
    }

    if (control.errors['maxlength']) {
      return 'Too long';
    }

    return 'Invalid value';
  }

}