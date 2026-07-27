import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal
} from '@angular/core';

import { NgClass } from '@angular/common';

import { ProgressSpinnerModule } from 'primeng/progressspinner';

import {
  DetailSectionTab,
  DetailSectionTabChangeEvent
} from './detail-section-tabs.models';

@Component({
  selector: 'to-detail-section-tabs',
  standalone: true,
  imports: [
    NgClass,
    ProgressSpinnerModule
  ],
  templateUrl: './detail-section-tabs.html',
  styleUrl: './detail-section-tabs.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class DetailSectionTabsComponent {
  readonly tabs =
    input<DetailSectionTab[]>([]);

  readonly activeTabId =
    input<string | null>(null);

  readonly orientation =
    input<'horizontal' | 'vertical'>(
      'horizontal'
    );

  readonly compact =
    input(false);

  readonly fullWidth =
    input(false);

  readonly sticky =
    input(false);

  readonly showDescriptions =
    input(false);

  readonly showContent =
    input(true);

  readonly dataTestId =
    input('detail-section-tabs');

  readonly activeTabChange =
    output<DetailSectionTabChangeEvent>();

  private readonly internalActiveTabId =
    signal<string | null>(null);

  readonly visibleTabs =
    computed(() =>
      this.tabs().filter(
        tab => tab.visible !== false
      )
    );

  readonly resolvedActiveTabId =
    computed(() => {
      const requestedTabId =
        this.activeTabId();

      if (
        requestedTabId &&
        this.visibleTabs().some(
          tab =>
            tab.id === requestedTabId &&
            tab.disabled !== true
        )
      ) {
        return requestedTabId;
      }

      const internalTabId =
        this.internalActiveTabId();

      if (
        internalTabId &&
        this.visibleTabs().some(
          tab =>
            tab.id === internalTabId &&
            tab.disabled !== true
        )
      ) {
        return internalTabId;
      }

      return (
        this.visibleTabs().find(
          tab => tab.disabled !== true
        )?.id ?? null
      );
    });

  readonly activeTab =
    computed<DetailSectionTab | null>(() => {
      const activeTabId =
        this.resolvedActiveTabId();

      if (!activeTabId) {
        return null;
      }

      return (
        this.visibleTabs().find(
          tab => tab.id === activeTabId
        ) ?? null
      );
    });

  readonly containerClasses =
    computed<Record<string, boolean>>(
      () => ({
        'to-detail-section-tabs--horizontal':
          this.orientation() ===
          'horizontal',

        'to-detail-section-tabs--vertical':
          this.orientation() ===
          'vertical',

        'to-detail-section-tabs--compact':
          this.compact(),

        'to-detail-section-tabs--full-width':
          this.fullWidth(),

        'to-detail-section-tabs--sticky':
          this.sticky()
      })
    );

  constructor() {
    effect(
      () => {
        const requestedTabId =
          this.activeTabId();

        const visibleTabs =
          this.visibleTabs();

        if (
          requestedTabId &&
          visibleTabs.some(
            tab =>
              tab.id === requestedTabId &&
              tab.disabled !== true
          )
        ) {
          this.internalActiveTabId.set(
            requestedTabId
          );

          return;
        }

        const currentTabId =
          this.internalActiveTabId();

        const currentTabIsValid =
          currentTabId !== null &&
          visibleTabs.some(
            tab =>
              tab.id === currentTabId &&
              tab.disabled !== true
          );

        if (currentTabIsValid) {
          return;
        }

        this.internalActiveTabId.set(
          visibleTabs.find(
            tab => tab.disabled !== true
          )?.id ?? null
        );
      },
      {
        allowSignalWrites: true
      }
    );
  }

  selectTab(
    tab: DetailSectionTab
  ): void {
    if (
      tab.disabled === true ||
      tab.loading === true
    ) {
      return;
    }

    const previousTabId =
      this.resolvedActiveTabId();

    if (previousTabId === tab.id) {
      return;
    }

    this.internalActiveTabId.set(
      tab.id
    );

    this.activeTabChange.emit({
      previousTabId,
      tabId: tab.id,
      tab
    });
  }

  isActive(
    tab: DetailSectionTab
  ): boolean {
    return (
      this.resolvedActiveTabId() ===
      tab.id
    );
  }

  tabClasses(
    tab: DetailSectionTab
  ): Record<string, boolean> {
    return {
      'to-detail-section-tabs__tab--active':
        this.isActive(tab),

      'to-detail-section-tabs__tab--disabled':
        tab.disabled === true,

      'to-detail-section-tabs__tab--loading':
        tab.loading === true,

      [`to-detail-section-tabs__tab--${
        tab.tone ?? 'primary'
      }`]: true
    };
  }

  displayBadge(
    tab: DetailSectionTab
  ): string | null {
    if (
      tab.badge !== null &&
      tab.badge !== undefined &&
      tab.badge !== ''
    ) {
      return String(tab.badge);
    }

    if (
      tab.count !== null &&
      tab.count !== undefined
    ) {
      return String(tab.count);
    }

    return null;
  }

  hasBadge(
    tab: DetailSectionTab
  ): boolean {
    return this.displayBadge(tab) !== null;
  }

  handleKeydown(
    event: KeyboardEvent,
    currentTab: DetailSectionTab
  ): void {
    const selectableTabs =
      this.visibleTabs().filter(
        tab =>
          tab.disabled !== true &&
          tab.loading !== true
      );

    const currentIndex =
      selectableTabs.findIndex(
        tab => tab.id === currentTab.id
      );

    if (currentIndex < 0) {
      return;
    }

    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex =
          currentIndex ===
          selectableTabs.length - 1
            ? 0
            : currentIndex + 1;
        break;

      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex =
          currentIndex === 0
            ? selectableTabs.length - 1
            : currentIndex - 1;
        break;

      case 'Home':
        nextIndex = 0;
        break;

      case 'End':
        nextIndex =
          selectableTabs.length - 1;
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectTab(currentTab);
        return;

      default:
        return;
    }

    event.preventDefault();

    const nextTab =
      selectableTabs[nextIndex];

    this.selectTab(nextTab);

    queueMicrotask(() => {
      const element =
        document.querySelector<
          HTMLButtonElement
        >(
          `[data-detail-tab-id="${nextTab.id}"]`
        );

      element?.focus();
    });
  }
}