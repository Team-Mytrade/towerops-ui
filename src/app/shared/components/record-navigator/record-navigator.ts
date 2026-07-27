import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output
} from '@angular/core';

import {
  NgClass
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  ButtonModule
} from 'primeng/button';

import {
  SelectModule
} from 'primeng/select';

import {
  TooltipModule
} from 'primeng/tooltip';

import type {
  RecordNavigatorBackEvent,
  RecordNavigatorChangeEvent,
  RecordNavigatorItem,
  RecordNavigatorRefreshEvent
} from './record-navigator.models';

@Component({
  selector: 'to-record-navigator',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
    ButtonModule,
    SelectModule,
    TooltipModule
  ],
  templateUrl:
    './record-navigator.html',
  styleUrl:
    './record-navigator.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class RecordNavigatorComponent {
  readonly items =
    input<RecordNavigatorItem[]>([]);

  readonly activeItemId =
    input<string | number | null>(
      null
    );

  readonly loading =
    input(false);

  readonly disabled =
    input(false);

  readonly compact =
    input(false);

  readonly showBack =
    input(true);

  readonly showFirstLast =
    input(false);

  readonly showSelector =
    input(false);

  readonly showPosition =
    input(true);

  readonly showRefresh =
    input(false);

  readonly wrap =
    input(false);

  readonly backLabel =
    input('Back to list');

  readonly previousLabel =
    input('Previous record');

  readonly nextLabel =
    input('Next record');

  readonly firstLabel =
    input('First record');

  readonly lastLabel =
    input('Last record');

  readonly refreshLabel =
    input('Refresh record');

  readonly emptyLabel =
    input('No records');

  readonly dataTestId =
    input('record-navigator');

  readonly activeItemChange =
    output<string | number>();

  readonly navigationChanged =
    output<RecordNavigatorChangeEvent>();

  readonly backRequested =
    output<RecordNavigatorBackEvent>();

  readonly refreshRequested =
    output<RecordNavigatorRefreshEvent>();

  readonly enabledItems =
    computed(() =>
      this.items().filter(
        item =>
          item.disabled !== true
      )
    );

  readonly activeIndex =
    computed(() => {
      const activeId =
        this.activeItemId();

      if (
        activeId === null ||
        activeId === undefined
      ) {
        return -1;
      }

      return this.enabledItems().findIndex(
        item =>
          item.id === activeId
      );
    });

  readonly activeItem =
    computed<RecordNavigatorItem | null>(
      () => {
        const index =
          this.activeIndex();

        return index >= 0
          ? this.enabledItems()[index]
          : null;
      }
    );

  readonly total =
    computed(
      () =>
        this.enabledItems().length
    );

  readonly hasItems =
    computed(
      () =>
        this.total() > 0
    );

  readonly hasPrevious =
    computed(() => {
      if (!this.hasItems()) {
        return false;
      }

      return (
        this.activeIndex() > 0 ||
        this.wrap()
      );
    });

  readonly hasNext =
    computed(() => {
      if (!this.hasItems()) {
        return false;
      }

      return (
        this.activeIndex() <
          this.total() - 1 ||
        this.wrap()
      );
    });

  readonly positionLabel =
    computed(() => {
      const index =
        this.activeIndex();

      if (index < 0) {
        return this.emptyLabel();
      }

      return `${
        index + 1
      } of ${this.total()}`;
    });

  readonly selectorOptions =
    computed(() =>
      this.enabledItems().map(
        item => ({
          label:
            item.code
              ? `${item.code} · ${item.label}`
              : item.label,
          value: item.id,
          item
        })
      )
    );

  readonly navigatorClasses =
    computed<Record<string, boolean>>(
      () => ({
        'to-record-navigator--compact':
          this.compact(),

        'to-record-navigator--loading':
          this.loading(),

        'to-record-navigator--disabled':
          this.disabled()
      })
    );

  goPrevious(): void {
    if (
      this.isInteractionDisabled() ||
      !this.hasPrevious()
    ) {
      return;
    }

    const items =
      this.enabledItems();

    let targetIndex =
      this.activeIndex() - 1;

    if (targetIndex < 0) {
      targetIndex =
        items.length - 1;
    }

    this.navigateTo(
      targetIndex,
      'previous'
    );
  }

  goNext(): void {
    if (
      this.isInteractionDisabled() ||
      !this.hasNext()
    ) {
      return;
    }

    const items =
      this.enabledItems();

    let targetIndex =
      this.activeIndex() + 1;

    if (
      targetIndex >=
      items.length
    ) {
      targetIndex = 0;
    }

    this.navigateTo(
      targetIndex,
      'next'
    );
  }

  goFirst(): void {
    if (
      this.isInteractionDisabled() ||
      !this.hasItems()
    ) {
      return;
    }

    this.navigateTo(
      0,
      'first'
    );
  }

  goLast(): void {
    if (
      this.isInteractionDisabled() ||
      !this.hasItems()
    ) {
      return;
    }

    this.navigateTo(
      this.total() - 1,
      'last'
    );
  }

  selectItem(
    itemId:
      | string
      | number
      | null
      | undefined
  ): void {
    if (
      this.isInteractionDisabled() ||
      itemId === null ||
      itemId === undefined
    ) {
      return;
    }

    const index =
      this.enabledItems().findIndex(
        item =>
          item.id === itemId
      );

    if (index < 0) {
      return;
    }

    this.navigateTo(
      index,
      'select'
    );
  }

  requestBack(): void {
    if (
      this.isInteractionDisabled()
    ) {
      return;
    }

    this.backRequested.emit({
      currentItemId:
        this.activeItemId()
    });
  }

  requestRefresh(): void {
    if (
      this.isInteractionDisabled() ||
      !this.activeItem()
    ) {
      return;
    }

    this.refreshRequested.emit({
      currentItemId:
        this.activeItemId()
    });
  }

  private navigateTo(
    index: number,
    direction:
      RecordNavigatorChangeEvent['direction']
  ): void {
    const items =
      this.enabledItems();

    const item =
      items[index];

    if (!item) {
      return;
    }

    const previousItemId =
      this.activeItemId();

    this.activeItemChange.emit(
      item.id
    );

    this.navigationChanged.emit({
      previousItemId,
      itemId: item.id,
      item,
      index,
      total: items.length,
      direction
    });
  }

  private isInteractionDisabled():
    boolean {
    return (
      this.loading() ||
      this.disabled()
    );
  }
}