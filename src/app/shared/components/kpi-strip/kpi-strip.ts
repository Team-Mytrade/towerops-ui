import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';

import {
  DecimalPipe
} from '@angular/common';

import {
  KpiItem,
  KpiTone
} from './kpi-strip.models';

@Component({
  selector: 'to-kpi-strip',
  standalone: true,
  imports: [
    DecimalPipe
  ],
  templateUrl: './kpi-strip.html',
  styleUrl: './kpi-strip.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class KpiStripComponent {
  readonly items =
    input<KpiItem[]>([]);

  readonly columns =
    input<number | null>(null);

  readonly compact =
    input(false);

  readonly dataTestId =
    input('kpi-strip');

  readonly itemSelected =
    output<KpiItem>();

  selectItem(item: KpiItem): void {
    if (
      item.clickable !== true ||
      item.disabled === true ||
      item.loading === true
    ) {
      return;
    }

    this.itemSelected.emit(item);
  }

  itemTone(
    item: KpiItem
  ): KpiTone {
    return item.tone ?? 'primary';
  }

  displayValue(
    item: KpiItem
  ): string {
    if (
      item.value === null ||
      item.value === undefined ||
      item.value === ''
    ) {
      return '—';
    }

    return String(item.value);
  }

  trendDirection(
    trend?: number | null
  ): 'up' | 'down' | 'neutral' {
    if (
      trend === null ||
      trend === undefined ||
      trend === 0
    ) {
      return 'neutral';
    }

    return trend > 0
      ? 'up'
      : 'down';
  }

  trendIcon(
    trend?: number | null
  ): string {
    switch (
      this.trendDirection(trend)
    ) {
      case 'up':
        return 'pi pi-arrow-up';

      case 'down':
        return 'pi pi-arrow-down';

      default:
        return 'pi pi-minus';
    }
  }

  gridStyle(): Record<string, string> {
    const columns = this.columns();

    if (!columns || columns <= 0) {
      return {};
    }

    return {
      'grid-template-columns':
        `repeat(${columns}, minmax(0, 1fr))`
    };
  }
}