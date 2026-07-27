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
  StatusBadgeComponent
} from '../status-badge/status-badge';

import {
  EntitySummaryAction,
  EntitySummaryActionEvent,
  EntitySummaryBadge,
  EntitySummaryMetadata,
  EntitySummaryMetadataEvent
} from './entity-summary-header.models';

@Component({
  selector: 'to-entity-summary-header',
  standalone: true,
  imports: [
    NgClass,
    ButtonModule,
    TooltipModule,
    StatusBadgeComponent
  ],
  templateUrl:
    './entity-summary-header.html',
  styleUrl:
    './entity-summary-header.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class EntitySummaryHeaderComponent {
  readonly title =
    input.required<string>();

  readonly subtitle =
    input<string | null>(null);

  readonly code =
    input<string | null>(null);

  readonly eyebrow =
    input<string | null>(null);

  readonly icon =
    input('pi pi-box');

  readonly imageUrl =
    input<string | null>(null);

  readonly imageAlt =
    input<string | null>(null);

  readonly badges =
    input<EntitySummaryBadge[]>([]);

  readonly metadata =
    input<EntitySummaryMetadata[]>([]);

  readonly actions =
    input<EntitySummaryAction[]>([]);

  readonly loading =
    input(false);

  readonly refreshing =
    input(false);

  readonly showBack =
    input(true);

  readonly showRefresh =
    input(false);

  readonly compact =
    input(false);

  readonly elevated =
    input(true);

  readonly dataTestId =
    input('entity-summary-header');

  readonly backRequested =
    output<void>();

  readonly refreshRequested =
    output<void>();

  readonly actionRequested =
    output<EntitySummaryActionEvent>();

  readonly metadataRequested =
    output<EntitySummaryMetadataEvent>();

  readonly visibleBadges =
    computed(() =>
      this.badges().filter(
        badge =>
          badge.visible !== false
      )
    );

  readonly visibleMetadata =
    computed(() =>
      this.metadata().filter(
        item =>
          item.visible !== false &&
          this.hasMetadataValue(
            item.value
          )
      )
    );

  readonly visibleActions =
    computed(() =>
      this.actions().filter(
        action =>
          action.visible !== false
      )
    );

  readonly headerClasses =
    computed<
      Record<string, boolean>
    >(() => ({
      'to-entity-summary-header--compact':
        this.compact(),

      'to-entity-summary-header--elevated':
        this.elevated(),

      'to-entity-summary-header--loading':
        this.loading()
    }));

  requestBack(): void {
    if (this.loading()) {
      return;
    }

    this.backRequested.emit();
  }

  requestRefresh(): void {
    if (
      this.loading() ||
      this.refreshing()
    ) {
      return;
    }

    this.refreshRequested.emit();
  }

  requestAction(
    action: EntitySummaryAction
  ): void {
    if (
      action.disabled === true ||
      action.loading === true ||
      this.loading()
    ) {
      return;
    }

    this.actionRequested.emit({
      action
    });
  }

  requestMetadata(
    metadata: EntitySummaryMetadata
  ): void {
    if (!metadata.copyable) {
      return;
    }

    this.metadataRequested.emit({
      metadata
    });
  }

  displayMetadataValue(
    value:
      | string
      | number
      | boolean
      | null
      | undefined
  ): string {
    if (typeof value === 'boolean') {
      return value
        ? 'Yes'
        : 'No';
    }

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return '—';
    }

    return String(value);
  }

  imageAlternative(): string {
    return (
      this.imageAlt() ??
      this.title()
    );
  }

  trackBadge(
    _index: number,
    badge: EntitySummaryBadge
  ): string {
    return badge.id;
  }

  trackMetadata(
    _index: number,
    metadata: EntitySummaryMetadata
  ): string {
    return metadata.id;
  }

  trackAction(
    _index: number,
    action: EntitySummaryAction
  ): string {
    return action.id;
  }

  private hasMetadataValue(
    value:
      | string
      | number
      | boolean
      | null
      | undefined
  ): boolean {
    return (
      value !== null &&
      value !== undefined &&
      value !== ''
    );
  }
}