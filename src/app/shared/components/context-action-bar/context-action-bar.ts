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

import type {
  ContextActionBarAction,
  ContextActionBarActionEvent,
  ContextActionBarCloseEvent,
  ContextActionBarPlacement,
  ContextActionBarRefreshEvent,
  ContextActionBarSeverity,
  ContextActionBarTone
} from './context-action-bar.models';

@Component({
  selector: 'to-context-action-bar',
  standalone: true,
  imports: [
    NgClass,
    ButtonModule,
    TooltipModule
  ],
  templateUrl:
    './context-action-bar.html',
  styleUrl:
    './context-action-bar.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class ContextActionBarComponent {
  readonly entityId =
    input<string | number | null>(
      null
    );

  readonly title =
    input<string | null>(null);

  readonly subtitle =
    input<string | null>(null);

  readonly icon =
    input<string | null>(null);

  readonly actions =
    input<ContextActionBarAction[]>([]);

  readonly tone =
    input<ContextActionBarTone>(
      'default'
    );

  readonly placement =
    input<ContextActionBarPlacement>(
      'inline'
    );

  readonly compact =
    input(false);

  readonly loading =
    input(false);

  readonly disabled =
    input(false);

  readonly showRefresh =
    input(false);

  readonly refreshLoading =
    input(false);

  readonly refreshLabel =
    input('Refresh');

  readonly showClose =
    input(false);

  readonly closeLabel =
    input('Close');

  readonly collapseSecondaryActions =
    input(false);

  readonly dataTestId =
    input('context-action-bar');

  readonly actionRequested =
    output<ContextActionBarActionEvent>();

  readonly refreshRequested =
    output<ContextActionBarRefreshEvent>();

  readonly closeRequested =
    output<ContextActionBarCloseEvent>();

  readonly visibleActions =
    computed(() =>
      this.actions().filter(
        action =>
          action.visible !== false
      )
    );

  readonly primaryActions =
    computed(() =>
      this.visibleActions().filter(
        action =>
          action.primary === true
      )
    );

  readonly secondaryActions =
    computed(() =>
      this.visibleActions().filter(
        action =>
          action.primary !== true
      )
    );

  readonly hasSummary =
    computed(
      () =>
        Boolean(
          this.title() ||
          this.subtitle() ||
          this.icon()
        )
    );

  readonly hasActions =
    computed(
      () =>
        this.visibleActions().length >
          0 ||
        this.showRefresh() ||
        this.showClose()
    );

  readonly barClasses =
    computed<Record<string, boolean>>(
      () => ({
        [`to-context-action-bar--${this.tone()}`]:
          true,

        [`to-context-action-bar--${this.placement()}`]:
          true,

        'to-context-action-bar--compact':
          this.compact(),

        'to-context-action-bar--loading':
          this.loading(),

        'to-context-action-bar--disabled':
          this.disabled(),

        'to-context-action-bar--summary':
          this.hasSummary(),

        'to-context-action-bar--actions':
          this.hasActions()
      })
    );

  requestAction(
    action: ContextActionBarAction
  ): void {
    if (
      this.disabled() ||
      this.loading() ||
      action.disabled === true ||
      action.loading === true
    ) {
      return;
    }

    this.actionRequested.emit({
      actionId: action.id,
      action,
      entityId: this.entityId()
    });
  }

  requestRefresh(): void {
    if (
      this.disabled() ||
      this.loading() ||
      this.refreshLoading()
    ) {
      return;
    }

    this.refreshRequested.emit({
      entityId: this.entityId()
    });
  }

  requestClose(): void {
    if (
      this.disabled() ||
      this.loading()
    ) {
      return;
    }

    this.closeRequested.emit({
      entityId: this.entityId()
    });
  }

  actionSeverity(
    action: ContextActionBarAction
  ): ContextActionBarSeverity {
    if (action.destructive) {
      return 'danger';
    }

    return (
      action.severity ??
      (
        action.primary
          ? 'contrast'
          : 'secondary'
      )
    );
  }

  actionTooltip(
    action: ContextActionBarAction
  ): string {
    return (
      action.tooltip ??
      action.label
    );
  }

  actionBadge(
    action: ContextActionBarAction
  ): string | null {
    const badge =
      action.badge;

    if (
      badge === null ||
      badge === undefined ||
      badge === ''
    ) {
      return null;
    }

    return String(badge);
  }
}