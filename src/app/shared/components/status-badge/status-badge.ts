import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input
} from '@angular/core';

import { TagModule } from 'primeng/tag';

import {
  StatusBadgeConfig,
  StatusBadgeMap,
  StatusBadgeSize,
  StatusBadgeTone
} from './status-badge.models';
import { CommonModule } from '@angular/common';

type PrimeTagSeverity =
  | 'secondary'
  | 'success'
  | 'info'
  | 'warn'
  | 'danger'
  | 'contrast'
  | undefined;

@Component({
  selector: 'to-status-badge',
  standalone: true,
  imports: [
    TagModule,
    CommonModule
  ],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class StatusBadgeComponent {
  readonly value =
    input<string | boolean | null | undefined>();

  readonly label =
    input<string | null>(null);

  readonly icon =
    input<string | null>(null);

  readonly tone =
    input<StatusBadgeTone | null>(null);

  readonly size =
    input<StatusBadgeSize>('small');

  readonly rounded =
    input(true);

  readonly pulse =
    input(false);

  readonly uppercase =
    input(false);

  readonly customMap =
    input<StatusBadgeMap>({});

  readonly fallbackLabel =
    input('Unknown');

  readonly fallbackTone =
    input<StatusBadgeTone>('secondary');

  readonly dataTestId =
    input('status-badge');

  readonly normalizedValue =
    computed(() =>
      this.normalizeValue(
        this.value()
      )
    );

  readonly resolvedConfig =
    computed<StatusBadgeConfig>(() => {
      const explicitLabel =
        this.label();

      const explicitTone =
        this.tone();

      const explicitIcon =
        this.icon();

      const mapped =
        this.resolveMappedConfig(
          this.normalizedValue()
        );

      return {
        label:
          explicitLabel ??
          mapped?.label ??
          this.displayLabel(
            this.value()
          ),

        tone:
          explicitTone ??
          mapped?.tone ??
          this.fallbackTone(),

        icon:
          explicitIcon ??
          mapped?.icon,

        pulse:
          this.pulse() ||
          mapped?.pulse === true
      };
    });

  readonly displayedLabel =
    computed(() => {
      const label =
        this.resolvedConfig().label;

      return this.uppercase()
        ? label.toUpperCase()
        : label;
    });

  readonly primeSeverity =
    computed<PrimeTagSeverity>(() =>
      this.toPrimeSeverity(
        this.resolvedConfig().tone
      )
    );

  readonly badgeClasses =
    computed<Record<string, boolean>>(
      () => ({
        [`to-status-badge--${
          this.resolvedConfig().tone
        }`]: true,

        [`to-status-badge--${
          this.size()
        }`]: true,

        'to-status-badge--pulse':
          this.resolvedConfig().pulse ===
          true
      })
    );

  private resolveMappedConfig(
    status: string
  ): StatusBadgeConfig | null {
    const custom =
      this.customMap()[status];

    if (custom) {
      return custom;
    }

    return (
      DEFAULT_STATUS_BADGE_MAP[
        status
      ] ?? null
    );
  }

  private normalizeValue(
    value:
      | string
      | boolean
      | null
      | undefined
  ): string {
    if (typeof value === 'boolean') {
      return value
        ? 'ENABLED'
        : 'DISABLED';
    }

    if (!value?.trim()) {
      return 'UNKNOWN';
    }

    return value
      .trim()
      .replace(/[\s-]+/g, '_')
      .toUpperCase();
  }

  private displayLabel(
    value:
      | string
      | boolean
      | null
      | undefined
  ): string {
    if (typeof value === 'boolean') {
      return value
        ? 'Enabled'
        : 'Disabled';
    }

    if (!value?.trim()) {
      return this.fallbackLabel();
    }

    return value
      .trim()
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, character =>
        character.toUpperCase()
      );
  }

  private toPrimeSeverity(
    tone: StatusBadgeTone
  ): PrimeTagSeverity {
    switch (tone) {
      case 'primary':
        return undefined;

      case 'warning':
        return 'warn';

      case 'success':
        return 'success';

      case 'info':
        return 'info';

      case 'danger':
        return 'danger';

      case 'contrast':
        return 'contrast';

      case 'secondary':
      default:
        return 'secondary';
    }
  }
}

const DEFAULT_STATUS_BADGE_MAP: StatusBadgeMap = {
  // Generic
  ACTIVE: {
    label: 'Active',
    tone: 'success',
    icon: 'pi pi-check-circle'
  },

  INACTIVE: {
    label: 'Inactive',
    tone: 'secondary',
    icon: 'pi pi-minus-circle'
  },

  ENABLED: {
    label: 'Enabled',
    tone: 'success',
    icon: 'pi pi-check'
  },

  DISABLED: {
    label: 'Disabled',
    tone: 'secondary',
    icon: 'pi pi-ban'
  },

  ONLINE: {
    label: 'Online',
    tone: 'success',
    icon: 'pi pi-wifi',
    pulse: true
  },

  OFFLINE: {
    label: 'Offline',
    tone: 'danger',
    icon: 'pi pi-wifi'
  },

  CONNECTED: {
    label: 'Connected',
    tone: 'success',
    icon: 'pi pi-link'
  },

  DISCONNECTED: {
    label: 'Disconnected',
    tone: 'danger',
    icon: 'pi pi-link'
  },

  UNKNOWN: {
    label: 'Unknown',
    tone: 'secondary',
    icon: 'pi pi-question-circle'
  },

  // Site health
  HEALTHY: {
    label: 'Healthy',
    tone: 'success',
    icon: 'pi pi-check-circle'
  },

  WARNING: {
    label: 'Warning',
    tone: 'warning',
    icon: 'pi pi-exclamation-triangle'
  },

  CRITICAL: {
    label: 'Critical',
    tone: 'danger',
    icon: 'pi pi-times-circle',
    pulse: true
  },

  DEGRADED: {
    label: 'Degraded',
    tone: 'warning',
    icon: 'pi pi-chart-line'
  },

  MAINTENANCE: {
    label: 'Maintenance',
    tone: 'info',
    icon: 'pi pi-wrench'
  },

  // Severity
  LOW: {
    label: 'Low',
    tone: 'secondary',
    icon: 'pi pi-arrow-down'
  },

  MEDIUM: {
    label: 'Medium',
    tone: 'info',
    icon: 'pi pi-minus'
  },

  HIGH: {
    label: 'High',
    tone: 'warning',
    icon: 'pi pi-arrow-up'
  },

  // Alert status
  OPEN: {
    label: 'Open',
    tone: 'danger',
    icon: 'pi pi-exclamation-circle'
  },

  ACKNOWLEDGED: {
    label: 'Acknowledged',
    tone: 'info',
    icon: 'pi pi-eye'
  },

  SUPPRESSED: {
    label: 'Suppressed',
    tone: 'secondary',
    icon: 'pi pi-bell-slash'
  },

  RESOLVED: {
    label: 'Resolved',
    tone: 'success',
    icon: 'pi pi-check-circle'
  },

  // Ticket and work order
  CREATED: {
    label: 'Created',
    tone: 'secondary',
    icon: 'pi pi-plus-circle'
  },

  ASSIGNED: {
    label: 'Assigned',
    tone: 'info',
    icon: 'pi pi-user'
  },

  SCHEDULED: {
    label: 'Scheduled',
    tone: 'info',
    icon: 'pi pi-calendar'
  },

  IN_PROGRESS: {
    label: 'In Progress',
    tone: 'primary',
    icon: 'pi pi-spin pi-spinner',
    pulse: true
  },

  COMPLETED: {
    label: 'Completed',
    tone: 'success',
    icon: 'pi pi-check'
  },

  VERIFIED: {
    label: 'Verified',
    tone: 'success',
    icon: 'pi pi-verified'
  },

  CLOSED: {
    label: 'Closed',
    tone: 'contrast',
    icon: 'pi pi-lock'
  },

  CANCELLED: {
    label: 'Cancelled',
    tone: 'danger',
    icon: 'pi pi-times'
  },

  REJECTED: {
    label: 'Rejected',
    tone: 'danger',
    icon: 'pi pi-times-circle'
  },

  REOPENED: {
    label: 'Reopened',
    tone: 'warning',
    icon: 'pi pi-replay'
  },

  PENDING: {
    label: 'Pending',
    tone: 'warning',
    icon: 'pi pi-clock'
  },

  // Technician
  AVAILABLE: {
    label: 'Available',
    tone: 'success',
    icon: 'pi pi-check-circle'
  },

  BUSY: {
    label: 'Busy',
    tone: 'warning',
    icon: 'pi pi-clock'
  },

  ON_JOB: {
    label: 'On Job',
    tone: 'primary',
    icon: 'pi pi-wrench',
    pulse: true
  },

  ON_LEAVE: {
    label: 'On Leave',
    tone: 'secondary',
    icon: 'pi pi-calendar-times'
  },

  UNAVAILABLE: {
    label: 'Unavailable',
    tone: 'danger',
    icon: 'pi pi-ban'
  },

  // Verification
  APPROVED: {
    label: 'Approved',
    tone: 'success',
    icon: 'pi pi-check'
  },

  UNDER_REVIEW: {
    label: 'Under Review',
    tone: 'info',
    icon: 'pi pi-search'
  },

  DRAFT: {
    label: 'Draft',
    tone: 'secondary',
    icon: 'pi pi-file-edit'
  }
};