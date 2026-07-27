import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input
} from '@angular/core';
import { DatePipe } from '@angular/common';

import {
  TicketTimelineItem
} from '../../models/ticket.models';

type TimelineTone =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'secondary';

@Component({
  selector: 'to-ticket-timeline',
  standalone: true,
  imports: [
    DatePipe
  ],
  templateUrl: './ticket-timeline.html',
  styleUrl: './ticket-timeline.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketTimelineComponent {
  readonly timeline =
    input<TicketTimelineItem[]>([]);

  readonly loading = input(false);

  readonly sortedTimeline = computed(() =>
    [...this.timeline()].sort(
      (first, second) =>
        new Date(second.performedAt).getTime() -
        new Date(first.performedAt).getTime()
    )
  );

  icon(item: TicketTimelineItem): string {
    if (item.icon) {
      return item.icon;
    }

    switch (this.normalizeAction(item.action)) {
      case 'CREATED':
      case 'TICKET_CREATED':
        return 'pi pi-plus';

      case 'ALERT_LINKED':
        return 'pi pi-bell';

      case 'ASSIGNED':
      case 'TECHNICIAN_ASSIGNED':
        return 'pi pi-user';

      case 'ACKNOWLEDGED':
      case 'ACCEPTED':
        return 'pi pi-check-circle';

      case 'IN_PROGRESS':
      case 'WORK_STARTED':
        return 'pi pi-play';

      case 'WORK_ORDER_CREATED':
        return 'pi pi-briefcase';

      case 'COMMENT_ADDED':
        return 'pi pi-comment';

      case 'ATTACHMENT_ADDED':
      case 'PHOTO_UPLOADED':
        return 'pi pi-paperclip';

      case 'PRIORITY_CHANGED':
        return 'pi pi-flag';

      case 'STATUS_CHANGED':
        return 'pi pi-sync';

      case 'RESOLVED':
      case 'COMPLETED':
        return 'pi pi-check';

      case 'VERIFIED':
      case 'CONFIRMED':
        return 'pi pi-shield';

      case 'CLOSED':
        return 'pi pi-lock';

      case 'REJECTED':
      case 'CANCELLED':
        return 'pi pi-times';

      case 'REOPENED':
        return 'pi pi-replay';

      default:
        return 'pi pi-circle';
    }
  }

  tone(item: TicketTimelineItem): TimelineTone {
    const action = this.normalizeAction(item.action);

    switch (action) {
      case 'RESOLVED':
      case 'COMPLETED':
      case 'VERIFIED':
      case 'CONFIRMED':
      case 'CLOSED':
        return 'success';

      case 'IN_PROGRESS':
      case 'WORK_STARTED':
      case 'PRIORITY_CHANGED':
        return 'warning';

      case 'REJECTED':
      case 'CANCELLED':
        return 'danger';

      case 'ASSIGNED':
      case 'TECHNICIAN_ASSIGNED':
      case 'ACKNOWLEDGED':
      case 'ACCEPTED':
        return 'info';

      case 'REOPENED':
        return 'secondary';

      default:
        return 'primary';
    }
  }

  actionLabel(action: string): string {
    return action
      .replace(/[_-]+/g, ' ')
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, character =>
        character.toUpperCase()
      );
  }

  metadataEntries(
    metadata?: Record<string, unknown> | null
  ): Array<{
    key: string;
    label: string;
    value: string;
  }> {
    if (!metadata) {
      return [];
    }

    return Object.entries(metadata)
      .filter(([, value]) =>
        value !== null &&
        value !== undefined &&
        value !== ''
      )
      .map(([key, value]) => ({
        key,
        label: this.actionLabel(key),
        value: this.formatMetadataValue(value)
      }));
  }

  initials(name?: string | null): string {
    if (!name?.trim()) {
      return 'S';
    }

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part =>
        part.charAt(0).toUpperCase()
      )
      .join('');
  }

  private normalizeAction(action: string): string {
    return action
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, '_');
  }

  private formatMetadataValue(
    value: unknown
  ): string {
    if (Array.isArray(value)) {
      return value
        .map(item => String(item))
        .join(', ');
    }

    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return 'Additional information';
      }
    }

    return String(value);
  }
}
