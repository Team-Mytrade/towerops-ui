import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal
} from '@angular/core';

import { NgClass } from '@angular/common';

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
  InputTextModule
} from 'primeng/inputtext';

import {
  MenuModule
} from 'primeng/menu';

import {
  PopoverModule
} from 'primeng/popover';

import {
  SelectModule
} from 'primeng/select';

import {
  TextareaModule
} from 'primeng/textarea';

import {
  TooltipModule
} from 'primeng/tooltip';

import type {
  MenuItem
} from 'primeng/api';

import type {
  SavedViewCreateEvent,
  SavedViewDefaultEvent,
  SavedViewDeleteEvent,
  SavedViewDirtyStateEvent,
  SavedViewFavouriteEvent,
  SavedViewItem,
  SavedViewResetEvent,
  SavedViewScope,
  SavedViewSelectEvent,
  SavedViewUpdateEvent
} from './saved-view-selector.models';

interface SavedViewOption<
  TState = Record<string, unknown>
> {
  label: string;
  value: string;
  view: SavedViewItem<TState>;
}

@Component({
  selector: 'to-saved-view-selector',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    MenuModule,
    PopoverModule,
    SelectModule,
    TextareaModule,
    TooltipModule
  ],
  templateUrl:
    './saved-view-selector.html',
  styleUrl:
    './saved-view-selector.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class SavedViewSelectorComponent<
  TState = Record<string, unknown>
> {
  readonly views =
    input<SavedViewItem<TState>[]>([]);

  readonly activeViewId =
    input<string | null>(null);

  readonly currentState =
    input<TState>(
      {} as TState
    );

  readonly dirty =
    input(false);

  readonly loading =
    input(false);

  readonly saving =
    input(false);

  readonly disabled =
    input(false);

  readonly compact =
    input(false);

  readonly allowCreate =
    input(true);

  readonly allowUpdate =
    input(true);

  readonly allowDelete =
    input(true);

  readonly allowFavourite =
    input(true);

  readonly allowSetDefault =
    input(true);

  readonly allowSharedViews =
    input(false);

  readonly showReset =
    input(true);

  readonly showDirtyIndicator =
    input(true);

  readonly selectorPlaceholder =
    input('Select view');

  readonly createLabel =
    input('Save view');

  readonly updateLabel =
    input('Update view');

  readonly resetLabel =
    input('Reset changes');

  readonly dataTestId =
    input('saved-view-selector');

  readonly activeViewChange =
    output<string>();

  readonly viewSelected =
    output<SavedViewSelectEvent<TState>>();

  readonly createRequested =
    output<SavedViewCreateEvent<TState>>();

  readonly updateRequested =
    output<SavedViewUpdateEvent<TState>>();

  readonly deleteRequested =
    output<SavedViewDeleteEvent<TState>>();

  readonly favouriteChanged =
    output<SavedViewFavouriteEvent<TState>>();

  readonly defaultRequested =
    output<SavedViewDefaultEvent<TState>>();

  readonly resetRequested =
    output<SavedViewResetEvent>();

  readonly dirtyStateChanged =
    output<SavedViewDirtyStateEvent>();

  readonly createViewOpen =
    signal(false);

  readonly draftName =
    signal('');

  readonly draftDescription =
    signal('');

  readonly draftScope =
    signal<SavedViewScope>('PRIVATE');

  readonly draftSetAsDefault =
    signal(false);

  readonly visibleViews =
    computed(() =>
      this.views().filter(
        view =>
          view.disabled !== true
      )
    );

  readonly orderedViews =
    computed(() =>
      [...this.visibleViews()].sort(
        (first, second) => {
          if (
            first.favourite !==
            second.favourite
          ) {
            return first.favourite
              ? -1
              : 1;
          }

          if (
            first.default !==
            second.default
          ) {
            return first.default
              ? -1
              : 1;
          }

          return first.name.localeCompare(
            second.name
          );
        }
      )
    );

  readonly selectorOptions =
    computed<
      SavedViewOption<TState>[]
    >(() =>
      this.orderedViews().map(
        view => ({
          label: view.name,
          value: view.id,
          view
        })
      )
    );

  readonly activeView =
    computed<
      SavedViewItem<TState> | null
    >(() => {
      const activeId =
        this.activeViewId();

      if (!activeId) {
        return null;
      }

      return (
        this.views().find(
          view =>
            view.id === activeId
        ) ?? null
      );
    });

  readonly canUpdate =
    computed(() => {
      const view =
        this.activeView();

      return Boolean(
        this.allowUpdate() &&
        view &&
        !view.readonly
      );
    });

  readonly canDelete =
    computed(() => {
      const view =
        this.activeView();

      return Boolean(
        this.allowDelete() &&
        view &&
        !view.readonly &&
        view.scope !== 'SYSTEM'
      );
    });

  readonly scopeOptions =
    computed(() => {
      const options: Array<{
        label: string;
        value: SavedViewScope;
        icon: string;
      }> = [
        {
          label: 'Private',
          value: 'PRIVATE',
          icon: 'pi pi-lock'
        }
      ];

      if (this.allowSharedViews()) {
        options.push({
          label: 'Shared',
          value: 'SHARED',
          icon: 'pi pi-users'
        });
      }

      return options;
    });

  readonly componentClasses =
    computed<
      Record<string, boolean>
    >(() => ({
      'to-saved-view-selector--compact':
        this.compact(),

      'to-saved-view-selector--dirty':
        this.dirty(),

      'to-saved-view-selector--loading':
        this.loading(),

      'to-saved-view-selector--disabled':
        this.disabled()
    }));

  readonly actionMenuItems =
    computed<MenuItem[]>(() => {
      const view =
        this.activeView();

      if (!view) {
        return [];
      }

      return [
        {
          label: this.updateLabel(),
          icon: 'pi pi-save',
          visible: this.canUpdate(),
          disabled:
            this.isInteractionDisabled() ||
            !this.dirty(),
          command: () =>
            this.requestUpdate()
        },
        {
          label: view.favourite
            ? 'Remove from favourites'
            : 'Add to favourites',
          icon: view.favourite
            ? 'pi pi-star-fill'
            : 'pi pi-star',
          visible:
            this.allowFavourite(),
          disabled:
            this.isInteractionDisabled(),
          command: () =>
            this.toggleFavourite()
        },
        {
          label: 'Set as default',
          icon: 'pi pi-home',
          visible:
            this.allowSetDefault() &&
            !view.default,
          disabled:
            this.isInteractionDisabled(),
          command: () =>
            this.setAsDefault()
        },
        {
          separator: true,
          visible: this.canDelete()
        },
        {
          label: 'Delete view',
          icon: 'pi pi-trash',
          visible: this.canDelete(),
          disabled:
            this.isInteractionDisabled(),
          command: () =>
            this.requestDelete()
        }
      ];
    });

  selectView(
    viewId:
      | string
      | null
      | undefined
  ): void {
    if (
      this.isInteractionDisabled() ||
      !viewId
    ) {
      return;
    }

    const view =
      this.views().find(
        item =>
          item.id === viewId
      );

    if (!view) {
      return;
    }

    const previousViewId =
      this.activeViewId();

    this.activeViewChange.emit(
      view.id
    );

    this.viewSelected.emit({
      previousViewId,
      viewId: view.id,
      view,
      state: view.state
    });

    this.dirtyStateChanged.emit({
      dirty: false,
      activeViewId: view.id
    });
  }

  openCreateView(): void {
    if (
      this.isInteractionDisabled() ||
      !this.allowCreate()
    ) {
      return;
    }

    this.resetDraft();
    this.createViewOpen.set(true);
  }

  closeCreateView(): void {
    if (this.saving()) {
      return;
    }

    this.createViewOpen.set(false);
    this.resetDraft();
  }

  submitCreateView(): void {
    if (
      this.isInteractionDisabled() ||
      !this.allowCreate()
    ) {
      return;
    }

    const name =
      this.draftName().trim();

    if (!name) {
      return;
    }

    this.createRequested.emit({
      name,
      description:
        this.draftDescription().trim(),
      scope: this.draftScope(),
      setAsDefault:
        this.draftSetAsDefault(),
      state: this.currentState()
    });
  }

  requestUpdate(): void {
    const view =
      this.activeView();

    if (
      this.isInteractionDisabled() ||
      !view ||
      !this.canUpdate()
    ) {
      return;
    }

    this.updateRequested.emit({
      viewId: view.id,
      view,
      state: this.currentState()
    });
  }

  requestDelete(): void {
    const view =
      this.activeView();

    if (
      this.isInteractionDisabled() ||
      !view ||
      !this.canDelete()
    ) {
      return;
    }

    this.deleteRequested.emit({
      viewId: view.id,
      view
    });
  }

  toggleFavourite(): void {
    const view =
      this.activeView();

    if (
      this.isInteractionDisabled() ||
      !view ||
      !this.allowFavourite()
    ) {
      return;
    }

    this.favouriteChanged.emit({
      viewId: view.id,
      view,
      favourite:
        !view.favourite
    });
  }

  setAsDefault(): void {
    const view =
      this.activeView();

    if (
      this.isInteractionDisabled() ||
      !view ||
      !this.allowSetDefault()
    ) {
      return;
    }

    this.defaultRequested.emit({
      viewId: view.id,
      view
    });
  }

  requestReset(): void {
    if (
      this.isInteractionDisabled() ||
      !this.showReset()
    ) {
      return;
    }

    this.resetRequested.emit({
      activeViewId:
        this.activeViewId()
    });

    this.dirtyStateChanged.emit({
      dirty: false,
      activeViewId:
        this.activeViewId()
    });
  }

  viewIcon(
    view: SavedViewItem<TState>
  ): string {
    if (view.icon) {
      return view.icon;
    }

    switch (view.scope) {
      case 'SHARED':
        return 'pi pi-users';

      case 'SYSTEM':
        return 'pi pi-shield';

      default:
        return 'pi pi-user';
    }
  }

  viewScopeLabel(
    view: SavedViewItem<TState>
  ): string {
    switch (view.scope) {
      case 'SHARED':
        return 'Shared view';

      case 'SYSTEM':
        return 'System view';

      default:
        return 'Private view';
    }
  }

  private resetDraft(): void {
    this.draftName.set('');
    this.draftDescription.set('');
    this.draftScope.set('PRIVATE');
    this.draftSetAsDefault.set(false);
  }

  private isInteractionDisabled():
    boolean {
    return (
      this.disabled() ||
      this.loading() ||
      this.saving()
    );
  }
}
