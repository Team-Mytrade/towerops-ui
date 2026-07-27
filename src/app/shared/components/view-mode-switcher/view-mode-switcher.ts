import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
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
  SelectButtonModule
} from 'primeng/selectbutton';

import {
  SelectModule
} from 'primeng/select';

import {
  TooltipModule
} from 'primeng/tooltip';

import type {
  ViewDensity,
  ViewDensityChangeEvent,
  ViewModeChangeEvent,
  ViewModeId,
  ViewModeOption,
  ViewModeRefreshEvent
} from './view-mode-switcher.models';

interface DensityOption {
  label: string;
  value: ViewDensity;
  icon: string;
}

@Component({
  selector: 'to-view-mode-switcher',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
    ButtonModule,
    SelectButtonModule,
    SelectModule,
    TooltipModule
  ],
  templateUrl:
    './view-mode-switcher.html',
  styleUrl:
    './view-mode-switcher.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class ViewModeSwitcherComponent {
  @ViewChildren(
    'modeButton',
    {
      read: ElementRef
    }
  )
  private readonly modeButtons?: QueryList<
    ElementRef<HTMLButtonElement>
  >;

  readonly modes =
    input<ViewModeOption[]>([
      {
        id: 'LIST',
        label: 'List',
        icon: 'pi pi-list'
      },
      {
        id: 'GRID',
        label: 'Grid',
        icon: 'pi pi-th-large'
      }
    ]);

  readonly activeMode =
    input<ViewModeId | null>('LIST');

  readonly density =
    input<ViewDensity>(
      'COMFORTABLE'
    );

  readonly loading =
    input(false);

  readonly disabled =
    input(false);

  readonly compact =
    input(false);

  readonly iconOnly =
    input(false);

  readonly showLabels =
    input(true);

  readonly showCounts =
    input(false);

  readonly showDensity =
    input(false);

  readonly showRefresh =
    input(false);

  readonly refreshLoading =
    input(false);

  readonly refreshLabel =
    input('Refresh');

  readonly densityLabel =
    input('Density');

  readonly ariaLabel =
    input('View mode');

  readonly dataTestId =
    input('view-mode-switcher');

  readonly modeChange =
    output<ViewModeId>();

  readonly modeChanged =
    output<ViewModeChangeEvent>();

  readonly densityChange =
    output<ViewDensity>();

  readonly densityChanged =
    output<ViewDensityChangeEvent>();

  readonly refreshRequested =
    output<ViewModeRefreshEvent>();

  readonly visibleModes =
    computed(() =>
      this.modes().filter(
        mode =>
          mode.visible !== false
      )
    );

  readonly activeOption =
    computed<ViewModeOption | null>(
      () => {
        const activeMode =
          this.activeMode();

        if (activeMode === null) {
          return null;
        }

        return (
          this.visibleModes().find(
            mode =>
              mode.id === activeMode
          ) ?? null
        );
      }
    );

  readonly densityOptions =
    computed<DensityOption[]>(() => [
      {
        label: 'Compact',
        value: 'COMPACT',
        icon: 'pi pi-align-justify'
      },
      {
        label: 'Comfortable',
        value: 'COMFORTABLE',
        icon: 'pi pi-bars'
      },
      {
        label: 'Spacious',
        value: 'SPACIOUS',
        icon: 'pi pi-pause'
      }
    ]);

  readonly componentClasses =
    computed<
      Record<string, boolean>
    >(() => ({
      'to-view-mode-switcher--compact':
        this.compact(),

      'to-view-mode-switcher--icon-only':
        this.iconOnly(),

      'to-view-mode-switcher--loading':
        this.loading(),

      'to-view-mode-switcher--disabled':
        this.disabled()
    }));

  selectMode(
    option: ViewModeOption
  ): void {
    if (
      this.isInteractionDisabled() ||
      option.disabled === true ||
      option.id === this.activeMode()
    ) {
      return;
    }

    const previousMode =
      this.activeMode();

    this.modeChange.emit(
      option.id
    );

    this.modeChanged.emit({
      previousMode,
      mode: option.id,
      option
    });
  }

  selectDensity(
    density:
      | ViewDensity
      | null
      | undefined
  ): void {
    if (
      this.isInteractionDisabled() ||
      !density ||
      density === this.density()
    ) {
      return;
    }

    const previousDensity =
      this.density();

    this.densityChange.emit(
      density
    );

    this.densityChanged.emit({
      previousDensity,
      density
    });
  }

  requestRefresh(): void {
    if (
      this.isInteractionDisabled() ||
      this.refreshLoading()
    ) {
      return;
    }

    this.refreshRequested.emit({
      mode: this.activeMode()
    });
  }

  handleModeKeydown(
    event: KeyboardEvent,
    index: number
  ): void {
    if (
      this.isInteractionDisabled()
    ) {
      return;
    }

    const modes =
      this.visibleModes();

    if (!modes.length) {
      return;
    }

    let targetIndex =
      index;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        targetIndex =
          this.findNextEnabledIndex(
            index,
            1
          );
        break;

      case 'ArrowLeft':
      case 'ArrowUp':
        targetIndex =
          this.findNextEnabledIndex(
            index,
            -1
          );
        break;

      case 'Home':
        targetIndex =
          this.findFirstEnabledIndex();
        break;

      case 'End':
        targetIndex =
          this.findLastEnabledIndex();
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectMode(
          modes[index]
        );
        return;

      default:
        return;
    }

    event.preventDefault();

    if (targetIndex < 0) {
      return;
    }

    this.focusModeButton(
      targetIndex
    );
  }

  isActive(
    mode: ViewModeOption
  ): boolean {
    return (
      mode.id ===
      this.activeMode()
    );
  }

  modeIcon(
    mode: ViewModeOption
  ): string {
    if (mode.icon) {
      return mode.icon;
    }

    switch (mode.id) {
      case 'TABLE':
        return 'pi pi-table';

      case 'GRID':
        return 'pi pi-th-large';

      case 'MAP':
        return 'pi pi-map';

      case 'BOARD':
        return 'pi pi-objects-column';

      case 'TIMELINE':
        return 'pi pi-clock';

      case 'LIST':
      default:
        return 'pi pi-list';
    }
  }

  modeTooltip(
    mode: ViewModeOption
  ): string {
    return (
      mode.tooltip ??
      mode.description ??
      mode.label
    );
  }

  modeCount(
    mode: ViewModeOption
  ): string | null {
    if (
      mode.count === null ||
      mode.count === undefined
    ) {
      return null;
    }

    return String(mode.count);
  }

  modeBadge(
    mode: ViewModeOption
  ): string | null {
    if (
      mode.badge === null ||
      mode.badge === undefined ||
      mode.badge === ''
    ) {
      return null;
    }

    return String(mode.badge);
  }

  private findNextEnabledIndex(
    currentIndex: number,
    direction: 1 | -1
  ): number {
    const modes =
      this.visibleModes();

    if (!modes.length) {
      return -1;
    }

    let index =
      currentIndex;

    for (
      let attempt = 0;
      attempt < modes.length;
      attempt += 1
    ) {
      index =
        (
          index +
          direction +
          modes.length
        ) %
        modes.length;

      if (
        modes[index]?.disabled !== true
      ) {
        return index;
      }
    }

    return -1;
  }

  private findFirstEnabledIndex():
    number {
    return this.visibleModes().findIndex(
      mode =>
        mode.disabled !== true
    );
  }

  private findLastEnabledIndex():
    number {
    const modes =
      this.visibleModes();

    for (
      let index =
        modes.length - 1;
      index >= 0;
      index -= 1
    ) {
      if (
        modes[index]?.disabled !== true
      ) {
        return index;
      }
    }

    return -1;
  }

  private focusModeButton(
    index: number
  ): void {
    const button =
      this.modeButtons
        ?.get(index)
        ?.nativeElement;

    button?.focus();
  }

  private isInteractionDisabled():
    boolean {
    return (
      this.disabled() ||
      this.loading()
    );
  }
}