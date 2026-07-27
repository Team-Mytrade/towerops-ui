import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input
} from '@angular/core';

import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';

import {
  WorkOrderSiteContext
} from '../../../models/work-order-form.models';

@Component({
  selector: 'to-work-order-site-context-card',
  standalone: true,
  imports: [
    SkeletonModule,
    TagModule
  ],
  templateUrl: './site-context-card.html',
  styleUrl: './site-context-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkOrderSiteContextCardComponent {
  readonly context =
    input<WorkOrderSiteContext | null>(null);

  readonly loading =
    input(false);

  readonly siteSelected =
    input(false);

  readonly healthLabel = computed(() =>
    this.context()?.healthStatus ?? 'UNKNOWN'
  );

  readonly healthSeverity = computed<
    'success' |
    'warn' |
    'danger' |
    'secondary' |
    'info'
  >(() => {
    switch (
      this.context()?.healthStatus
        ?.toUpperCase()
    ) {
      case 'HEALTHY':
      case 'ONLINE':
        return 'success';

      case 'WARNING':
      case 'DEGRADED':
        return 'warn';

      case 'CRITICAL':
        return 'danger';

      case 'OFFLINE':
      case 'UNKNOWN':
        return 'secondary';

      default:
        return 'info';
    }
  });

  readonly deviceHealthPercentage =
    computed(() => {
      const context = this.context();

      if (!context?.devices.total) {
        return 0;
      }

      return Math.round(
        (
          context.devices.online /
          context.devices.total
        ) * 100
      );
    });

  readonly openOperationsCount =
    computed(() => {
      const context = this.context();

      if (!context) {
        return 0;
      }

      return (
        context.alerts.open +
        context.tickets.open +
        context.workOrders.open
      );
    });
}