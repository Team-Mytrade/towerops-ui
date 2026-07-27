import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output
} from '@angular/core';

import { NgClass } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import {
  DataStateAction,
  DataStateActionEvent,
  DataStateSize,
  DataStateTone,
  DataStateType
} from './data-state-panel.models';

interface ResolvedDataState {
  title: string;
  message: string;
  icon: string;
  tone: DataStateTone;
}

@Component({
  selector: 'to-data-state-panel',
  standalone: true,
  imports: [
    NgClass,
    ButtonModule,
    ProgressSpinnerModule
  ],
  templateUrl: './data-state-panel.html',
  styleUrl: './data-state-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataStatePanelComponent {
  readonly state =
    input<DataStateType>('empty');

  readonly title =
    input<string | null>(null);

  readonly message =
    input<string | null>(null);

  readonly icon =
    input<string | null>(null);

  readonly tone =
    input<DataStateTone | null>(null);

  readonly size =
    input<DataStateSize>('default');

  readonly actions =
    input<DataStateAction[]>([]);

  readonly bordered =
    input(true);

  readonly elevated =
    input(false);

  readonly transparent =
    input(false);

  readonly showSpinner =
    input(true);

  readonly showIcon =
    input(true);

  readonly dataTestId =
    input('data-state-panel');

  readonly actionRequested =
    output<DataStateActionEvent>();

  readonly visibleActions =
    computed(() =>
      this.actions().filter(
        action => action.visible !== false
      )
    );

  readonly resolvedState =
    computed<ResolvedDataState>(() => {
      const preset =
        DATA_STATE_PRESETS[this.state()];

      return {
        title:
          this.title() ??
          preset.title,

        message:
          this.message() ??
          preset.message,

        icon:
          this.icon() ??
          preset.icon,

        tone:
          this.tone() ??
          preset.tone
      };
    });

  readonly panelClasses =
    computed<Record<string, boolean>>(
      () => ({
        [`to-data-state-panel--${this.resolvedState().tone}`]:
          true,

        [`to-data-state-panel--${this.size()}`]:
          true,

        'to-data-state-panel--bordered':
          this.bordered(),

        'to-data-state-panel--elevated':
          this.elevated(),

        'to-data-state-panel--transparent':
          this.transparent(),

        'to-data-state-panel--loading':
          this.state() === 'loading'
      })
    );

  requestAction(
    action: DataStateAction
  ): void {
    if (
      action.disabled === true ||
      action.loading === true
    ) {
      return;
    }

    this.actionRequested.emit({
      action
    });
  }
}

const DATA_STATE_PRESETS: Record<
  DataStateType,
  ResolvedDataState
> = {
  loading: {
    title: 'Loading data',
    message:
      'Please wait while the latest information is being loaded.',
    icon: 'pi pi-spin pi-spinner',
    tone: 'primary'
  },

  empty: {
    title: 'No data available',
    message:
      'There are no records available for the selected criteria.',
    icon: 'pi pi-inbox',
    tone: 'secondary'
  },

  error: {
    title: 'Unable to load data',
    message:
      'Something went wrong while loading this information. Please try again.',
    icon: 'pi pi-exclamation-circle',
    tone: 'danger'
  },

  offline: {
    title: 'Connection unavailable',
    message:
      'The service is currently unreachable. Check the connection and try again.',
    icon: 'pi pi-wifi',
    tone: 'warning'
  },

  forbidden: {
    title: 'Access restricted',
    message:
      'You do not have permission to view or perform this operation.',
    icon: 'pi pi-lock',
    tone: 'warning'
  },

  'not-found': {
    title: 'Record not found',
    message:
      'The requested record may have been removed or is no longer available.',
    icon: 'pi pi-search',
    tone: 'secondary'
  },

  success: {
    title: 'Operation completed',
    message:
      'The requested operation was completed successfully.',
    icon: 'pi pi-check-circle',
    tone: 'success'
  },

  custom: {
    title: 'Information unavailable',
    message:
      'No additional information is available.',
    icon: 'pi pi-info-circle',
    tone: 'info'
  }
};