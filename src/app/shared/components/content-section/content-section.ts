import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal
} from '@angular/core';

import {
  NgClass
} from '@angular/common';

import {
  ButtonModule
} from 'primeng/button';

import {
  ProgressSpinnerModule
} from 'primeng/progressspinner';

import {
  TooltipModule
} from 'primeng/tooltip';

import {
  ContentSectionAction,
  ContentSectionActionEvent,
  ContentSectionPadding,
  ContentSectionToggleEvent,
  ContentSectionTone
} from './content-section.models';

@Component({
  selector: 'to-content-section',
  standalone: true,
  imports: [
    NgClass,
    ButtonModule,
    ProgressSpinnerModule,
    TooltipModule
  ],
  templateUrl: './content-section.html',
  styleUrl: './content-section.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class ContentSectionComponent {
  readonly title =
    input<string | null>(null);

  readonly subtitle =
    input<string | null>(null);

  readonly eyebrow =
    input<string | null>(null);

  readonly icon =
    input<string | null>(null);

  readonly count =
    input<number | string | null>(null);

  readonly tone =
    input<ContentSectionTone>(
      'secondary'
    );

  readonly actions =
    input<ContentSectionAction[]>([]);

  readonly loading =
    input(false);

  readonly collapsible =
    input(false);

  readonly collapsed =
    input(false);

  readonly bordered =
    input(true);

  readonly elevated =
    input(false);

  readonly transparent =
    input(false);

  readonly stickyHeader =
    input(false);

  readonly padding =
    input<ContentSectionPadding>(
      'default'
    );

  readonly showHeader =
    input(true);

  readonly showDivider =
    input(true);

  readonly dataTestId =
    input('content-section');

  readonly actionRequested =
    output<ContentSectionActionEvent>();

  readonly collapsedChange =
    output<boolean>();

  readonly toggleRequested =
    output<ContentSectionToggleEvent>();

  private readonly internalCollapsed =
    signal(false);

  readonly isCollapsed =
    computed(() => {
      if (!this.collapsible()) {
        return false;
      }

      return this.internalCollapsed();
    });

  readonly visibleActions =
    computed(() =>
      this.actions().filter(
        action =>
          action.visible !== false
      )
    );

  readonly hasHeaderContent =
    computed(() =>
      Boolean(
        this.title() ||
        this.subtitle() ||
        this.eyebrow() ||
        this.icon() ||
        this.count() !== null ||
        this.visibleActions().length ||
        this.collapsible()
      )
    );

  readonly sectionClasses =
    computed<Record<string, boolean>>(
      () => ({
        [`to-content-section--${this.tone()}`]:
          true,

        [`to-content-section--padding-${this.padding()}`]:
          true,

        'to-content-section--bordered':
          this.bordered(),

        'to-content-section--elevated':
          this.elevated(),

        'to-content-section--transparent':
          this.transparent(),

        'to-content-section--sticky-header':
          this.stickyHeader(),

        'to-content-section--collapsed':
          this.isCollapsed(),

        'to-content-section--loading':
          this.loading()
      })
    );

  constructor() {
    effect(
      () => {
        this.internalCollapsed.set(
          this.collapsed()
        );
      },
      {
        allowSignalWrites: true
      }
    );
  }

  requestAction(
    action: ContentSectionAction
  ): void {
    if (
      this.loading() ||
      action.disabled === true ||
      action.loading === true
    ) {
      return;
    }

    this.actionRequested.emit({
      action
    });
  }

  toggleCollapsed(): void {
    if (
      !this.collapsible() ||
      this.loading()
    ) {
      return;
    }

    const collapsed =
      !this.internalCollapsed();

    this.internalCollapsed.set(
      collapsed
    );

    this.collapsedChange.emit(
      collapsed
    );

    this.toggleRequested.emit({
      collapsed
    });
  }

  collapseIcon(): string {
    return this.isCollapsed()
      ? 'pi pi-chevron-down'
      : 'pi pi-chevron-up';
  }

  collapseLabel(): string {
    return this.isCollapsed()
      ? 'Expand section'
      : 'Collapse section';
  }
}