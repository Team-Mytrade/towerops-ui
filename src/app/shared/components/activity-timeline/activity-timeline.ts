import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output
} from '@angular/core';

import {
  CommonModule,
  DatePipe
} from '@angular/common';

import {
  ButtonModule
} from 'primeng/button';

import {
  ActivityTimelineAction,
  ActivityTimelineActionEvent,
  ActivityTimelineItem,
  ActivityTimelineItemEvent
} from './activity-timeline.models';

@Component({
  selector: 'to-activity-timeline',
  standalone: true,
  imports: [
    DatePipe,
    ButtonModule,
    CommonModule
  ],
  templateUrl: './activity-timeline.html',
  styleUrl: './activity-timeline.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class ActivityTimelineComponent {
  readonly items =
    input<ActivityTimelineItem[]>([]);

  readonly loading =
    input(false);

  readonly compact =
    input(false);

  readonly showConnector =
    input(true);

  readonly showActor =
    input(true);

  readonly showMetadata =
    input(true);

  readonly clickable =
    input(false);

  readonly emptyTitle =
    input('No activity yet');

  readonly emptyMessage =
    input(
      'Activity and workflow updates will appear here.'
    );

  readonly dateFormat =
    input('MMM d, y, h:mm a');

  readonly dataTestId =
    input('activity-timeline');

  readonly actionRequested =
    output<ActivityTimelineActionEvent>();

  readonly itemSelected =
    output<ActivityTimelineItemEvent>();

  readonly hasItems = computed(
    () => this.items().length > 0
  );

  selectItem(
    item: ActivityTimelineItem
  ): void {
    if (!this.clickable()) {
      return;
    }

    this.itemSelected.emit({
      item
    });
  }

  triggerAction(
    event: Event,
    item: ActivityTimelineItem,
    action: ActivityTimelineAction
  ): void {
    event.stopPropagation();

    if (
      action.visible === false ||
      action.disabled === true ||
      action.loading === true
    ) {
      return;
    }

    this.actionRequested.emit({
      item,
      action
    });
  }

  isActionVisible(
    action: ActivityTimelineAction
  ): boolean {
    return action.visible !== false;
  }

  timelineDate(
    item: ActivityTimelineItem
  ): string | number | Date | null {
    const value = item.timestamp;

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      value instanceof Date
    ) {
      return value;
    }

    return null;
  }

  hasTimelineDate(
    item: ActivityTimelineItem
  ): boolean {
    return this.timelineDate(item) !== null;
  }

  metadataEntries(
    item: ActivityTimelineItem
  ): Array<{
    key: string;
    value: string | number;
  }> {
    if (!item.metadata) {
      return [];
    }

    return Object.entries(item.metadata)
      .filter(([, value]) =>
        value !== null &&
        value !== undefined &&
        value !== ''
      )
      .map(([key, value]) => ({
        key,
        value: value as string | number
      }));
  }

  displayMetadataKey(
    key: string
  ): string {
    return key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, character =>
        character.toUpperCase()
      );
  }

  itemIcon(
    item: ActivityTimelineItem
  ): string {
    if (item.icon) {
      return item.icon;
    }

    switch (item.status) {
      case 'completed':
        return 'pi pi-check';

      case 'current':
        return 'pi pi-clock';

      case 'failed':
        return 'pi pi-times';

      case 'pending':
        return 'pi pi-hourglass';

      default:
        return 'pi pi-circle-fill';
    }
  }

  actorInitials(
    actorName?: string | null
  ): string {
    if (!actorName?.trim()) {
      return 'SY';
    }

    return actorName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part =>
        part.charAt(0).toUpperCase()
      )
      .join('');
  }

  itemClasses(
    item: ActivityTimelineItem
  ): Record<string, boolean> {
    return {
      [`to-activity-timeline__item--${
        item.tone ?? 'secondary'
      }`]: true,

      [`to-activity-timeline__item--${
        item.status ?? 'completed'
      }`]: true,

      'to-activity-timeline__item--clickable':
        this.clickable()
    };
  }
}