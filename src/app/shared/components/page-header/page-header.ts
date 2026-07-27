import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';

import {
  ButtonModule
} from 'primeng/button';

import {
  PageHeaderAction
} from './page-header.models';

@Component({
  selector: 'to-page-header',
  standalone: true,
  imports: [
    ButtonModule
  ],
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class PageHeaderComponent {
  readonly eyebrow = input<string | null>(null);

  readonly title = input.required<string>();

  readonly description =
    input<string | null>(null);

  readonly showBack = input(false);

  readonly backLabel =
    input('Back');

  readonly backIcon =
    input('pi pi-arrow-left');

  readonly showRefresh = input(false);

  readonly refreshLabel =
    input('Refresh');

  readonly refreshIcon =
    input('pi pi-refresh');

  readonly refreshLoading =
    input(false);

  readonly refreshDisabled =
    input(false);

  readonly primaryLabel =
    input<string | null>(null);

  readonly primaryIcon =
    input<string | null>(null);

  readonly primaryIconPosition =
    input<'left' | 'right'>('left');

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
    input<PageHeaderAction[]>([]);

  readonly compact = input(false);

  readonly sticky = input(false);

  readonly dataTestId =
    input('page-header');

  readonly backRequested =
    output<void>();

  readonly refreshRequested =
    output<void>();

  readonly primaryRequested =
    output<void>();

  readonly secondaryRequested =
    output<void>();

  readonly actionRequested =
    output<PageHeaderAction>();

  back(): void {
    if (!this.showBack()) {
      return;
    }

    this.backRequested.emit();
  }

  refresh(): void {
    if (
      !this.showRefresh() ||
      this.refreshLoading() ||
      this.refreshDisabled()
    ) {
      return;
    }

    this.refreshRequested.emit();
  }

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
    action: PageHeaderAction
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
    action: PageHeaderAction
  ): boolean {
    return action.visible !== false;
  }

  actionSeverity(
    action: PageHeaderAction
  ):
    | 'secondary'
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'contrast'
    | undefined {
    return action.severity === 'primary'
      ? undefined
      : action.severity;
  }
}