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

import {
  FormsModule
} from '@angular/forms';

import {
  ButtonModule
} from 'primeng/button';

import {
  CheckboxModule
} from 'primeng/checkbox';

import {
  InputNumberModule
} from 'primeng/inputnumber';

import {
  InputTextModule
} from 'primeng/inputtext';

import {
  TooltipModule
} from 'primeng/tooltip';

import type {
  ColumnManagerApplyEvent,
  ColumnManagerChangeEvent,
  ColumnManagerItem,
  ColumnManagerOrderEvent,
  ColumnManagerResetEvent,
  ColumnManagerVisibilityEvent,
  ColumnManagerWidthEvent
} from './column-manager.models';

@Component({
  selector: 'to-column-manager',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
    ButtonModule,
    CheckboxModule,
    InputNumberModule,
    InputTextModule,
    TooltipModule,
    CommonModule
  ],
  templateUrl:
    './column-manager.html',
  styleUrl:
    './column-manager.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class ColumnManagerComponent {
  readonly columns =
    input<ColumnManagerItem[]>([]);

  readonly loading =
    input(false);

  readonly disabled =
    input(false);

  readonly compact =
    input(false);

  readonly showSearch =
    input(true);

  readonly showWidths =
    input(false);

  readonly showDescriptions =
    input(true);

  readonly showBulkActions =
    input(true);

  readonly showReset =
    input(true);

  readonly showApply =
    input(false);

  readonly liveUpdate =
    input(true);

  readonly allowReorder =
    input(true);

  readonly allowHideAll =
    input(false);

  readonly minimumVisibleColumns =
    input(1);

  readonly title =
    input('Columns');

  readonly subtitle =
    input(
      'Choose which columns appear and control their order.'
    );

  readonly searchPlaceholder =
    input('Search columns');

  readonly emptyTitle =
    input('No columns found');

  readonly emptyMessage =
    input(
      'Try a different search term.'
    );

  readonly resetLabel =
    input('Reset');

  readonly applyLabel =
    input('Apply');

  readonly dataTestId =
    input('column-manager');

  readonly columnsChange =
    output<ColumnManagerItem[]>();

  readonly configurationChanged =
    output<ColumnManagerChangeEvent>();

  readonly visibilityChanged =
    output<ColumnManagerVisibilityEvent>();

  readonly orderChanged =
    output<ColumnManagerOrderEvent>();

  readonly widthChanged =
    output<ColumnManagerWidthEvent>();

  readonly resetRequested =
    output<ColumnManagerResetEvent>();

  readonly applyRequested =
    output<ColumnManagerApplyEvent>();

  readonly search =
    signal('');

  readonly internalColumns =
    signal<ColumnManagerItem[]>([]);

  readonly initialColumns =
    signal<ColumnManagerItem[]>([]);

  readonly draggedColumnKey =
    signal<string | null>(null);

  readonly dragOverColumnKey =
    signal<string | null>(null);

  readonly filteredColumns =
    computed(() => {
      const query =
        this.search()
          .trim()
          .toLowerCase();

      const columns =
        this.internalColumns();

      if (!query) {
        return columns;
      }

      return columns.filter(
        column =>
          column.label
            .toLowerCase()
            .includes(query) ||
          column.key
            .toLowerCase()
            .includes(query) ||
          column.description
            ?.toLowerCase()
            .includes(query) ||
          column.group
            ?.toLowerCase()
            .includes(query)
      );
    });

  readonly visibleColumns =
    computed(() =>
      this.internalColumns().filter(
        column => column.visible
      )
    );

  readonly hiddenColumns =
    computed(() =>
      this.internalColumns().filter(
        column => !column.visible
      )
    );

  readonly visibleColumnCount =
    computed(
      () =>
        this.visibleColumns().length
    );

  readonly totalColumnCount =
    computed(
      () =>
        this.internalColumns().length
    );

  readonly dirty =
    computed(
      () =>
        this.serialiseColumns(
          this.internalColumns()
        ) !==
        this.serialiseColumns(
          this.initialColumns()
        )
    );

  readonly hasColumns =
    computed(
      () =>
        this.filteredColumns().length >
        0
    );

  readonly canHideOptionalColumns =
    computed(() =>
      this.internalColumns().some(
        column =>
          column.visible &&
          !this.isRequiredColumn(
            column
          )
      )
    );

  readonly canShowAll =
    computed(() =>
      this.internalColumns().some(
        column =>
          !column.visible &&
          !column.disabled
      )
    );

  readonly componentClasses =
    computed<
      Record<string, boolean>
    >(() => ({
      'to-column-manager--compact':
        this.compact(),

      'to-column-manager--loading':
        this.loading(),

      'to-column-manager--disabled':
        this.disabled(),

      'to-column-manager--dirty':
        this.dirty(),

      'to-column-manager--widths':
        this.showWidths()
    }));

  constructor() {
    effect(() => {
      const columns =
        this.normaliseColumns(
          this.columns()
        );

      this.internalColumns.set(
        this.cloneColumns(columns)
      );

      this.initialColumns.set(
        this.cloneColumns(columns)
      );
    });
  }

  toggleColumn(
    column: ColumnManagerItem,
    visible: boolean
  ): void {
    if (
      this.isInteractionDisabled() ||
      column.disabled ||
      (
        this.isRequiredColumn(
          column
        ) &&
        !visible
      )
    ) {
      return;
    }

    if (
      !visible &&
      !this.canHideColumn(column)
    ) {
      return;
    }

    this.internalColumns.update(
      columns =>
        columns.map(item =>
          item.key === column.key
            ? {
                ...item,
                visible
              }
            : item
        )
    );

    const updatedColumn =
      this.getColumn(column.key);

    if (!updatedColumn) {
      return;
    }

    this.visibilityChanged.emit({
      column: updatedColumn,
      columnKey:
        updatedColumn.key,
      visible
    });

    this.emitChange();
  }

  showAllColumns(): void {
    if (
      this.isInteractionDisabled()
    ) {
      return;
    }

    this.internalColumns.update(
      columns =>
        columns.map(column => ({
          ...column,
          visible:
            column.disabled
              ? column.visible
              : true
        }))
    );

    this.emitChange();
  }

  hideOptionalColumns(): void {
    if (
      this.isInteractionDisabled()
    ) {
      return;
    }

    this.internalColumns.update(
      columns =>
        columns.map(column => ({
          ...column,
          visible:
            this.isRequiredColumn(
              column
            )
              ? true
              : false
        }))
    );

    this.ensureMinimumVisibleColumns();
    this.emitChange();
  }

  moveColumnUp(
    column: ColumnManagerItem
  ): void {
    const index =
      this.findColumnIndex(
        column.key
      );

    if (index <= 0) {
      return;
    }

    this.moveColumn(
      index,
      index - 1
    );
  }

  moveColumnDown(
    column: ColumnManagerItem
  ): void {
    const index =
      this.findColumnIndex(
        column.key
      );

    if (
      index < 0 ||
      index >=
        this.internalColumns().length -
          1
    ) {
      return;
    }

    this.moveColumn(
      index,
      index + 1
    );
  }

  moveColumn(
    previousIndex: number,
    currentIndex: number
  ): void {
    if (
      this.isInteractionDisabled() ||
      !this.allowReorder() ||
      previousIndex === currentIndex
    ) {
      return;
    }

    const columns = [
      ...this.internalColumns()
    ];

    const [column] =
      columns.splice(
        previousIndex,
        1
      );

    if (!column) {
      return;
    }

    columns.splice(
      currentIndex,
      0,
      column
    );

    const ordered =
      columns.map(
        (item, index) => ({
          ...item,
          order: index
        })
      );

    this.internalColumns.set(
      ordered
    );

    this.orderChanged.emit({
      column: {
        ...column,
        order: currentIndex
      },
      columnKey: column.key,
      previousIndex,
      currentIndex,
      columns:
        this.cloneColumns(ordered)
    });

    this.emitChange();
  }

  updateWidth(
    column: ColumnManagerItem,
    width:
      | number
      | null
      | undefined
  ): void {
    if (
      this.isInteractionDisabled() ||
      column.disabled
    ) {
      return;
    }

    const normalisedWidth =
      this.normaliseWidth(
        column,
        width
      );

    this.internalColumns.update(
      columns =>
        columns.map(item =>
          item.key === column.key
            ? {
                ...item,
                width:
                  normalisedWidth
              }
            : item
        )
    );

    const updatedColumn =
      this.getColumn(column.key);

    if (!updatedColumn) {
      return;
    }

    this.widthChanged.emit({
      column: updatedColumn,
      columnKey:
        updatedColumn.key,
      width:
        updatedColumn.width ??
        null
    });

    this.emitChange();
  }

  resetColumns(): void {
    if (
      this.isInteractionDisabled() ||
      !this.showReset()
    ) {
      return;
    }

    const resetColumns =
      this.normaliseColumns(
        this.columns().map(
          column => ({
            ...column,
            visible:
              column.required ||
              column.locked
                ? true
                : (
                    column.defaultVisible ??
                    column.visible
                  )
          })
        )
      );

    this.internalColumns.set(
      this.cloneColumns(
        resetColumns
      )
    );

    this.resetRequested.emit({
      columns:
        this.cloneColumns(
          resetColumns
        )
    });

    this.emitChange();
  }

  applyColumns(): void {
    if (
      this.isInteractionDisabled() ||
      !this.showApply()
    ) {
      return;
    }

    const columns =
      this.cloneColumns(
        this.internalColumns()
      );

    this.initialColumns.set(
      this.cloneColumns(columns)
    );

    this.applyRequested.emit({
      columns,
      visibleColumnKeys:
        columns
          .filter(
            column =>
              column.visible
          )
          .map(
            column =>
              column.key
          ),
      orderedColumnKeys:
        columns.map(
          column =>
            column.key
        )
    });
  }

  handleDragStart(
    event: DragEvent,
    column: ColumnManagerItem
  ): void {
    if (
      this.isInteractionDisabled() ||
      !this.allowReorder() ||
      column.disabled
    ) {
      event.preventDefault();
      return;
    }

    this.draggedColumnKey.set(
      column.key
    );

    event.dataTransfer?.setData(
      'text/plain',
      column.key
    );

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed =
        'move';
    }
  }

  handleDragOver(
    event: DragEvent,
    column: ColumnManagerItem
  ): void {
    if (
      !this.draggedColumnKey() ||
      column.key ===
        this.draggedColumnKey()
    ) {
      return;
    }

    event.preventDefault();

    this.dragOverColumnKey.set(
      column.key
    );

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect =
        'move';
    }
  }

  handleDrop(
    event: DragEvent,
    targetColumn:
      ColumnManagerItem
  ): void {
    event.preventDefault();

    const draggedKey =
      this.draggedColumnKey();

    if (
      !draggedKey ||
      draggedKey ===
        targetColumn.key
    ) {
      this.clearDragState();
      return;
    }

    const previousIndex =
      this.findColumnIndex(
        draggedKey
      );

    const currentIndex =
      this.findColumnIndex(
        targetColumn.key
      );

    if (
      previousIndex >= 0 &&
      currentIndex >= 0
    ) {
      this.moveColumn(
        previousIndex,
        currentIndex
      );
    }

    this.clearDragState();
  }

  handleDragEnd(): void {
    this.clearDragState();
  }

  isRequiredColumn(
    column: ColumnManagerItem
  ): boolean {
    return Boolean(
      column.required ||
      column.locked
    );
  }

  canHideColumn(
    column: ColumnManagerItem
  ): boolean {
    if (
      this.isRequiredColumn(column)
    ) {
      return false;
    }

    if (this.allowHideAll()) {
      return true;
    }

    return (
      this.visibleColumnCount() >
      Math.max(
        1,
        this.minimumVisibleColumns()
      )
    );
  }

  columnPosition(
    column: ColumnManagerItem
  ): number {
    return (
      this.findColumnIndex(
        column.key
      ) + 1
    );
  }

  isFirstColumn(
    column: ColumnManagerItem
  ): boolean {
    return (
      this.findColumnIndex(
        column.key
      ) === 0
    );
  }

  isLastColumn(
    column: ColumnManagerItem
  ): boolean {
    return (
      this.findColumnIndex(
        column.key
      ) ===
      this.internalColumns().length -
        1
    );
  }

  private emitChange(): void {
    const columns =
      this.cloneColumns(
        this.internalColumns()
      );

    const event:
      ColumnManagerChangeEvent = {
        columns,
        visibleColumnKeys:
          columns
            .filter(
              column =>
                column.visible
            )
            .map(
              column =>
                column.key
            ),
        hiddenColumnKeys:
          columns
            .filter(
              column =>
                !column.visible
            )
            .map(
              column =>
                column.key
            ),
        orderedColumnKeys:
          columns.map(
            column =>
              column.key
          ),
        dirty: this.dirty()
      };

    if (this.liveUpdate()) {
      this.columnsChange.emit(
        columns
      );
    }

    this.configurationChanged.emit(
      event
    );
  }

  private ensureMinimumVisibleColumns():
    void {
    const minimum =
      Math.max(
        0,
        this.minimumVisibleColumns()
      );

    const columns = [
      ...this.internalColumns()
    ];

    const visibleCount =
      columns.filter(
        column =>
          column.visible
      ).length;

    if (
      visibleCount >= minimum
    ) {
      return;
    }

    let required =
      minimum - visibleCount;

    const updated =
      columns.map(column => {
        if (
          required > 0 &&
          !column.visible &&
          !column.disabled
        ) {
          required -= 1;

          return {
            ...column,
            visible: true
          };
        }

        return column;
      });

    this.internalColumns.set(
      updated
    );
  }

  private normaliseColumns(
    columns:
      ColumnManagerItem[]
  ): ColumnManagerItem[] {
    return [...columns]
      .sort(
        (first, second) =>
          (
            first.order ??
            Number.MAX_SAFE_INTEGER
          ) -
          (
            second.order ??
            Number.MAX_SAFE_INTEGER
          )
      )
      .map(
        (column, index) => ({
          ...column,
          visible:
            this.isRequiredColumn(
              column
            )
              ? true
              : column.visible,
          defaultVisible:
            column.defaultVisible ??
            column.visible,
          order: index,
          minimumWidth:
            column.minimumWidth ??
            80,
          maximumWidth:
            column.maximumWidth ??
            600
        })
      );
  }

  private normaliseWidth(
    column: ColumnManagerItem,
    width:
      | number
      | null
      | undefined
  ): number | null {
    if (
      width === null ||
      width === undefined
    ) {
      return null;
    }

    const parsed =
      Number(width);

    if (!Number.isFinite(parsed)) {
      return null;
    }

    return Math.min(
      column.maximumWidth ?? 600,
      Math.max(
        column.minimumWidth ?? 80,
        parsed
      )
    );
  }

  private getColumn(
    columnKey: string
  ): ColumnManagerItem | null {
    return (
      this.internalColumns().find(
        column =>
          column.key === columnKey
      ) ?? null
    );
  }

  private findColumnIndex(
    columnKey: string
  ): number {
    return this.internalColumns()
      .findIndex(
        column =>
          column.key === columnKey
      );
  }

  private clearDragState(): void {
    this.draggedColumnKey.set(
      null
    );

    this.dragOverColumnKey.set(
      null
    );
  }

  private serialiseColumns(
    columns:
      ColumnManagerItem[]
  ): string {
    return JSON.stringify(
      columns.map(column => ({
        key: column.key,
        visible:
          column.visible,
        width:
          column.width ?? null,
        order:
          column.order ?? null
      }))
    );
  }

  private cloneColumns(
    columns:
      ColumnManagerItem[]
  ): ColumnManagerItem[] {
    return columns.map(
      column => ({
        ...column
      })
    );
  }

  private isInteractionDisabled():
    boolean {
    return (
      this.disabled() ||
      this.loading()
    );
  }
}