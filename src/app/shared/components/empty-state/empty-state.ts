import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';

import { ButtonModule } from 'primeng/button';

import {
  EmptyStateAction,
  EmptyStateTone
} from './empty-state.models';

@Component({
  selector: 'to-empty-state',
  standalone: true,
  imports: [
    ButtonModule
  ],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  readonly icon =
    input('pi pi-inbox');

  readonly title =
    input('No records found');

  readonly message =
    input(
      'There are no records to display.'
    );

  readonly tone =
    input<EmptyStateTone>('primary');

  readonly compact =
    input(false);

  readonly loading =
    input(false);

  readonly loadingMessage =
    input('Loading...');

  readonly primaryLabel =
    input<string | null>(null);

  readonly primaryIcon =
    input<string | null>(null);

  readonly primaryLoading =
    input(false);

  readonly primaryDisabled =
    input(false);

  readonly secondaryLabel =
    input<string | null>(null);

  readonly secondaryIcon =
    input<string | null>(null);

  readonly secondaryLoading =
    input(false);

  readonly secondaryDisabled =
    input(false);

  readonly actions =
    input<EmptyStateAction[]>([]);

  readonly dataTestId =
    input('empty-state');

  readonly primaryRequested =
    output<void>();

  readonly secondaryRequested =
    output<void>();

  readonly actionRequested =
    output<EmptyStateAction>();

  primaryAction(): void {
    if (
      !this.primaryLabel() ||
      this.primaryLoading() ||
      this.primaryDisabled()
    ) {
      return;
    }

    this.primaryRequested.emit();
  }

  secondaryAction(): void {
    if (
      !this.secondaryLabel() ||
      this.secondaryLoading() ||
      this.secondaryDisabled()
    ) {
      return;
    }

    this.secondaryRequested.emit();
  }

  triggerAction(
    action: EmptyStateAction
  ): void {
    if (
      action.visible === false ||
      action.disabled === true ||
      action.loading === true
    ) {
      return;
    }

    this.actionRequested.emit(action);
  }

  isActionVisible(
    action: EmptyStateAction
  ): boolean {
    return action.visible !== false;
  }
}