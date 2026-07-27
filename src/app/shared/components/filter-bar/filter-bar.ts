import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

import {
  FilterApplyEvent,
  FilterChangeEvent,
  FilterField,
  FilterState,
  FilterValue
} from './filter-bar.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'to-filter-bar',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    DatePickerModule,
    InputIconModule,
    InputTextModule,
    IconFieldModule,
    MultiSelectModule,
    SelectModule,
    CommonModule,
    ToggleSwitchModule
  ],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class FilterBarComponent {
  readonly fields =
    input<FilterField[]>([]);

  readonly initialFilters =
    input<FilterState>({});

  readonly loading =
    input(false);

  readonly autoApply =
    input(true);

  readonly showApply =
    input(false);

  readonly showClear =
    input(true);

  readonly collapsible =
    input(true);

  readonly applyLabel =
    input('Apply Filters');

  readonly clearLabel =
    input('Clear');

  readonly dataTestId =
    input('filter-bar');

  readonly filterChanged =
    output<FilterChangeEvent>();

  readonly filtersApplied =
    output<FilterApplyEvent>();

  readonly filtersCleared =
    output<void>();

  readonly filters =
    signal<FilterState>({});

  readonly advancedOpen =
    signal(false);

  readonly visiblePrimaryFields =
    computed(() =>
      this.fields().filter(
        field =>
          field.visible !== false &&
          field.advanced !== true
      )
    );

  readonly visibleAdvancedFields =
    computed(() =>
      this.fields().filter(
        field =>
          field.visible !== false &&
          field.advanced === true
      )
    );

  readonly hasAdvancedFields =
    computed(
      () =>
        this.visibleAdvancedFields()
          .length > 0
    );

  readonly activeCount =
    computed(() =>
      Object.values(
        this.filters()
      ).filter(value =>
        this.hasValue(value)
      ).length
    );

  readonly hasActiveFilters =
    computed(
      () => this.activeCount() > 0
    );

  constructor() {
    effect(
      () => {
        const initial =
          this.initialFilters();

        this.filters.set({
          ...initial
        });
      },
      {
        allowSignalWrites: true
      }
    );
  }

  value(
    key: string
  ): FilterValue {
    return this.filters()[key] ?? null;
  }

  stringValue(
    key: string
  ): string {
    const value = this.value(key);

    return typeof value === 'string'
      ? value
      : '';
  }

  selectValue(
    key: string
  ): string | number | null {
    const value = this.value(key);

    return (
      typeof value === 'string' ||
      typeof value === 'number'
    )
      ? value
      : null;
  }

  multiSelectValue(
    key: string
  ): Array<string | number> {
    const value = this.value(key);

    return Array.isArray(value)
      ? value.filter(
          item =>
            typeof item === 'string' ||
            typeof item === 'number'
        )
      : [];
  }

  dateValue(
    key: string
  ): Date | null {
    const value = this.value(key);

    return value instanceof Date
      ? value
      : null;
  }

  dateRangeValue(
    key: string
  ): [Date | null, Date | null] {
    const value = this.value(key);

    if (
      Array.isArray(value) &&
      value.length === 2
    ) {
      return [
        value[0] instanceof Date
          ? value[0]
          : null,
        value[1] instanceof Date
          ? value[1]
          : null
      ];
    }

    return [null, null];
  }

  toggleValue(
    key: string
  ): boolean {
    return this.value(key) === true;
  }

  updateFilter(
    field: FilterField,
    value: FilterValue
  ): void {
    const updated = {
      ...this.filters(),
      [field.key]: value
    };

    this.filters.set(updated);

    this.filterChanged.emit({
      key: field.key,
      value,
      filters: updated
    });

    if (this.autoApply()) {
      this.emitApply();
    }
  }

  clearFilters(): void {
    const cleared: FilterState = {};

    for (const field of this.fields()) {
      cleared[field.key] =
        this.emptyValue(field);
    }

    this.filters.set(cleared);
    this.filtersCleared.emit();

    if (this.autoApply()) {
      this.emitApply();
    }
  }

  applyFilters(): void {
    this.emitApply();
  }

  toggleAdvanced(): void {
    this.advancedOpen.update(
      current => !current
    );
  }

  trackField(
    _index: number,
    field: FilterField
  ): string {
    return field.key;
  }

  private emitApply(): void {
    this.filtersApplied.emit({
      filters: {
        ...this.filters()
      },
      activeCount:
        this.activeCount()
    });
  }

  private emptyValue(
    field: FilterField
  ): FilterValue {
    switch (field.type) {
      case 'multiselect':
        return [];

      case 'daterange':
        return [null, null];

      case 'toggle':
        return false;

      default:
        return null;
    }
  }

  private hasValue(
    value: FilterValue
  ): boolean {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return false;
    }

    if (Array.isArray(value)) {
      return value.some(item =>
        item !== null &&
        item !== undefined &&
        item !== ''
      );
    }

    if (typeof value === 'boolean') {
      return value;
    }

    return true;
  }
}