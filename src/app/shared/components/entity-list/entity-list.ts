import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal
} from '@angular/core';

import {
  CommonModule,
  NgClass
} from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';

import {
  EntityListActionEvent,
  EntityListColumn,
  EntityListLoadMoreEvent,
  EntityListRow,
  EntityListRowAction,
  EntityListRowEvent,
  EntityListSelectionEvent,
  EntityListSelectionMode,
  EntityListSort,
  EntityListSortDirection,
  EntityListSortEvent,
  EntityListValue
} from './entity-list.models';

import {
  StatusBadgeComponent
} from '../status-badge/status-badge';

import {
  StatusBadgeTone
} from '../status-badge/status-badge.models';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'to-entity-list',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
    ButtonModule,
    CheckboxModule,
    ProgressSpinnerModule,
    TooltipModule,
    StatusBadgeComponent,
    CommonModule
    ],
  templateUrl: './entity-list.html',
  styleUrl: './entity-list.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class EntityListComponent {
  readonly rows =
    input<EntityListRow[]>([]);

  readonly columns =
    input<EntityListColumn[]>([]);

  readonly loading =
    input(false);

  readonly loadingMore =
    input(false);

  readonly selectionMode =
    input<EntityListSelectionMode>(
      'none'
    );

  readonly selectedIds =
    input<Array<string | number>>(
      []
    );

  readonly sort =
    input<EntityListSort | null>(
      null
    );

  readonly clickableRows =
    input(true);

  readonly showHeader =
    input(true);

  readonly showIdentity =
    input(true);

  readonly showStatus =
    input(true);

  readonly showActions =
    input(true);

  readonly compact =
    input(false);

  readonly striped =
    input(false);

  readonly hoverable =
    input(true);

  readonly stickyHeader =
    input(false);

  readonly hasMore =
    input(false);

  readonly loadMoreLabel =
    input('Load More');

  readonly loadingRows =
    input(6);

  readonly emptyTitle =
    input('No records found');

  readonly emptyMessage =
    input(
      'There are no records available for the selected criteria.'
    );

  readonly emptyIcon =
    input('pi pi-inbox');

  readonly dataTestId =
    input('entity-list');

  readonly rowSelected =
    output<EntityListRowEvent>();

  readonly rowActionRequested =
    output<EntityListActionEvent>();

  readonly selectionChanged =
    output<EntityListSelectionEvent>();

  readonly sortChanged =
    output<EntityListSortEvent>();

  readonly loadMoreRequested =
    output<EntityListLoadMoreEvent>();

  private readonly internalSelectedIds =
    signal<Array<string | number>>(
      []
    );

rowStatusLabel(
  row: EntityListRow
): string | null {
  return row.status?.label ?? null;
}

rowStatusTone(
  row: EntityListRow
): StatusBadgeTone | null {
  return row.status?.tone ?? null;
}

rowStatusIcon(
  row: EntityListRow
): string | null {
  return row.status?.icon ?? null;
}

rowStatusValue(
  row: EntityListRow
): string | boolean | null {
  return row.status?.value ?? null;
}



