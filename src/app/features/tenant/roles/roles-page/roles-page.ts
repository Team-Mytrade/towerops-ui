import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { finalize } from 'rxjs';

import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';

import { BaseComponent } from '../../../../core/base/base.component';
import { Permission } from '../models/permission.models';
import { Role, RolePayload } from '../models/role.models';
import { PermissionService } from '../services/permission.service';
import { RoleService } from '../services/role.service';

@Component({
  selector: 'to-roles-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    ConfirmDialogModule,
    DialogModule,
    InputTextModule,
    MultiSelectModule,
    TableModule,
    TagModule,
    TextareaModule,
    TooltipModule
  ],
  providers: [ConfirmationService],
  templateUrl: './roles-page.html',
  styleUrl: './roles-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolesPageComponent extends BaseComponent {
  private readonly fb = inject(FormBuilder);
  private readonly roleService = inject(RoleService);
  private readonly permissionService = inject(PermissionService);
  private readonly confirmation = inject(ConfirmationService);

  readonly roles = signal<Role[]>([]);
  readonly permissions = signal<Permission[]>([]);
  readonly loadingPermissions = signal(false);
  readonly permissionCatalogReady = signal(false);
  readonly search = signal('');
  readonly dialogVisible = signal(false);
  readonly saving = signal(false);
  readonly loadingRole = signal(false);
  readonly editingRoleId = signal<number | null>(null);

  readonly form = this.fb.nonNullable.group({
    roleCode: ['', [Validators.required, Validators.maxLength(100)]],
    roleName: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    permissionIds: [[] as number[]]
  });

  readonly filteredRoles = computed(() => {
    const query = this.search().trim().toLowerCase();
    if (!query) {
      return this.roles();
    }

    return this.roles().filter(role =>
      role.roleCode.toLowerCase().includes(query) ||
      role.roleName.toLowerCase().includes(query) ||
      role.description?.toLowerCase().includes(query) ||
      role.permissions?.some(permission =>
        permission.toLowerCase().includes(query)
      )
    );
  });

  readonly permissionCount = computed(() =>
    new Set(this.roles().flatMap(role => role.permissions ?? [])).size
  );

  constructor() {
    super();
    this.loadRoles();
    this.loadPermissions();
  }

  loadRoles(): void {
    this.startLoading();
    this.clearPageError();

    this.roleService
      .getRoles()
      .pipe(
        this.untilDestroyed(),
        finalize(() => this.stopLoading())
      )
      .subscribe({
        next: response => this.roles.set(response.data ?? []),
        error: error =>
          this.setPageError(error, 'Unable to load roles.')
      });
  }

  openCreate(): void {
    this.editingRoleId.set(null);
    this.form.reset({
      roleCode: '',
      roleName: '',
      description: '',
      permissionIds: []
    });
    this.dialogVisible.set(true);
  }

  openEdit(role: Role): void {
    this.editingRoleId.set(role.id);
    this.loadingRole.set(true);
    this.dialogVisible.set(true);
    this.form.reset({
      roleCode: role.roleCode,
      roleName: role.roleName,
      description: role.description ?? '',
      permissionIds: this.resolvePermissionIds(role.permissions)
    });

    this.roleService
      .getById(role.id)
      .pipe(
        this.untilDestroyed(),
        finalize(() => this.loadingRole.set(false))
      )
      .subscribe({
        next: response => {
          const detail = response.data;
          if (!detail) {
            return;
          }
          this.form.patchValue({
            roleCode: detail.roleCode,
            roleName: detail.roleName,
            description: detail.description ?? '',
            permissionIds: this.resolvePermissionIds(detail.permissions)
          });
        },
        error: error => {
          this.dialogVisible.set(false);
          this.showError(error, 'Unable to load the role.')
        }
      });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: RolePayload = {
      roleCode: value.roleCode.trim(),
      roleName: value.roleName.trim(),
      description: value.description.trim(),
      permissionIds: value.permissionIds
    };
    const id = this.editingRoleId();
    const request = id === null
      ? this.roleService.create(payload)
      : this.roleService.update(id, payload);

    this.saving.set(true);
    request
      .pipe(
        this.untilDestroyed(),
        finalize(() => this.saving.set(false))
      )
      .subscribe({
        next: response => {
          const saved = response.data;
          if (saved) {
            this.roles.update(roles => [
              saved,
              ...roles.filter(role => role.id !== saved.id)
            ]);
          } else {
            this.loadRoles();
          }
          this.dialogVisible.set(false);
          this.toast.success(
            id === null
              ? 'Role created successfully.'
              : 'Role updated successfully.'
          );
        },
        error: error =>
          this.showError(
            error,
            id === null
              ? 'Unable to create the role.'
              : 'Unable to update the role.'
          )
      });
  }

  confirmDelete(role: Role): void {
    this.confirmation.confirm({
      header: 'Delete role',
      message: `Delete "${role.roleName}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: {
        label: 'Delete',
        icon: 'pi pi-trash',
        severity: 'danger'
      },
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true
      },
      accept: () => this.deleteRole(role)
    });
  }

  private deleteRole(role: Role): void {
    this.roleService
      .delete(role.id)
      .pipe(this.untilDestroyed())
      .subscribe({
        next: () => {
          this.roles.update(roles =>
            roles.filter(item => item.id !== role.id)
          );
          this.toast.success('Role deleted successfully.');
        },
        error: error =>
          this.showError(error, 'Unable to delete the role.')
      });
  }

  private loadPermissions(): void {
    this.loadingPermissions.set(true);
    this.permissionService
      .getPermissions()
      .pipe(
        this.untilDestroyed(),
        finalize(() => this.loadingPermissions.set(false))
      )
      .subscribe({
        next: response => {
          this.permissions.set(response.data ?? []);
          this.permissionCatalogReady.set(true);
        },
        error: error =>
          this.showError(error, 'Unable to load the permission catalog.')
      });
  }

  private resolvePermissionIds(values: string[] | null | undefined): number[] {
    const normalized = new Set(
      (values ?? []).map(value => value.toLowerCase())
    );
    return this.permissions()
      .filter(permission =>
        normalized.has(permission.permissionCode.toLowerCase()) ||
        normalized.has(permission.permissionName.toLowerCase())
      )
      .map(permission => permission.id);
  }
}
