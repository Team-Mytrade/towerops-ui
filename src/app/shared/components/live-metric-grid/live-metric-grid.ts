import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output
} from '@angular/core';

import {
  CommonModule,
  DatePipe,
  NgClass
} from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';

import {
  LiveMetricAction,
  LiveMetricActionEvent,
  LiveMetricItem,
  LiveMetricSelectEvent,
  LiveMetricState,
  LiveMetricTone,
  LiveMetricTrend
} from './live-metric-grid.models';

@Component({
  selector: 'to-live-metric-grid',
  standalone: true,
  imports: [
    DatePipe,
    NgClass,
    CommonModule,
    ButtonModule,
    ProgressBarModule,
    TooltipModule
  ],
  templateUrl: './live-metric-grid.html',
  styleUrl: './live-metric-grid.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class LiveMetricGridComponent {
  readonly metrics =
    input<LiveMetricItem[]>([]);

  readonly loading =
    input(false);

  readonly columns =
    input<2 | 3 | 4 | 5 | 6>(4);

  readonly compact =
    input(false);

  readonly clickable =
    input(false);

  readonly showUpdatedAt =
    input(true);

  readonly showDescription =
    input(true);

  readonly showTrend =
    input(true);

  readonly dateFormat =
    input('MMM d, y, h:mm a');

  readonly emptyTitle =
    input('No telemetry available');

  readonly emptyMessage =
    input(
      'Live sensor and operational readings will appear here.'
    );

  readonly dataTestId =
    input('live-metric-grid');

  readonly metricSelected =
    output<LiveMetricSelectEvent>();

  readonly actionRequested =
    output<LiveMetricActionEvent>();

  readonly visibleMetrics =
    computed(() =>
      this.metrics().filter(
        metric => metric.visible !== false
      )
    );

  readonly gridClasses =
    computed<Record<string, boolean>>(
      () => ({
        [`to-live-metric-grid--columns-${this.columns()}`]:
          true,

        'to-live-metric-grid--compact':
          this.compact(),

        'to-live-metric-grid--clickable':
          this.clickable()
      })
    );

  selectMetric(
    metric: LiveMetricItem
  ): void {
    if (!this.clickable()) {
      return;
    }

    this.metricSelected.emit({
      metric
    });
  }

  triggerAction(
    event: Event,
    metric: LiveMetricItem,
    action: LiveMetricAction
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
      metric,
      action
    });
  }

  visibleActions(
    metric: LiveMetricItem
  ): LiveMetricAction[] {
    return (
      metric.actions?.filter(
        action => action.visible !== false
      ) ?? []
    );
  }

  metricState(
    metric: LiveMetricItem
  ): LiveMetricState {
    if (metric.online === false) {
      return 'offline';
    }

    if (metric.state) {
      return metric.state;
    }

    const numberValue =
      this.numericValue(metric);

    if (numberValue === null) {
      return 'unknown';
    }

    const thresholds =
      metric.thresholds;

    if (!thresholds) {
      return 'normal';
    }

    if (
      this.isOutsideRange(
        numberValue,
        thresholds.criticalMin,
        thresholds.criticalMax
      )
    ) {
      return 'critical';
    }

    if (
      this.isOutsideRange(
        numberValue,
        thresholds.warningMin,
        thresholds.warningMax
      )
    ) {
      return 'warning';
    }

    return 'normal';
  }

  metricTone(
    metric: LiveMetricItem
  ): LiveMetricTone {
    if (metric.tone) {
      return metric.tone;
    }

    switch (this.metricState(metric)) {
      case 'normal':
        return 'success';

      case 'warning':
        return 'warning';

      case 'critical':
        return 'danger';

      case 'offline':
      case 'unknown':
      default:
        return 'secondary';
    }
  }

  metricClasses(
    metric: LiveMetricItem
  ): Record<string, boolean> {
    return {
      [`to-live-metric-grid__card--${this.metricTone(metric)}`]:
        true,

      [`to-live-metric-grid__card--${this.metricState(metric)}`]:
        true,

      'to-live-metric-grid__card--interactive':
        this.clickable()
    };
  }

  numericValue(
    metric: LiveMetricItem
  ): number | null {
    if (
      typeof metric.value === 'number' &&
      Number.isFinite(metric.value)
    ) {
      return metric.value;
    }

    if (
      typeof metric.value === 'string' &&
      metric.value.trim() !== ''
    ) {
      const parsed =
        Number(metric.value);

      return Number.isFinite(parsed)
        ? parsed
        : null;
    }

    return null;
  }

  hasNumericValue(
    metric: LiveMetricItem
  ): boolean {
    return (
      this.numericValue(metric) !== null
    );
  }

  formattedValue(
    metric: LiveMetricItem
  ): string {
    if (metric.online === false) {
      return 'Offline';
    }

    const value =
      metric.value;

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return '—';
    }

    if (
      metric.displayType === 'boolean' ||
      typeof value === 'boolean'
    ) {
      return value === true
        ? metric.trueLabel ?? 'On'
        : metric.falseLabel ?? 'Off';
    }

    const numberValue =
      this.numericValue(metric);

    if (numberValue !== null) {
      const decimalPlaces =
        metric.decimalPlaces ?? 0;

      return numberValue.toLocaleString(
        undefined,
        {
          minimumFractionDigits:
            decimalPlaces,
          maximumFractionDigits:
            decimalPlaces
        }
      );
    }

    return String(value);
  }

  progressValue(
    metric: LiveMetricItem
  ): number {
    const value =
      this.numericValue(metric);

    if (value === null) {
      return 0;
    }

    const minimum =
      metric.minimum ?? 0;

    const maximum =
      metric.maximum ?? 100;

    if (maximum <= minimum) {
      return 0;
    }

    const percentage =
      ((value - minimum) /
        (maximum - minimum)) *
      100;

    return Math.min(
      100,
      Math.max(0, percentage)
    );
  }

  trendIcon(
    trend?: LiveMetricTrend
  ): string {
    switch (trend) {
      case 'up':
        return 'pi pi-arrow-up-right';

      case 'down':
        return 'pi pi-arrow-down-right';

      case 'stable':
        return 'pi pi-minus';

      case 'unknown':
      default:
        return 'pi pi-question';
    }
  }

  trendLabel(
    metric: LiveMetricItem
  ): string {
    if (metric.trendLabel) {
      return metric.trendLabel;
    }

    if (
      metric.trendValue !== null &&
      metric.trendValue !== undefined &&
      metric.trendValue !== ''
    ) {
      return String(metric.trendValue);
    }

    switch (metric.trend) {
      case 'up':
        return 'Increasing';

      case 'down':
        return 'Decreasing';

      case 'stable':
        return 'Stable';

      default:
        return 'No trend';
    }
  }

  hasUpdatedAt(
    metric: LiveMetricItem
  ): boolean {
    return (
      metric.updatedAt !== null &&
      metric.updatedAt !== undefined &&
      metric.updatedAt !== ''
    );
  }

  updatedAtValue(
    metric: LiveMetricItem
  ): string | number | Date | null {
    const value =
      metric.updatedAt;

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      value instanceof Date
    ) {
      return value;
    }

    return null;
  }

  private isOutsideRange(
    value: number,
    minimum?: number,
    maximum?: number
  ): boolean {
    if (
      minimum !== undefined &&
      value < minimum
    ) {
      return true;
    }

    if (
      maximum !== undefined &&
      value > maximum
    ) {
      return true;
    }

    return false;
  }
}