statusValueFor(
  row: EntityListRow,
  column: EntityListColumn
): string | boolean | null {
  const value =
    this.valueFor(row, column);

  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (
    typeof value === 'string' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : value.toISOString();
  }

  return String(value);
}
  readonly visibleRows =
    computed(() =>
      this.rows().filter(
        row => row.visible !== false
      )
    );

  readonly visibleColumns =
    computed(() =>
      this.columns().filter(
        column =>
          column.visible !== false
      )
    );

  readonly mobileColumns =
    computed(() =>
      this.visibleColumns().filter(
        column =>
          column.mobileVisible !== false
      )
    );

  readonly selectedIdSet =
    computed(
      () =>
        new Set(
          this.internalSelectedIds()
        )
    );

  readonly selectableRows =
    computed(() =>
      this.visibleRows().filter(
        row =>
          row.selectable !== false &&
          row.disabled !== true
      )
    );

  readonly allSelected =
    computed(() => {
      const selectable =
        this.selectableRows();

      if (!selectable.length) {
        return false;
      }

      return selectable.every(
        row =>
          this.selectedIdSet().has(
            row.id
          )
      );
    });

  readonly partiallySelected =
    computed(() => {
      const selectedCount =
        this.selectableRows().filter(
          row =>
            this.selectedIdSet().has(
              row.id
            )
        ).length;

      return (
        selectedCount > 0 &&
        selectedCount <
          this.selectableRows().length
      );
    });

  readonly listClasses =
    computed<Record<string, boolean>>(
      () => ({
        'to-entity-list--compact':
          this.compact(),

        'to-entity-list--striped':
          this.striped(),

        'to-entity-list--hoverable':
          this.hoverable(),

        'to-entity-list--sticky-header':
          this.stickyHeader(),

        'to-entity-list--selectable':
          this.selectionMode() !== 'none',

        'to-entity-list--clickable':
          this.clickableRows()
      })
    );

  readonly skeletonItems =
    computed(() =>
      Array.from(
        {
          length:
            Math.max(
              1,
              this.loadingRows()
            )
        },
        (_, index) => index
      )
    );

  constructor() {
    effect(
      () => {
        this.internalSelectedIds.set(
          [...this.selectedIds()]
        );
      },
      {
        allowSignalWrites: true
      }
    );
  }

  selectRow(
    row: EntityListRow
  ): void {
    if (
      !this.clickableRows() ||
      row.disabled === true
    ) {
      return;
    }

    this.rowSelected.emit({
      row
    });
  }

  handleRowKeydown(
    event: KeyboardEvent,
    row: EntityListRow
  ): void {
    if (
      event.key !== 'Enter' &&
      event.key !== ' '
    ) {
      return;
    }

    event.preventDefault();

    this.selectRow(row);
  }

  toggleRowSelection(
    event: Event,
    row: EntityListRow
  ): void {
    event.stopPropagation();

    if (
      this.selectionMode() ===
        'none' ||
      row.selectable === false ||
      row.disabled === true
    ) {
      return;
    }

    const selected =
      new Set(
        this.internalSelectedIds()
      );

    if (
      this.selectionMode() ===
      'single'
    ) {
      if (selected.has(row.id)) {
        selected.clear();
      } else {
        selected.clear();
        selected.add(row.id);
      }
    } else if (
      selected.has(row.id)
    ) {
      selected.delete(row.id);
    } else {
      selected.add(row.id);
    }

    this.applySelection([
      ...selected
    ]);
  }

  toggleAllSelection(
    event: Event
  ): void {
    event.stopPropagation();

    if (
      this.selectionMode() !==
      'multiple'
    ) {
      return;
    }

    if (this.allSelected()) {
      const visibleIds =
        new Set(
          this.selectableRows().map(
            row => row.id
          )
        );

      this.applySelection(
        this.internalSelectedIds().filter(
          id =>
            !visibleIds.has(id)
        )
      );

      return;
    }

    const selected =
      new Set(
        this.internalSelectedIds()
      );

    for (
      const row of
      this.selectableRows()
    ) {
      selected.add(row.id);
    }

    this.applySelection([
      ...selected
    ]);
  }

  requestAction(
    event: Event,
    row: EntityListRow,
    action: EntityListRowAction
  ): void {
    event.stopPropagation();

    if (
      action.visible === false ||
      action.disabled === true ||
      action.loading === true ||
      row.disabled === true
    ) {
      return;
    }

    this.rowActionRequested.emit({
      row,
      action
    });
  }

  requestSort(
    column: EntityListColumn
  ): void {
    if (!column.sortable) {
      return;
    }

    const current =
      this.sort();

    let direction:
      EntityListSortDirection =
        'asc';

    if (
      current?.columnId ===
        column.id &&
      current.direction === 'asc'
    ) {
      direction = 'desc';
    }

    this.sortChanged.emit({
      sort: {
        columnId: column.id,
        direction
      }
    });
  }

  requestLoadMore(): void {
    if (
      !this.hasMore() ||
      this.loadingMore()
    ) {
      return;
    }

    this.loadMoreRequested.emit({
      currentCount:
        this.visibleRows().length
    });
  }

  isSelected(
    row: EntityListRow
  ): boolean {
    return this.selectedIdSet().has(
      row.id
    );
  }

  rowClasses(
    row: EntityListRow
  ): Record<string, boolean> {
    return {
      'to-entity-list__row--selected':
        this.isSelected(row),

      'to-entity-list__row--disabled':
        row.disabled === true,

      'to-entity-list__row--interactive':
        this.clickableRows() &&
        row.disabled !== true
    };
  }

  visibleActions(
    row: EntityListRow
  ): EntityListRowAction[] {
    return (
      row.actions?.filter(
        action =>
          action.visible !== false
      ) ?? []
    );
  }

  valueFor(
    row: EntityListRow,
    column: EntityListColumn
  ): EntityListValue {
    if (column.valueResolver) {
      return column.valueResolver(
        row
      );
    }

    const field =
      column.field ?? column.id;

    return (
      row.values?.[field] ??
      null
    );
  }

  displayValue(
    row: EntityListRow,
    column: EntityListColumn
  ): string {
    const value =
      this.valueFor(
        row,
        column
      );

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return (
        column.emptyText ?? '—'
      );
    }

    if (
      column.type === 'boolean' ||
      typeof value === 'boolean'
    ) {
      return value === true
        ? 'Yes'
        : 'No';
    }

    if (
      column.type === 'number' &&
      typeof value === 'number'
    ) {
      return value.toLocaleString(
        undefined,
        {
          minimumFractionDigits:
            column.decimalPlaces ?? 0,
          maximumFractionDigits:
            column.decimalPlaces ?? 0
        }
      );
    }

    if (
      column.type === 'date'
    ) {
      const date =
        this.dateValue(value);

      if (!date) {
        return (
          column.emptyText ?? '—'
        );
      }

      return new Intl.DateTimeFormat(
        undefined,
        {
          year: 'numeric',
          month: 'short',
          day: '2-digit'
        }
      ).format(date);
    }

    return String(value);
  }

  dateValue(
    value: EntityListValue
  ): Date | null {
    if (value instanceof Date) {
      return Number.isNaN(
        value.getTime()
      )
        ? null
        : value;
    }

    if (
      typeof value === 'string' ||
      typeof value === 'number'
    ) {
      const date =
        new Date(value);

      return Number.isNaN(
        date.getTime()
      )
        ? null
        : date;
    }

    return null;
  }

  alignmentClass(
    column: EntityListColumn
  ): string {
    return `to-entity-list__cell--${
      column.align ?? 'left'
    }`;
  }

  sortIcon(
    column: EntityListColumn
  ): string {
    const current =
      this.sort();

    if (
      current?.columnId !==
      column.id
    ) {
      return 'pi pi-sort-alt';
    }

    return current.direction ===
      'asc'
      ? 'pi pi-sort-amount-up-alt'
      : 'pi pi-sort-amount-down';
  }

  private applySelection(
    ids: Array<string | number>
  ): void {
    this.internalSelectedIds.set(
      ids
    );

    const selectedSet =
      new Set(ids);

    this.selectionChanged.emit({
      selectedIds: ids,

      selectedRows:
        this.rows().filter(
          row =>
            selectedSet.has(row.id)
        )
    });
  }
}
