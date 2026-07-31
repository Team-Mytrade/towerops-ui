import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { BaseComponent } from '../../../core/base/base.component';
import { AuthService } from '../../../core/auth/auth.service';
import { TechnicianStatus } from '../../../core/models/application.enums';
import {
  Technician,
  TechnicianPayload
} from '../../technician/models/technician.models';
import {
  TechnicianService
} from '../../technician/services/technician.service';
import { Site } from '../sites/models/site.models';
import { SiteService } from '../sites/services/site.service';
import { TenantUser } from '../users/user.models';
import { UserService } from '../users/user.service';

type TechnicianDraft = TechnicianPayload & { id?: number };

@Component({
  selector: 'to-technicians-page',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    CheckboxModule,
    ConfirmDialogModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TagModule
  ],
  providers: [ConfirmationService],
  templateUrl: './technicians-page.html',
  styleUrl: './technicians-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TechniciansPageComponent extends BaseComponent {
  private readonly service = inject(TechnicianService);
  private readonly siteService = inject(SiteService);
  private readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);
  private readonly confirmation = inject(ConfirmationService);

  readonly technicians = signal<Technician[]>([]);
  readonly sites = signal<Site[]>([]);
  readonly users = signal<TenantUser[]>([]);
  readonly search = signal('');
  readonly statusFilter = signal<TechnicianStatus | null>(null);
  readonly enabledFilter = signal<boolean | null>(null);
  readonly editorOpen = signal(false);
  readonly saving = signal(false);
  readonly draft = signal<TechnicianDraft>(this.emptyDraft());

  readonly statusOptions: { label: string; value: TechnicianStatus }[] = [
    'AVAILABLE',
    'ASSIGNED',
    'ON_DUTY',
    'OFF_DUTY',
    'ON_SITE',
    'TRAVELLING',
    'ON_LEAVE',
    'INACTIVE'
  ].map(value => ({
    label: this.formatEnum(value),
    value: value as TechnicianStatus
  }));

  readonly enabledOptions = [
    { label: 'Enabled', value: true },
    { label: 'Disabled', value: false }
  ];

  readonly siteOptions = computed(() =>
    this.sites().filter(site => site.enabled).map(site => ({
      label: `${site.siteName} (${site.siteCode})`,
      value: site.siteCode
    }))
  );

  readonly userOptions = computed(() =>
    this.users().filter(user =>
      user.enabled &&
      user.active &&
      user.userType === 'TECHNICIAN'
    ).map(user => ({
      label: `${user.username} · ${user.email}`,
      value: user.id
    }))
  );

  readonly filtered = computed(() => {
    const query = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    const enabled = this.enabledFilter();

    return this.technicians().filter(item => {
      const text = [
        item.technicianCode,
        item.firstName,
        item.lastName,
        item.email,
        item.siteCode,
        item.department,
        item.skillSet
      ].join(' ').toLowerCase();

      return (!query || text.includes(query)) &&
        (!status || item.status === status) &&
        (enabled === null || item.enabled === enabled);
    });
  });

  readonly availableCount = computed(() =>
    this.technicians().filter(item => item.status === 'AVAILABLE').length
  );
  readonly assignedCount = computed(() =>
    this.technicians().filter(item =>
      ['ASSIGNED', 'ON_DUTY', 'ON_SITE', 'TRAVELLING'].includes(item.status)
    ).length
  );
  readonly enabledCount = computed(() =>
    this.technicians().filter(item => item.enabled).length
  );

  constructor() {
    super();
    this.activatedRoute.queryParamMap
      .pipe(this.untilDestroyed())
      .subscribe(params => {
        const mode = params.get('mode');
        const id = Number(params.get('technicianId'));

        if (mode === 'create') {
          this.draft.set(this.emptyDraft());
          this.editorOpen.set(true);
          return;
        }

        if (mode === 'edit' && Number.isInteger(id) && id > 0) {
          const technician = this.technicians().find(item => item.id === id);
          if (technician) {
            this.setEditDraft(technician);
          } else {
            this.loadForEdit(id);
          }
          return;
        }

        this.editorOpen.set(false);
      });
    this.load();
    this.loadLookups();
  }

  load(): void {
    this.startLoading();
    this.clearPageError();
    this.service.getTechnicians()
      .pipe(this.untilDestroyed(), finalize(() => this.stopLoading()))
      .subscribe({
        next: response => this.technicians.set(response.data ?? []),
        error: error => this.setPageError(error, 'Unable to load technicians.')
      });
  }

  create(): void {
    void this.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { mode: 'create' }
    });
  }

  edit(item: Technician): void {
    void this.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        mode: 'edit',
        technicianId: item.id
      }
    });
  }

  closeEditor(): void {
    if (!this.saving()) {
      void this.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: {}
      });
    }
  }

  save(): void {
    const draft = this.draft();
    if (!draft.technicianCode.trim() ||
        !draft.firstName.trim() ||
        !draft.lastName.trim()) {
      this.toast.warning('Technician code, first name and last name are required.');
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
        this.technicians.update(items => {
          const index = items.findIndex(item => item.id === response.data.id);
          return index < 0
            ? [response.data, ...items]
            : items.map(item => item.id === response.data.id ? response.data : item);
        });
        this.closeEditor();
        this.toast.success(id ? 'Technician updated.' : 'Technician created.');
      },
      error: error => this.showError(error, 'Unable to save the technician.')
    });
  }

  confirmDelete(item: Technician): void {
    this.confirmation.confirm({
      header: 'Delete technician',
      message: `Delete ${item.firstName} ${item.lastName}? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.delete(item)
    });
  }

  clearFilters(): void {
    this.search.set('');
    this.statusFilter.set(null);
    this.enabledFilter.set(null);
  }

  setDraft<K extends keyof TechnicianDraft>(
    key: K,
    value: TechnicianDraft[K]
  ): void {
    this.draft.update(current => ({ ...current, [key]: value }));
  }

  selectUser(userId: number | null): void {
    if (!userId) {
      this.setDraft('userId', 0);
      return;
    }

    const user = this.users().find(item => item.id === userId);
    if (!user) {
      return;
    }

    const nameParts = user.username
      .replace(/[._-]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const firstName = nameParts.shift() ?? '';
    const lastName = nameParts.join(' ');

    this.draft.update(current => ({
      ...current,
      userId: user.id,
      technicianCode: user.userCode || current.technicianCode,
      firstName: firstName || current.firstName,
      lastName: lastName || current.lastName,
      email: user.email || current.email,
      phoneNumber: user.phoneNumber || current.phoneNumber
    }));
  }

  statusSeverity(status: TechnicianStatus):
    'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    if (status === 'AVAILABLE') return 'success';
    if (['ASSIGNED', 'ON_DUTY', 'ON_SITE', 'TRAVELLING'].includes(status)) {
      return 'info';
    }
    if (status === 'ON_LEAVE') return 'warn';
    if (status === 'INACTIVE') return 'danger';
    return 'secondary';
  }

  formatEnum(value: string): string {
    return value.toLowerCase().split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private delete(item: Technician): void {
    this.service.delete(item.id).pipe(this.untilDestroyed()).subscribe({
      next: () => {
        this.technicians.update(items =>
          items.filter(candidate => candidate.id !== item.id)
        );
        this.toast.success('Technician deleted.');
      },
      error: error => this.showError(error, 'Unable to delete the technician.')
    });
  }

  private setEditDraft(item: Technician): void {
    const { id, username: _username, ...payload } = item;
    this.draft.set({ id, ...payload });
    this.editorOpen.set(true);
  }

  private loadForEdit(id: number): void {
    this.startLoading();
    this.service.getById(id)
      .pipe(this.untilDestroyed(), finalize(() => this.stopLoading()))
      .subscribe({
        next: response => this.setEditDraft(response.data),
        error: error => {
          this.showError(error, 'Unable to load the technician for editing.');
          this.closeEditor();
        }
      });
  }

  private emptyDraft(): TechnicianDraft {
    return {
      technicianCode: '',
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      designation: '',
      department: '',
      tenantId: this.auth.tenantId() ?? '',
      siteCode: '',
      status: 'AVAILABLE',
      enabled: true,
      skillSet: '',
      remarks: '',
      userId: 0
    };
  }

  private loadLookups(): void {
    forkJoin({
      sites: this.siteService.getSites({ enabled: true, size: 500 }),
      users: this.userService.getUsers()
    }).pipe(this.untilDestroyed()).subscribe({
      next: response => {
        this.sites.set(response.sites.data ?? []);
        this.users.set(response.users.data ?? []);
      },
      error: error => this.showError(
        error,
        'Unable to load site and user choices.'
      )
    });
  }
}
