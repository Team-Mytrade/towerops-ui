import {
  ChangeDetectionStrategy,
  Component,
  input
} from '@angular/core';

import {
  CurrencyPipe,
  DatePipe,
  DecimalPipe
} from '@angular/common';

import { TagModule } from 'primeng/tag';

import {
  PropertyField
} from './property-grid.models';

@Component({
  selector: 'to-property-grid',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    CurrencyPipe,
    TagModule
  ],
  templateUrl: './property-grid.html',
  styleUrl: './property-grid.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class PropertyGridComponent {
  readonly items =
    input<PropertyField[]>([]);

  readonly columns =
    input(2);

  readonly compact =
    input(false);

  displayValue(
    item: PropertyField
  ): string {
    if (this.isEmpty(item.value)) {
      return item.emptyValue ?? '—';
    }

    if (item.formatter) {
      return item.formatter(item.value);
    }

    return String(item.value);
  }

  dateValue(
    item: PropertyField
  ): string | number | Date | null {
    const value = item.value;

    if (this.isEmpty(value)) {
      return null;
    }

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      value instanceof Date
    ) {
      return value;
    }

    return null;
  }

  hasDateValue(
    item: PropertyField
  ): boolean {
    return this.dateValue(item) !== null;
  }

  numberValue(
    item: PropertyField
  ): string | number | null {
    const value = item.value;

    if (this.isEmpty(value)) {
      return null;
    }

    if (
      typeof value === 'string' ||
      typeof value === 'number'
    ) {
      return value;
    }

    return null;
  }

  hasNumberValue(
    item: PropertyField
  ): boolean {
    return this.numberValue(item) !== null;
  }

  booleanValue(
    item: PropertyField
  ): boolean {
    const value = item.value;

    if (typeof value === 'string') {
      return [
        'true',
        '1',
        'yes',
        'active',
        'enabled'
      ].includes(
        value.trim().toLowerCase()
      );
    }

    return Boolean(value);
  }

  linkValue(
    item: PropertyField
  ): string | null {
    if (item.href) {
      return item.href;
    }

    if (
      typeof item.value === 'string' &&
      item.value.trim()
    ) {
      return item.value;
    }

    return null;
  }

  emailHref(
    item: PropertyField
  ): string | null {
    const value = this.linkValue(item);

    return value
      ? `mailto:${value}`
      : null;
  }

  phoneHref(
    item: PropertyField
  ): string | null {
    const value = this.linkValue(item);

    return value
      ? `tel:${value}`
      : null;
  }

  gridStyle(): Record<string, string> {
    const columns = Math.max(
      1,
      this.columns()
    );

    return {
      'grid-template-columns':
        `repeat(${columns}, minmax(0, 1fr))`
    };
  }

  private isEmpty(
    value: unknown
  ): boolean {
    return (
      value === null ||
      value === undefined ||
      value === ''
    );
  }
}