import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  QueryList,
  TemplateRef,
  computed,
  input,
  output,
  signal
} from '@angular/core';

import {
  DatePipe,
  DecimalPipe,
  NgTemplateOutlet
} from '@angular/common';

import { FormsModule } from '@angular/forms';

import { PrimeTemplate } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

import {
  TableLazyLoadEvent,
  TableModule,
  TablePageEvent
} from 'primeng/table';

import { TagModule } from 'primeng/tag';

import {
  BaseComponent
} from '../../../core/base/base.component';

import {
  DataTableCellContext,
  DataTableColumn,
  DataTableColumnVisibilityEvent,
  DataTableFilterValue,
  DataTableFilters,
  DataTableLazyEvent,
  DataTablePageChangeEvent,
  DataTableSelectionMode,
  DataTableSort,
  DataTableState
} from './data-table.models';

import {
  matchesColumnFilters,
  matchesGlobalSearch,
  paginateRows,
  resolveColumnValue,
  sanitizeFilters,
  sortRows
} from './data-table.utils';

@Component({
  selector: 'to-data-table',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    NgTemplateOutlet,
    FormsModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TagModule
  ],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableComponent<
  TRow extends object
> extends BaseComponent implements AfterContentInit {
  @ContentChildren(PrimeTemplate)
  private readonly projectedTemplates?:
    QueryList<PrimeTemplate>;

  readonly rows = input<TRow[]>([]);

  readonly columns =
    input<DataTableColumn<TRow>[]>([]);

  readonly isloading = input(false);

  readonly error =
    input<string | null>(null);

  readonly lazy = input(false);

  readonly totalRecords = input(0);

  readonly pageSize = input(10);

  readonly pageIndex = input(0);

  readonly rowsPerPageOptions =
    input<number[]>([
      10,
      25,
      50,
      100
    ]);

  readonly paginator = input(true);

  readonly rowKey = input('id');

  readonly selectionMode =
    input<DataTableSelectionMode>(
      'none'
    );

  readonly selectedRows =
    input<TRow[]>([]);

  readonly selectable = input(true);

  readonly rowHover = input(true);

  readonly showGlobalSearch =
    input(true);

  readonly globalSearchPlaceholder =
    input('Search...');

  readonly showColumnFilters =
    input(true);

  readonly showColumnVisibility =
    input(false);

  readonly showResultCount =
    input(true);

  readonly filterDebounce =
    input(400);

  readonly minTableWidth =
    input('60rem');

  readonly emptyIcon =
    input('pi pi-inbox');

  readonly emptyTitle =
    input('No records found');

  readonly emptyMessage =
    input(
      'There are no records to display.'
    );

  readonly errorTitle =
    input(
      'Unable to load records'
    );

  readonly loadingMessage =
    input('Loading records...');

  readonly dataTestId =
    input('data-table');

  readonly initialSort =
    input<DataTableSort | null>(
      null
    );

  readonly lazyLoad =
    output<DataTableLazyEvent>();

  readonly pageChanged =
    output<DataTablePageChangeEvent>();

  readonly sortChanged =
    output<DataTableSort | undefined>();

  readonly filtersChanged =
    output<DataTableFilters>();

  readonly globalSearchChanged =
    output<string>();

  readonly rowSelected =
    output<TRow>();

  readonly rowDoubleClicked =
    output<TRow>();

  readonly selectionChanged =
    output<TRow[]>();

  readonly retry =
    output<void>();

  readonly columnVisibilityChanged =
    output<DataTableColumnVisibilityEvent>();

  readonly globalSearch =
    signal('');

  readonly filters =
    signal<DataTableFilters>({});

  readonly first = signal(0);

  readonly currentPageSize =
    signal(10);

  readonly currentSort =
    signal<DataTableSort | undefined>(
      undefined
    );

  readonly visibilityOpen =
    signal(false);

  readonly hiddenFields =
    signal<Set<string>>(
      new Set<string>()
    );

  private filterTimer:
    ReturnType<typeof setTimeout> |
    undefined;

  private initialized = false;

  readonly visibleColumns = computed(
    () => {
      const hidden =
        this.hiddenFields();

      return this.columns().filter(
        column =>
          column.visible !== false &&
          !hidden.has(column.field)
      );
    }
  );

  readonly clientFilteredRows =
    computed(() => {
      const visibleColumns =
        this.visibleColumns();

      return this.rows().filter(
        row =>
          matchesGlobalSearch(
            row,
            visibleColumns,
            this.globalSearch()
          ) &&
          matchesColumnFilters(
            row,
            visibleColumns,
            this.filters()
          )
      );
    });

  readonly clientSortedRows =
    computed(() =>
      sortRows(
        this.clientFilteredRows(),
        this.visibleColumns(),
        this.currentSort()
      )
    );

  readonly displayedRows =
    computed(() => {
      if (this.lazy()) {
        return this.rows();
      }

      if (!this.paginator()) {
        return this.clientSortedRows();
      }

      return paginateRows(
        this.clientSortedRows(),
        this.first(),
        this.currentPageSize()
      );
    });

  readonly effectiveTotalRecords =
    computed(() =>
      this.lazy()
        ? this.totalRecords()
        : this.clientFilteredRows().length
    );

  readonly resultLabel = computed(() => {
    const total =
      this.effectiveTotalRecords();

    return `${total} ${
      total === 1
        ? 'record'
        : 'records'
    }`;
  });

  readonly hasColumnFilters =
    computed(() =>
      this.showColumnFilters() &&
      this.visibleColumns().some(
        column => column.filterable
      )
    );

  readonly selectionValue =
    computed<TRow | TRow[] | null>(() => {
      switch (
        this.selectionMode()
      ) {
        case 'multiple':
          return this.selectedRows();

        case 'single':
          return (
            this.selectedRows()[0] ??
            null
          );

        default:
          return null;
      }
    });

  constructor() {
    super();

    this.currentPageSize.set(
      this.pageSize()
    );

    this.first.set(
      this.pageIndex() *
        this.pageSize()
    );

    const initialSort =
      this.initialSort();

    if (initialSort) {
      this.currentSort.set(
        initialSort
      );
    }
  }

  ngAfterContentInit(): void {
    queueMicrotask(() => {
      if (
        this.lazy() &&
        !this.initialized
      ) {
        this.initialized = true;
        this.emitLazyEvent();
      }
    });
  }

  value(
    row: TRow,
    column: DataTableColumn<TRow>
  ): unknown {
    return resolveColumnValue(
      row,
      column
    );
  }

  dateValue(
    row: TRow,
    column: DataTableColumn<TRow>
  ): string | number | Date | null {
    const value = this.value(
      row,
      column
    );

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
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
    row: TRow,
    column: DataTableColumn<TRow>
  ): boolean {
    return (
      this.dateValue(
        row,
        column
      ) !== null
    );
  }
primeSelectionMode():
  | 'single'
  | 'multiple'
  | null {
  const mode = this.selectionMode();

  return mode === 'none'
    ? null
    : mode;
}
  numberValue(
    row: TRow,
    column: DataTableColumn<TRow>
  ): number | string | null {
    const value = this.value(
      row,
      column
    );

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return null;
    }

    if (
      typeof value === 'number' ||
      typeof value === 'string'
    ) {
      return value;
    }

    return null;
  }

  hasNumberValue(
    row: TRow,
    column: DataTableColumn<TRow>
  ): boolean {
    return (
      this.numberValue(
        row,
        column
      ) !== null
    );
  }

  displayValue(
    row: TRow,
    column: DataTableColumn<TRow>
  ): string {
    const value = this.value(
      row,
      column
    );

    if (column.formatter) {
      return column.formatter(
        value,
        row,
        column
      );
    }

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return (
        column.emptyValue ??
        '—'
      );
    }

    return String(value);
  }

  booleanValue(
    row: TRow,
    column: DataTableColumn<TRow>
  ): boolean {
    return Boolean(
      this.value(
        row,
        column
      )
    );
  }

  booleanLabel(
    value: unknown,
    column: DataTableColumn<TRow>
  ): string {
    return Boolean(value)
      ? column.trueLabel ?? 'Yes'
      : column.falseLabel ?? 'No';
  }

  tagLabel(
    value: unknown,
    column: DataTableColumn<TRow>
  ): string {
    const key = String(
      value ?? ''
    );

    return (
      column.tag?.labelMap?.[key] ??
      key
        .replace(
          /[_-]+/g,
          ' '
        )
        .trim()
    );
  }

  tagSeverity(
    value: unknown,
    column: DataTableColumn<TRow>
  ):
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'contrast' {
    const key = String(
      value ?? ''
    );

    return (
      column.tag
        ?.severityMap?.[key] ??
      column.tag
        ?.defaultSeverity ??
      'secondary'
    );
  }

  cellTemplate(
    column: DataTableColumn<TRow>
  ): TemplateRef<
    DataTableCellContext<TRow>
  > | null {
    if (column.template) {
      return column.template;
    }

    const templateName =
      `cell-${column.field}`;

    const matchingTemplate =
      this.projectedTemplates?.find(
        template =>
          template.getType() ===
          templateName
      );

    return (
      matchingTemplate
        ?.template as TemplateRef<
          DataTableCellContext<TRow>
        > | undefined
    ) ?? null;
  }

  columnStyle(
    column: DataTableColumn<TRow>
  ): Record<string, string> {
    return {
      width:
        column.width ?? 'auto',

      minWidth:
        column.minWidth ??
        column.width ??
        'auto',

      maxWidth:
        column.maxWidth ??
        'none',

      textAlign:
        column.align ?? 'left'
    };
  }

  sortField(
    column: DataTableColumn<TRow>
  ): string {
    return (
      column.sortField ??
      column.field
    );
  }

  filterField(
    column: DataTableColumn<TRow>
  ): string {
    return (
      column.filterField ??
      column.field
    );
  }

  filterValue(
    column: DataTableColumn<TRow>
  ): DataTableFilterValue {
    return (
      this.filters()[
        this.filterField(column)
      ] ?? null
    );
  }

  onGlobalSearch(
    value: string
  ): void {
    this.globalSearch.set(
      value ?? ''
    );

    this.first.set(0);

    this.globalSearchChanged.emit(
      value ?? ''
    );

    this.scheduleFilterEmission();
  }

  onFilterChange(
    column: DataTableColumn<TRow>,
    value: DataTableFilterValue
  ): void {
    const field =
      this.filterField(column);

    this.filters.update(
      current => ({
        ...current,
        [field]: value
      })
    );

    this.first.set(0);

    this.scheduleFilterEmission();
  }

  clearGlobalSearch(): void {
    this.onGlobalSearch('');
  }

  clearFilters(): void {
    if (this.filterTimer) {
      clearTimeout(
        this.filterTimer
      );

      this.filterTimer =
        undefined;
    }

    this.globalSearch.set('');
    this.filters.set({});
    this.first.set(0);

    this.globalSearchChanged.emit('');
    this.filtersChanged.emit({});

    if (this.lazy()) {
      this.emitLazyEvent();
    }
  }

  onPage(
    event: TablePageEvent
  ): void {
    const first =
      event.first ?? 0;

    const size =
      event.rows ??
      this.currentPageSize();

    this.first.set(first);
    this.currentPageSize.set(size);

    const page =
      size > 0
        ? Math.floor(
            first / size
          )
        : 0;

    this.pageChanged.emit({
      page,
      size,
      first
    });

    if (this.lazy()) {
      this.emitLazyEvent();
    }
  }

  onPrimeLazyLoad(
    event: TableLazyLoadEvent
  ): void {
    const first =
      event.first ?? 0;

    const size =
      event.rows ??
      this.currentPageSize();

    this.first.set(first);
    this.currentPageSize.set(size);

    const sortField =
      Array.isArray(
        event.sortField
      )
        ? event.sortField[0]
        : event.sortField;

    if (
      typeof sortField ===
        'string' &&
      sortField
    ) {
      const sort: DataTableSort = {
        field: sortField,
        direction:
          event.sortOrder === -1
            ? 'desc'
            : 'asc'
      };

      this.currentSort.set(sort);
      this.sortChanged.emit(sort);
    } else if (
      event.sortField === null ||
      event.sortField === undefined
    ) {
      this.currentSort.set(
        undefined
      );

      this.sortChanged.emit(
        undefined
      );
    }

    if (this.initialized) {
      this.emitLazyEvent();
    }

    this.initialized = true;
  }

  onClientSort(
    field: string
  ): void {
    if (this.lazy()) {
      return;
    }

    const current =
      this.currentSort();

    let nextSort:
      | DataTableSort
      | undefined;

    if (
      !current ||
      current.field !== field
    ) {
      nextSort = {
        field,
        direction: 'asc'
      };
    } else if (
      current.direction === 'asc'
    ) {
      nextSort = {
        field,
        direction: 'desc'
      };
    } else {
      nextSort = undefined;
    }

    this.currentSort.set(
      nextSort
    );

    this.first.set(0);

    this.sortChanged.emit(
      nextSort
    );
  }

  onRowClick(
    row: TRow,
    event: MouseEvent
  ): void {
    if (!this.selectable()) {
      return;
    }

    const target =
      event.target as HTMLElement;

    if (
      target.closest(
        [
          'button',
          'a',
          'input',
          'select',
          'textarea',
          'label',
          '.p-checkbox',
          '.p-button',
          '.p-select'
        ].join(', ')
      )
    ) {
      return;
    }

    this.rowSelected.emit(row);
  }

  onRowDoubleClick(
    row: TRow
  ): void {
    this.rowDoubleClicked.emit(
      row
    );
  }

  onSelectionChange(
    selection:
      | TRow
      | TRow[]
      | null
  ): void {
    if (
      this.selectionMode() ===
      'multiple'
    ) {
      this.selectionChanged.emit(
        Array.isArray(selection)
          ? selection
          : []
      );

      return;
    }

    if (
      this.selectionMode() ===
        'single' &&
      selection &&
      !Array.isArray(selection)
    ) {
      this.selectionChanged.emit([
        selection
      ]);

      this.rowSelected.emit(
        selection
      );

      return;
    }

    this.selectionChanged.emit([]);
  }

  isColumnVisible(
    column: DataTableColumn<TRow>
  ): boolean {
    return !this.hiddenFields()
      .has(column.field);
  }

  toggleColumnVisibility(
    column: DataTableColumn<TRow>
  ): void {
    if (column.locked) {
      return;
    }

    const hidden =
      new Set(
        this.hiddenFields()
      );

    const currentlyVisible =
      !hidden.has(column.field);

    if (currentlyVisible) {
      hidden.add(column.field);
    } else {
      hidden.delete(
        column.field
      );
    }

    this.hiddenFields.set(hidden);

    this.columnVisibilityChanged.emit({
      field: column.field,
      visible: !currentlyVisible
    });
  }

  toggleVisibilityMenu(): void {
    this.visibilityOpen.update(
      value => !value
    );
  }

  closeVisibilityMenu(): void {
    this.visibilityOpen.set(false);
  }

  retryLoad(): void {
    this.retry.emit();

    if (this.lazy()) {
      this.emitLazyEvent();
    }
  }

  state(): DataTableState {
    const size =
      this.currentPageSize();

    const first =
      this.first();

    return {
      page:
        size > 0
          ? Math.floor(
              first / size
            )
          : 0,

      size,

      first,

      sort:
        this.currentSort(),

      globalSearch:
        this.globalSearch(),

      filters:
        sanitizeFilters(
          this.filters()
        )
    };
  }

  private scheduleFilterEmission(): void {
    if (this.filterTimer) {
      clearTimeout(
        this.filterTimer
      );
    }

    this.filterTimer = setTimeout(
      () => {
        const filters =
          sanitizeFilters(
            this.filters()
          );

        this.filtersChanged.emit(
          filters
        );

        if (this.lazy()) {
          this.emitLazyEvent();
        }
      },
      this.filterDebounce()
    );
  }

  private emitLazyEvent(): void {
    const size =
      this.currentPageSize();

    const first =
      this.first();

    this.lazyLoad.emit({
      page:
        size > 0
          ? Math.floor(
              first / size
            )
          : 0,

      size,

      first,

      sort:
        this.currentSort(),

      globalSearch:
        this.globalSearch().trim() ||
        undefined,

      filters:
        sanitizeFilters(
          this.filters()
        )
    });
  }


primeSelectableRow(
  row: TRow
): TRow | null {
  return this.selectionMode() === 'none'
    ? null
    : row;
}

isMultipleSelection(): boolean {
  return this.selectionMode() === 'multiple';
}

hasActiveFilters(): boolean {
  return (
    Boolean(this.globalSearch().trim()) ||
    Object.values(this.filters()).some(
      value =>
        value !== null &&
        value !== undefined &&
        value !== ''
    )
  );
}

tableColumnSpan(): number {
  return (
    this.visibleColumns().length +
    (this.isMultipleSelection() ? 1 : 0)
  );
}
}