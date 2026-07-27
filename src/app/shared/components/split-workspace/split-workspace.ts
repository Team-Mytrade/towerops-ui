import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  PLATFORM_ID,
  signal
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser,
  NgClass
} from '@angular/common';

import {
  ButtonModule
} from 'primeng/button';

import {
  ProgressSpinnerModule
} from 'primeng/progressspinner';

import {
  SplitterModule
} from 'primeng/splitter';

import {
  TooltipModule
} from 'primeng/tooltip';

import type {
  SplitWorkspaceCollapseEvent,
  SplitWorkspaceFullscreenEvent,
  SplitWorkspaceLayout,
  SplitWorkspaceMobileView,
  SplitWorkspaceMobileViewEvent,
  SplitWorkspaceResizeEvent
} from './split-workspace.models';
import type {
  SplitterResizeEndEvent
} from 'primeng/splitter';

@Component({
  selector: 'to-split-workspace',
  standalone: true,
  imports: [
    NgClass,
    ButtonModule,
    ProgressSpinnerModule,
    SplitterModule,
    TooltipModule,
    CommonModule
  ],
  templateUrl: './split-workspace.html',
  styleUrl: './split-workspace.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class SplitWorkspaceComponent {
  private readonly platformId =
    inject(PLATFORM_ID);

  readonly initialPanelSizes =
    input<[number, number]>([34, 66]);

  readonly minimumPanelSizes =
    input<[number, number]>([24, 35]);

  readonly leftCollapsed =
    input(false);

  readonly rightCollapsed =
    input(false);

  readonly fullscreen =
    input(false);

  readonly loading =
    input(false);

  readonly detailAvailable =
    input(false);

  readonly disabled =
    input(false);

  readonly showDivider =
    input(true);

  readonly showCollapseControls =
    input(true);

  readonly showFullscreenControl =
    input(true);

  readonly showMobileBack =
    input(true);

  readonly persist =
    input(true);

  readonly persistKey =
    input<string | null>(null);

  readonly gutterSize =
    input(6);

  readonly mobileBreakpoint =
    input(900);

  readonly emptyIcon =
    input('pi pi-cursor');

  readonly emptyTitle =
    input('Select a record');

  readonly emptyMessage =
    input(
      'Choose an item from the list to view its details.'
    );

  readonly loadingLabel =
    input('Loading workspace');

  readonly leftAriaLabel =
    input('Records');

  readonly rightAriaLabel =
    input('Record details');

  readonly dataTestId =
    input('split-workspace');

  readonly panelSizesChange =
    output<SplitWorkspaceResizeEvent>();

  readonly leftCollapsedChange =
    output<boolean>();

  readonly rightCollapsedChange =
    output<boolean>();

  readonly collapseChanged =
    output<SplitWorkspaceCollapseEvent>();

  readonly fullscreenChange =
    output<boolean>();

  readonly fullscreenChanged =
    output<SplitWorkspaceFullscreenEvent>();

  readonly mobileViewChange =
    output<SplitWorkspaceMobileView>();

  readonly mobileViewChanged =
    output<SplitWorkspaceMobileViewEvent>();

  readonly panelSizes =
    signal<[number, number]>([34, 66]);

  readonly mobileView =
    signal<SplitWorkspaceMobileView>(
      'left'
    );

  readonly viewportWidth =
    signal<number>(Number.MAX_SAFE_INTEGER);

  readonly isMobile =
    computed(
      () =>
        this.viewportWidth() <=
        this.mobileBreakpoint()
    );

  readonly resolvedLayout =
    computed<SplitWorkspaceLayout>(
      () =>
        this.isMobile()
          ? 'vertical'
          : 'horizontal'
    );

  readonly effectivePanelSizes =
    computed<[number, number]>(() => {
      if (this.fullscreen()) {
        return [0, 100];
      }

      if (this.leftCollapsed()) {
        return [0, 100];
      }

      if (this.rightCollapsed()) {
        return [100, 0];
      }

      return this.panelSizes();
    });

  readonly showLeftPanel =
    computed(() => {
      if (this.fullscreen()) {
        return false;
      }

      if (this.isMobile()) {
        return this.mobileView() === 'left';
      }

      return !this.leftCollapsed();
    });

  readonly showRightPanel =
    computed(() => {
      if (this.isMobile()) {
        return this.mobileView() === 'right';
      }

      return !this.rightCollapsed();
    });

  readonly workspaceClasses =
    computed<Record<string, boolean>>(
      () => ({
        'to-split-workspace--mobile':
          this.isMobile(),

        'to-split-workspace--fullscreen':
          this.fullscreen(),

        'to-split-workspace--left-collapsed':
          this.leftCollapsed(),

        'to-split-workspace--right-collapsed':
          this.rightCollapsed(),

        'to-split-workspace--disabled':
          this.disabled(),

        'to-split-workspace--without-divider':
          !this.showDivider()
      })
    );

  constructor() {
    this.restorePanelSizes();
    this.observeViewport();

    effect(() => {
      const initial =
        this.normalisePanelSizes(
          this.initialPanelSizes()
        );

      if (!this.hasPersistedSizes()) {
        this.panelSizes.set(initial);
      }
    });

    effect(() => {
      if (
        this.isMobile() &&
        !this.detailAvailable() &&
        this.mobileView() === 'right'
      ) {
        this.mobileView.set('left');
      }
    });
  }

handleResizeEnd(
  event: SplitterResizeEndEvent
): void {
  const sizes =
    this.normalisePanelSizes(
      event.sizes ??
        this.panelSizes()
    );

  this.panelSizes.set(sizes);
  this.persistPanelSizes(sizes);

  this.panelSizesChange.emit({
    sizes,
    leftSize: sizes[0],
    rightSize: sizes[1]
  });
}

  toggleLeftPanel(): void {
    if (this.disabled()) {
      return;
    }

    const collapsed =
      !this.leftCollapsed();

    this.leftCollapsedChange.emit(
      collapsed
    );

    this.collapseChanged.emit({
      panel: 'left',
      collapsed
    });
  }

  toggleRightPanel(): void {
    if (this.disabled()) {
      return;
    }

    const collapsed =
      !this.rightCollapsed();

    this.rightCollapsedChange.emit(
      collapsed
    );

    this.collapseChanged.emit({
      panel: 'right',
      collapsed
    });
  }

  toggleFullscreen(): void {
    if (this.disabled()) {
      return;
    }

    const fullscreen =
      !this.fullscreen();

    this.fullscreenChange.emit(
      fullscreen
    );

    this.fullscreenChanged.emit({
      fullscreen
    });
  }

  openMobileDetail(): void {
    if (
      this.disabled() ||
      !this.detailAvailable()
    ) {
      return;
    }

    this.setMobileView('right');
  }

  openMobileList(): void {
    if (this.disabled()) {
      return;
    }

    this.setMobileView('left');
  }

  resetPanelSizes(): void {
    const sizes =
      this.normalisePanelSizes(
        this.initialPanelSizes()
      );

    this.panelSizes.set(sizes);
    this.persistPanelSizes(sizes);

    this.panelSizesChange.emit({
      sizes,
      leftSize: sizes[0],
      rightSize: sizes[1]
    });
  }

  private setMobileView(
    view: SplitWorkspaceMobileView
  ): void {
    this.mobileView.set(view);
    this.mobileViewChange.emit(view);
    this.mobileViewChanged.emit({
      view
    });
  }

private normalisePanelSizes(
  sizes: readonly (
    string | number
  )[]
): [number, number] {
  const parsedLeft =
    Number(sizes[0]);

  const parsedRight =
    Number(sizes[1]);

  const left =
    Number.isFinite(parsedLeft)
      ? Math.max(
          0,
          Math.min(
            100,
            parsedLeft
          )
        )
      : 34;

  const right =
    Number.isFinite(parsedRight)
      ? Math.max(
          0,
          Math.min(
            100,
            parsedRight
          )
        )
      : 100 - left;

  const total =
    left + right;

  if (total <= 0) {
    return [34, 66];
  }

  return [
    Number(
      (
        (left / total) *
        100
      ).toFixed(2)
    ),
    Number(
      (
        (right / total) *
        100
      ).toFixed(2)
    )
  ];
}

  private restorePanelSizes(): void {
    if (
      !this.isBrowser() ||
      !this.persist()
    ) {
      this.panelSizes.set(
        this.normalisePanelSizes(
          this.initialPanelSizes()
        )
      );

      return;
    }

    const key =
      this.resolvedPersistKey();

    if (!key) {
      return;
    }

    try {
      const stored =
        localStorage.getItem(key);

      if (!stored) {
        return;
      }

      const parsed: unknown =
        JSON.parse(stored);

      if (
        Array.isArray(parsed) &&
        parsed.length === 2 &&
        parsed.every(
          value =>
            typeof value === 'number'
        )
      ) {
        this.panelSizes.set(
          this.normalisePanelSizes(
            parsed
          )
        );
      }
    } catch {
      this.panelSizes.set(
        this.normalisePanelSizes(
          this.initialPanelSizes()
        )
      );
    }
  }

  private persistPanelSizes(
    sizes: [number, number]
  ): void {
    if (
      !this.isBrowser() ||
      !this.persist()
    ) {
      return;
    }

    const key =
      this.resolvedPersistKey();

    if (!key) {
      return;
    }

    try {
      localStorage.setItem(
        key,
        JSON.stringify(sizes)
      );
    } catch {
      // Storage may be unavailable.
    }
  }

  private hasPersistedSizes(): boolean {
    if (
      !this.isBrowser() ||
      !this.persist()
    ) {
      return false;
    }

    const key =
      this.resolvedPersistKey();

    return key
      ? localStorage.getItem(key) !==
          null
      : false;
  }

  private resolvedPersistKey():
    | string
    | null {
    const key =
      this.persistKey()?.trim();

    return key
      ? `towerops:split-workspace:${key}`
      : null;
  }

  private observeViewport(): void {
    if (!this.isBrowser()) {
      return;
    }

    const updateViewport = (): void => {
      this.viewportWidth.set(
        window.innerWidth
      );
    };

    updateViewport();

    window.addEventListener(
      'resize',
      updateViewport,
      {
        passive: true
      }
    );
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(
      this.platformId
    );
  }
}