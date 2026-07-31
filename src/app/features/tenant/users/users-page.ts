import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Country, State } from 'country-state-city';

import { BaseComponent } from '../../../core/base/base.component';
import { UserType } from '../../../core/models/application.enums';
import { TenantUser, UserPayload } from './user.models';
import { UserService } from './user.service';

type UserDraft = UserPayload & { id?: number };

@Component({
  selector: 'to-users-page',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    CheckboxModule,
    ConfirmDialogModule,
    InputTextModule,
    PasswordModule,
    SelectModule,
    TableModule,
    TagModule
  ],
  providers: [ConfirmationService],
  templateUrl: './users-page.html',
  styleUrl: './users-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersPageComponent extends BaseComponent {
  private readonly service = inject(UserService);
  private readonly confirmation = inject(ConfirmationService);

  readonly users = signal<TenantUser[]>([]);
  readonly search = signal('');
  readonly typeFilter = signal<UserType | null>(null);
  readonly enabledFilter = signal<boolean | null>(null);
  readonly formOpen = signal(false);
  readonly saving = signal(false);
  readonly draft = signal<UserDraft>(this.emptyDraft());

  readonly typeOptions: { label: string; value: UserType }[] = [
    { label: 'Tenant Admin', value: 'TENANT_ADMIN' },
    { label: 'Admin', value: 'ADMIN' },
    { label: 'Technician', value: 'TECHNICIAN' },
    { label: 'Customer', value: 'CUSTOMER' }
  ];
  readonly enabledOptions = [
    { label: 'Enabled', value: true },
    { label: 'Disabled', value: false }
  ];

  readonly countryOptions = Country.getAllCountries().map(country => ({
    label: country.name,
    value: country.name,
    isoCode: country.isoCode
  }));

  readonly stateOptions = computed(() => {
    const countryName = this.draft().address.country;
    const country = this.countryOptions.find(
      option => option.value === countryName
    );

    return country
      ? State.getStatesOfCountry(country.isoCode).map(state => ({
          label: state.name,
          value: state.name
        }))
      : [];
  });

  readonly filtered = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.users().filter(user =>
      (!query || [
        user.userCode,
        user.username,
        user.email,
        user.phoneNumber
      ].join(' ').toLowerCase().includes(query)) &&
      (!this.typeFilter() || user.userType === this.typeFilter()) &&
      (this.enabledFilter() === null ||
        user.enabled === this.enabledFilter())
    );
  });

  readonly activeCount = computed(() =>
    this.users().filter(user => user.active).length
  );
  readonly enabledCount = computed(() =>
    this.users().filter(user => user.enabled).length
  );
  readonly technicianCount = computed(() =>
    this.users().filter(user => user.userType === 'TECHNICIAN').length
  );

  constructor() {
    super();
    this.activatedRoute.queryParamMap
      .pipe(this.untilDestroyed())
      .subscribe(params => {
        const mode = params.get('mode');
        const id = Number(params.get('userId'));
        if (mode === 'create') {
          this.draft.set(this.emptyDraft());
          this.formOpen.set(true);
        } else if (mode === 'edit' && Number.isInteger(id) && id > 0) {
          const user = this.users().find(item => item.id === id);
          user ? this.setEditDraft(user) : this.loadForEdit(id);
        } else {
          this.formOpen.set(false);
        }
      });
    this.load();
  }

  load(): void {
    this.startLoading();
    this.clearPageError();
    this.service.getUsers()
      .pipe(this.untilDestroyed(), finalize(() => this.stopLoading()))
      .subscribe({
        next: response => this.users.set(response.data ?? []),
        error: error => this.setPageError(error, 'Unable to load users.')
      });
  }

  create(): void {
    void this.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { mode: 'create' }
    });
  }

  edit(user: TenantUser): void {
    void this.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { mode: 'edit', userId: user.id }
    });
  }

  closeForm(): void {
    if (!this.saving()) {
      void this.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: {}
      });
    }
  }

  setDraft<K extends keyof UserDraft>(key: K, value: UserDraft[K]): void {
    this.draft.update(current => ({ ...current, [key]: value }));
  }

  setAddress(key: keyof UserDraft['address'], value: string): void {
    this.draft.update(current => ({
      ...current,
      address: { ...current.address, [key]: value }
    }));
  }

  setCountry(country: string | null): void {
    this.draft.update(current => ({
      ...current,
      address: {
        ...current.address,
        country: country ?? '',
        state: ''
      }
    }));
  }

  save(): void {
    const draft = this.draft();
    if (!draft.userCode.trim() || !draft.username.trim() ||
        !draft.email.trim() || (!draft.id && !draft.password)) {
      this.toast.warning(
        'User code, username and email are required. New users also need a password.'
      );
      return;
    }
    const { id, ...payload } = draft;
    this.saving.set(true);
    const request = id
      ? this.service.update(id, payload)
      : this.service.create(payload);
    request.pipe(
      this.untilDestroyed(),
      finalize(() => this.saving.set(false))
    ).subscribe({
      next: response => {
        this.users.update(users => users.some(user => user.id === response.data.id)
          ? users.map(user => user.id === response.data.id ? response.data : user)
          : [response.data, ...users]);
        this.closeForm();
        this.toast.success(id ? 'User updated.' : 'User created.');
      },
      error: error => this.showError(error, 'Unable to save the user.')
    });
  }

  confirmDelete(user: TenantUser): void {
    this.confirmation.confirm({
      header: 'Delete user',
      message: `Delete ${user.username}? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.delete(user)
    });
  }

  clearFilters(): void {
    this.search.set('');
    this.typeFilter.set(null);
    this.enabledFilter.set(null);
  }

  formatType(type: string): string {
    return type.toLowerCase().split('_')
      .map(value => value.charAt(0).toUpperCase() + value.slice(1)).join(' ');
  }

  private setEditDraft(user: TenantUser): void {
    const { id, active: _active, ...value } = user;
    this.draft.set({ id, ...value, password: '' });
    this.formOpen.set(true);
  }

  private loadForEdit(id: number): void {
    this.service.getById(id).pipe(this.untilDestroyed()).subscribe({
      next: response => this.setEditDraft(response.data),
      error: error => {
        this.showError(error, 'Unable to load the user for editing.');
        this.closeForm();
      }
    });
  }

  private delete(user: TenantUser): void {
    this.service.delete(user.id).pipe(this.untilDestroyed()).subscribe({
      next: () => {
        this.users.update(users => users.filter(item => item.id !== user.id));
        this.toast.success('User deleted.');
      },
      error: error => this.showError(error, 'Unable to delete the user.')
    });
  }

  private emptyDraft(): UserDraft {
    return {
      userCode: '',
      userType: 'TECHNICIAN',
      username: '',
      email: '',
      password: '',
      roleIds: [],
      enabled: true,
      phoneNumber: '',
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
      }
    };
  }
}
