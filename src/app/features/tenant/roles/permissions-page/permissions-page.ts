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
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';

import { BaseComponent } from '../../../../core/base/base.component';
import {
  Permission,
  PermissionPayload
} from '../models/permission.models';
import { PermissionService } from '../services/permission.service';

@Component({
  selector: 'to-permissions-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    ConfirmDialogModule,
    DialogModule,
    InputTextModule,
    TableModule,
    TextareaModule,
    TooltipModule
  ],
  providers: [ConfirmationService],
  templateUrl: './permissions-page.html',
  styleUrl: './permissions-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PermissionsPageComponent extends BaseComponent {
  private readonly fb = inject(FormBuilder);
  private readonly permissionService = inject(PermissionService);
  private readonly confirmation = inject(ConfirmationService);

  readonly permissions = signal<Permission[]>([]);
  readonly search = signal('');
  readonly dialogVisible = signal(false);
  readonly saving = signal(false);
  readonly loadingPermission = signal(false);
  readonly editingId = signal<number | null>(null);

  readonly form = this.fb.nonNullable.group({
    permissionCode: ['', Validators.required],
    permissionName: ['', Validators.required],
    description: ['']
  });

  readonly filteredPermissions = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.permissions().filter(permission =>
      !query ||
      permission.permissionCode.toLowerCase().includes(query) ||
      permission.permissionName.toLowerCase().includes(query) ||
      permission.description?.toLowerCase().includes(query)
    );
  });

  constructor() {
    super();
    this.loadPermissions();
  }

  loadPermissions(): void {
    this.startLoading();
    this.clearPageError();
    this.permissionService
      .getPermissions()
      .pipe(
        this.untilDestroyed(),
        finalize(() => this.stopLoading())
      )
      .subscribe({
        next: response => this.permissions.set(response.data ?? []),
        error: error =>
          this.setPageError(error, 'Unable to load permissions.')
      });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({
      permissionCode: '',
      permissionName: '',
      description: ''
    });
    this.dialogVisible.set(true);
  }

  openEdit(permission: Permission): void {
    this.editingId.set(permission.id);
    this.dialogVisible.set(true);
    this.loadingPermission.set(true);
    this.form.reset({
      permissionCode: permission.permissionCode,
      permissionName: permission.permissionName,
      description: permission.description ?? ''
    });

    this.permissionService
      .getById(permission.id)
      .pipe(
        this.untilDestroyed(),
        finalize(() => this.loadingPermission.set(false))
      )
      .subscribe({
        next: response => {
          if (response.data) {
            this.form.patchValue({
              permissionCode: response.data.permissionCode,
              permissionName: response.data.permissionName,
              description: response.data.description ?? ''
            });
          }
        },
        error: error => {
          this.dialogVisible.set(false);
          this.showError(error, 'Unable to load the permission.');
        }
      });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: PermissionPayload = {
      permissionCode: value.permissionCode.trim(),
      permissionName: value.permissionName.trim(),
      description: value.description.trim()
    };
    const id = this.editingId();
    const request = id === null
      ? this.permissionService.create(payload)
      : this.permissionService.update(id, payload);

    this.saving.set(true);
    request
      .pipe(
        this.untilDestroyed(),
        finalize(() => this.saving.set(false))
      )
      .subscribe({
        next: response => {
          if (response.data) {
            this.permissions.update(permissions => [
              response.data!,
              ...permissions.filter(item => item.id !== response.data!.id)
            ]);
          } else {
            this.loadPermissions();
          }
          this.dialogVisible.set(false);
          this.toast.success(
            id === null
              ? 'Permission created successfully.'
              : 'Permission updated successfully.'
          );
        },
        error: error =>
          this.showError(
            error,
            id === null
              ? 'Unable to create the permission.'
              : 'Unable to update the permission.'
          )
      });
  }

  confirmDelete(permission: Permission): void {
    this.confirmation.confirm({
      header: 'Delete permission',
      message: `Delete "${permission.permissionName}"? Roles using it may be affected.`,
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
      accept: () => {
        this.permissionService
          .delete(permission.id)
          .pipe(this.untilDestroyed())
          .subscribe({
            next: () => {
              this.permissions.update(items =>
                items.filter(item => item.id !== permission.id)
              );
              this.toast.success('Permission deleted successfully.');
            },
            error: error =>
              this.showError(error, 'Unable to delete the permission.')
          });
      }
    });
  }
}
