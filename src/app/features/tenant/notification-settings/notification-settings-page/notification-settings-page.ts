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
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';

import { BaseComponent } from '../../../../core/base/base.component';
import {
  NotificationConfig,
  NotificationConfigPayload,
  NotificationSeverity
} from '../models/notification-config.models';
import { NotificationConfigService } from '../services/notification-config.service';

@Component({
  selector: 'to-notification-settings-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    ConfirmDialogModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TagModule,
    TextareaModule,
    TooltipModule
  ],
  providers: [ConfirmationService],
  templateUrl: './notification-settings-page.html',
  styleUrl: './notification-settings-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationSettingsPageComponent extends BaseComponent {
  private readonly fb = inject(FormBuilder);
  private readonly configService = inject(NotificationConfigService);
  private readonly confirmation = inject(ConfirmationService);

  readonly configs = signal<NotificationConfig[]>([]);
  readonly search = signal('');
  readonly dialogVisible = signal(false);
  readonly loadingConfig = signal(false);
  readonly saving = signal(false);
  readonly editingId = signal<number | null>(null);

  readonly severityOptions = [
    { label: 'Low', value: 'LOW' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'High', value: 'HIGH' },
    { label: 'Critical', value: 'CRITICAL' }
  ];

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    eventType: ['', Validators.required],
    subject: ['', Validators.required],
    body: ['', Validators.required],
    severity: ['LOW' as NotificationSeverity, Validators.required],
    emailEnabled: [true],
    smsEnabled: [false],
    websocketEnabled: [true],
    emailRecipients: [''],
    phoneRecipients: [''],
    active: [true]
  });

  readonly filteredConfigs = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.configs().filter(config =>
      !query ||
      config.name.toLowerCase().includes(query) ||
      config.eventType.toLowerCase().includes(query) ||
      config.subject.toLowerCase().includes(query)
    );
  });

  readonly activeCount = computed(
    () => this.configs().filter(config => config.active).length
  );

  constructor() {
    super();
    this.loadConfigs();
  }

  loadConfigs(): void {
    this.startLoading();
    this.clearPageError();
    this.configService
      .getConfigs()
      .pipe(
        this.untilDestroyed(),
        finalize(() => this.stopLoading())
      )
      .subscribe({
        next: configs => this.configs.set(configs ?? []),
        error: error =>
          this.setPageError(error, 'Unable to load notification configurations.')
      });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({
      name: '',
      eventType: '',
      subject: '',
      body: '',
      severity: 'LOW',
      emailEnabled: true,
      smsEnabled: false,
      websocketEnabled: true,
      emailRecipients: '',
      phoneRecipients: '',
      active: true
    });
    this.dialogVisible.set(true);
  }

  openEdit(config: NotificationConfig): void {
    this.editingId.set(config.id);
    this.patchForm(config);
    this.dialogVisible.set(true);
    this.loadingConfig.set(true);
    this.configService
      .getById(config.id)
      .pipe(
        this.untilDestroyed(),
        finalize(() => this.loadingConfig.set(false))
      )
      .subscribe({
        next: detail => this.patchForm(detail),
        error: error => {
          this.dialogVisible.set(false);
          this.showError(error, 'Unable to load the notification configuration.');
        }
      });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: NotificationConfigPayload = {
      ...value,
      name: value.name.trim(),
      eventType: value.eventType.trim(),
      subject: value.subject.trim(),
      body: value.body.trim(),
      emailRecipients: value.emailRecipients.trim(),
      phoneRecipients: value.phoneRecipients.trim()
    };
    const id = this.editingId();
    const request = id === null
      ? this.configService.create(payload)
      : this.configService.update(id, payload);

    this.saving.set(true);
    request
      .pipe(
        this.untilDestroyed(),
        finalize(() => this.saving.set(false))
      )
      .subscribe({
        next: saved => {
          this.configs.update(configs => [
            saved,
            ...configs.filter(config => config.id !== saved.id)
          ]);
          this.dialogVisible.set(false);
          this.toast.success(
            id === null
              ? 'Notification configuration created.'
              : 'Notification configuration updated.'
          );
        },
        error: error =>
          this.showError(
            error,
            id === null
              ? 'Unable to create the notification configuration.'
              : 'Unable to update the notification configuration.'
          )
      });
  }

  confirmDelete(config: NotificationConfig): void {
    this.confirmation.confirm({
      header: 'Delete notification configuration',
      message: `Delete "${config.name}"?`,
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
        this.configService
          .delete(config.id)
          .pipe(this.untilDestroyed())
          .subscribe({
            next: () => {
              this.configs.update(configs =>
                configs.filter(item => item.id !== config.id)
              );
              this.toast.success('Notification configuration deleted.');
            },
            error: error =>
              this.showError(error, 'Unable to delete the configuration.')
          });
      }
    });
  }

  severityTone(
    severity: NotificationSeverity
  ): 'secondary' | 'info' | 'warn' | 'danger' {
    return {
      LOW: 'secondary',
      MEDIUM: 'info',
      HIGH: 'warn',
      CRITICAL: 'danger'
    }[severity] as 'secondary' | 'info' | 'warn' | 'danger';
  }

  private patchForm(config: NotificationConfig): void {
    this.form.patchValue({
      name: config.name,
      eventType: config.eventType,
      subject: config.subject,
      body: config.body,
      severity: config.severity,
      emailEnabled: config.emailEnabled,
      smsEnabled: config.smsEnabled,
      websocketEnabled: config.websocketEnabled,
      emailRecipients: config.emailRecipients ?? '',
      phoneRecipients: config.phoneRecipients ?? '',
      active: config.active
    });
  }
}
