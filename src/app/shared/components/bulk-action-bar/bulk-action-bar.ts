import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output
} from '@angular/core';

import {
  NgClass
} from '@angular/common';

import {
  ButtonModule
} from 'primeng/button';

import {
  TooltipModule
} from 'primeng/tooltip';

import {
  BulkActionBarAction,
  BulkActionBarActionEvent,
  BulkActionBarClearEvent,
  BulkActionBarTone
} from './bulk-action-bar.models';

@Component({
  selector: 'to-bulk-action-bar',
  standalone: true,
  imports: [
    NgClass,
    ButtonModule,
    TooltipModule
  ],
  templateUrl:
    './bulk-action-bar.html',
  styleUrl:
    './bulk-action-bar.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class BulkActionBarComponent {
  readonly selectedCount =
    input.required<number>();

  readonly label =
    input('selected');

  readonly singularLabel =
    input<string | null>(null);

  readonly pluralLabel =
    input<string | null>(null);

  readonly actions =
    input<BulkActionBarAction[]>([]);

  readonly tone =
    input<BulkActionBarTone>(
      'primary'
    );

  readonly icon =
    input('pi pi-check-square');

  readonly showClear =
    input(true);

  readonly clearLabel =
    input('Clear selection');

  readonly sticky =
    input(false);

  readonly floating =
    input(false);

  readonly compact =
    input(false);

  readonly loading =
    input(false);

  readonly disabled =
    input(false);

  readonly dataTestId =
    input('bulk-action-bar');

  readonly actionRequested =
    output<BulkActionBarActionEvent>();

  readonly clearRequested =
    output<BulkActionBarClearEvent>();

  readonly visibleActions =
    computed(() =>
      this.actions().filter(
        action =>
          action.visible !== false
      )
    );

  readonly hasSelection =
    computed(
      () =>
        this.selectedCount() > 0
    );

  readonly selectionText =
    computed(() => {
      const count =
        this.selectedCount();

      const singular =
        this.singularLabel() ??
        this.label();

      const plural =
        this.pluralLabel() ??
        this.label();

      return `${count} ${
        count === 1
          ? singular
          : plural
      } selected`;
    });

  readonly barClasses =
    computed<Record<string, boolean>>(
      () => ({
        [`to-bulk-action-bar--${this.tone()}`]:
          true,

        'to-bulk-action-bar--sticky':
          this.sticky(),

        'to-bulk-action-bar--floating':
          this.floating(),

        'to-bulk-action-bar--compact':
          this.compact(),

        'to-bulk-action-bar--loading':
          this.loading(),

        'to-bulk-action-bar--disabled':
          this.disabled()
      })
    );

  requestAction(
    action: BulkActionBarAction
  ): void {
    if (
      this.loading() ||
      this.disabled() ||
      action.disabled === true ||
      action.loading === true
    ) {
      return;
    }

    this.actionRequested.emit({
      action,
      selectedCount:
        this.selectedCount()
    });
  }

  requestClear(): void {
    if (
      this.loading() ||
      this.disabled()
    ) {
      return;
    }

    this.clearRequested.emit({
      selectedCount:
        this.selectedCount()
    });
  }
}