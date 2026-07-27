import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal
} from '@angular/core';

import { NgClass } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';

import {
  InlineFormWorkspaceAction,
  InlineFormWorkspaceActionEvent,
  InlineFormWorkspaceCloseEvent,
  InlineFormWorkspaceMode,
  InlineFormWorkspaceStep,
  InlineFormWorkspaceStepEvent,
  InlineFormWorkspaceSubmitEvent,
  InlineFormWorkspaceTone,
  InlineFormWorkspaceWidth
} from './inline-form-workspace.models';

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
  selector: 'to-inline-form-workspace',
  standalone: true,
  imports: [
    NgClass,
    ButtonModule,
    ProgressBarModule,
    TooltipModule
  ],
  templateUrl:
    './inline-form-workspace.html',
  styleUrl:
    './inline-form-workspace.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class InlineFormWorkspaceComponent {
  readonly title =
    input.required<string>();

  readonly subtitle =
    input<string | null>(null);

  readonly eyebrow =
    input<string | null>(null);

  readonly icon =
    input<string>('pi pi-pencil');

  readonly mode =
    input<InlineFormWorkspaceMode>(
      'create'
    );

  readonly tone =
    input<InlineFormWorkspaceTone>(
      'primary'
    );

  readonly width =
    input<InlineFormWorkspaceWidth>(
      'default'
    );

  readonly steps =
    input<InlineFormWorkspaceStep[]>([]);

  readonly activeStepId =
    input<string | null>(null);

  readonly actions =
    input<InlineFormWorkspaceAction[]>([]);

  readonly loading =
    input(false);

  readonly submitting =
    input(false);

  readonly dirty =
    input(false);

  readonly valid =
    input(true);

  readonly showSteps =
    input(true);

  readonly showProgress =
    input(true);

  readonly showClose =
    input(true);

  readonly showCancel =
    input(true);

  readonly showSubmit =
    input(true);

  readonly stickyHeader =
    input(true);

  readonly stickyFooter =
    input(true);

  readonly submitLabel =
    input<string | null>(null);

  readonly cancelLabel =
    input('Cancel');

  readonly closeLabel =
    input('Close workspace');

  readonly dataTestId =
    input('inline-form-workspace');

  readonly stepChanged =
    output<InlineFormWorkspaceStepEvent>();

  readonly actionRequested =
    output<InlineFormWorkspaceActionEvent>();

  readonly closeRequested =
    output<InlineFormWorkspaceCloseEvent>();

  readonly cancelRequested =
    output<void>();

  readonly submitRequested =
    output<InlineFormWorkspaceSubmitEvent>();

  private readonly internalStepId =
    signal<string | null>(null);

  readonly visibleSteps =
    computed(() =>
      this.steps().filter(
        step =>
          step.visible !== false
      )
    );

  readonly resolvedStepId =
    computed(() => {
      const requested =
        this.activeStepId();

      if (
        requested &&
        this.isSelectableStep(requested)
      ) {
        return requested;
      }

      const internal =
        this.internalStepId();

      if (
        internal &&
        this.isSelectableStep(internal)
      ) {
        return internal;
      }

      return (
        this.visibleSteps().find(
          step =>
            step.disabled !== true
        )?.id ?? null
      );
    });

  readonly activeStep =
    computed<InlineFormWorkspaceStep | null>(
      () => {
        const stepId =
          this.resolvedStepId();

        if (!stepId) {
          return null;
        }

        return (
          this.visibleSteps().find(
            step =>
              step.id === stepId
          ) ?? null
        );
      }
    );

  readonly activeStepIndex =
    computed(() => {
      const stepId =
        this.resolvedStepId();

      return this.visibleSteps().findIndex(
        step =>
          step.id === stepId
      );
    });

  readonly completedStepCount =
    computed(() =>
      this.visibleSteps().filter(
        step =>
          step.completed === true
      ).length
    );

  readonly progressValue =
    computed(() => {
      const steps =
        this.visibleSteps();

      if (!steps.length) {
        return 0;
      }

      if (
        this.completedStepCount() ===
        steps.length
      ) {
        return 100;
      }

      const activeIndex =
        this.activeStepIndex();

      if (activeIndex < 0) {
        return 0;
      }

      return Math.round(
        ((activeIndex + 1) /
          steps.length) *
          100
      );
    });

  readonly visibleActions =
    computed(() =>
      this.actions().filter(
        action =>
          action.visible !== false
      )
    );

  readonly workspaceClasses =
    computed<Record<string, boolean>>(
      () => ({
        [`to-inline-form-workspace--${this.mode()}`]:
          true,

        [`to-inline-form-workspace--${this.tone()}`]:
          true,

        [`to-inline-form-workspace--${this.width()}`]:
          true,

        'to-inline-form-workspace--sticky-header':
          this.stickyHeader(),

        'to-inline-form-workspace--sticky-footer':
          this.stickyFooter(),

        'to-inline-form-workspace--loading':
          this.loading(),

        'to-inline-form-workspace--dirty':
          this.dirty()
      })
    );

  readonly resolvedSubmitLabel =
    computed(() => {
      if (this.submitLabel()) {
        return this.submitLabel()!;
      }

      switch (this.mode()) {
        case 'create':
          return 'Create';

        case 'edit':
          return 'Save Changes';

        case 'review':
          return 'Confirm';

        case 'view':
        default:
          return 'Done';
      }
    });

  readonly submitIcon =
    computed(() => {
      switch (this.mode()) {
        case 'create':
          return 'pi pi-plus';

        case 'edit':
          return 'pi pi-check';

        case 'review':
          return 'pi pi-verified';

        case 'view':
        default:
          return 'pi pi-check';
      }
    });

  readonly submitSeverity =
    computed<PrimeButtonSeverity>(
      () => {
        switch (this.tone()) {
          case 'success':
            return 'success';

          case 'info':
            return 'info';

          case 'warning':
            return 'warn';

          case 'danger':
            return 'danger';

          case 'secondary':
            return 'secondary';

          case 'primary':
          default:
            return undefined;
        }
      }
    );

  constructor() {
    effect(
      () => {
        const requested =
          this.activeStepId();

        if (
          requested &&
          this.isSelectableStep(requested)
        ) {
          this.internalStepId.set(
            requested
          );

          return;
        }

        const current =
          this.internalStepId();

        if (
          current &&
          this.isSelectableStep(current)
        ) {
          return;
        }

        this.internalStepId.set(
          this.visibleSteps().find(
            step =>
              step.disabled !== true
          )?.id ?? null
        );
      },
      {
        allowSignalWrites: true
      }
    );
  }

  selectStep(
    step: InlineFormWorkspaceStep
  ): void {
    if (
      step.disabled === true ||
      this.loading() ||
      this.submitting()
    ) {
      return;
    }

    const previousStepId =
      this.resolvedStepId();

    if (previousStepId === step.id) {
      return;
    }

    this.internalStepId.set(
      step.id
    );

    this.stepChanged.emit({
      previousStepId,
      stepId: step.id,
      step
    });
  }

  selectPreviousStep(): void {
    const previous =
      this.findAvailableStep(-1);

    if (previous) {
      this.selectStep(previous);
    }
  }

  selectNextStep(): void {
    const next =
      this.findAvailableStep(1);

    if (next) {
      this.selectStep(next);
    }
  }

  requestAction(
    action: InlineFormWorkspaceAction
  ): void {
    if (
      this.loading() ||
      this.submitting() ||
      action.disabled === true ||
      action.loading === true
    ) {
      return;
    }

    this.actionRequested.emit({
      action
    });
  }

  requestClose(): void {
    if (
      this.loading() ||
      this.submitting()
    ) {
      return;
    }

    this.closeRequested.emit({
      dirty: this.dirty()
    });
  }

  requestCancel(): void {
    if (
      this.loading() ||
      this.submitting()
    ) {
      return;
    }

    this.cancelRequested.emit();
  }

  requestSubmit(): void {
    if (
      this.loading() ||
      this.submitting() ||
      !this.valid()
    ) {
      return;
    }

    this.submitRequested.emit({
      mode: this.mode()
    });
  }

  isActiveStep(
    step: InlineFormWorkspaceStep
  ): boolean {
    return (
      this.resolvedStepId() ===
      step.id
    );
  }

  isPreviousStepAvailable(): boolean {
    return (
      this.findAvailableStep(-1) !==
      null
    );
  }

  isNextStepAvailable(): boolean {
    return (
      this.findAvailableStep(1) !==
      null
    );
  }

  stepClasses(
    step: InlineFormWorkspaceStep,
    index: number
  ): Record<string, boolean> {
    return {
      'to-inline-form-workspace__step--active':
        this.isActiveStep(step),

      'to-inline-form-workspace__step--completed':
        step.completed === true,

      'to-inline-form-workspace__step--error':
        step.error === true,

      'to-inline-form-workspace__step--disabled':
        step.disabled === true,

      'to-inline-form-workspace__step--passed':
        index <
        this.activeStepIndex()
    };
  }

  modeLabel(): string {
    switch (this.mode()) {
      case 'create':
        return 'Create';

      case 'edit':
        return 'Edit';

      case 'review':
        return 'Review';

      case 'view':
      default:
        return 'View';
    }
  }

  stepPositionLabel(
    index: number
  ): string {
    return `Step ${index + 1} of ${
      this.visibleSteps().length
    }`;
  }

  private isSelectableStep(
    stepId: string
  ): boolean {
    return this.visibleSteps().some(
      step =>
        step.id === stepId &&
        step.disabled !== true
    );
  }

  private findAvailableStep(
    direction: -1 | 1
  ): InlineFormWorkspaceStep | null {
    const steps =
      this.visibleSteps();

    let index =
      this.activeStepIndex() +
      direction;

    while (
      index >= 0 &&
      index < steps.length
    ) {
      const step =
        steps[index];

      if (step.disabled !== true) {
        return step;
      }

      index += direction;
    }

    return null;
  }
}