import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import {
  DatePipe
} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

import { BaseComponent } from '../../../../../core/base/base.component';
import { AuthService } from '../../../../../core/auth/auth.service';
import {
  Severity
} from '../../../../../core/models/application.enums';

import {
  Alert,
  AlertPayload,
  AlertStatus
} from '../../models/alert.models';

import {
  AlertService
} from '../../services/alert.service';
import { Device } from '../../../devices/models/device.models';
import { DeviceService } from '../../../devices/services/device.service';
import { Rule } from '../../../rules/models/rule.models';
import { RuleService } from '../../../rules/services/rule.service';
import { Site } from '../../../sites/models/site.models';
import { SiteService } from '../../../sites/services/site.service';

interface SelectOption<T> {
  label: string;
  value: T | null;
}

@Component({
  selector: 'to-alerts-list',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule
  ],
  templateUrl: './alerts-list.html',
  styleUrl: './alerts-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertsListComponent extends BaseComponent {
  private readonly alertService = inject(AlertService);
  private readonly deviceService = inject(DeviceService);
  private readonly ruleService = inject(RuleService);
  private readonly siteService = inject(SiteService);
  private readonly auth = inject(AuthService);

  readonly alerts = signal<Alert[]>([]);
  readonly selectedAlert = signal<Alert | null>(null);
  readonly createOpen = signal(false);
  readonly saving = signal(false);
  readonly loadingRules = signal(false);
  readonly devices = signal<Device[]>([]);
  readonly sites = signal<Site[]>([]);
  readonly rules = signal<Rule[]>([]);
  readonly draft = signal<AlertPayload>(this.emptyDraft());

  readonly search = signal('');
  readonly severityFilter =
    signal<Severity | null>(null);
  readonly statusFilter =
    signal<AlertStatus | null>(null);

  readonly severityOptions:
    SelectOption<Severity>[] = [
      { label: 'All severities', value: null },
      { label: 'Critical', value: 'CRITICAL' },
      { label: 'High', value: 'HIGH' },
      { label: 'Medium', value: 'MEDIUM' },
      { label: 'Low', value: 'LOW' }
    ];

  readonly statusOptions:
    SelectOption<AlertStatus>[] = [
      { label: 'All statuses', value: null },
      { label: 'Open', value: 'OPEN' },
      { label: 'Resolved', value: 'RESOLVED' }
    ];

  readonly createSeverityOptions = this.severityOptions
    .filter((option): option is { label: string; value: Severity } =>
      option.value !== null && option.value !== 'ERROR'
    );

  readonly deviceOptions = computed(() =>
    this.devices()
      .filter(device =>
        device.active !== false &&
        device.enabled !== false
      )
      .flatMap(device => {
        const deviceId = device.deviceId?.trim();

        return deviceId
          ? [{
              label: `${device.deviceName} (${deviceId})`,
              value: deviceId
            }]
          : [];
      })
  );

  readonly ruleOptions = computed(() =>
    this.rules().filter(rule => rule.enabled).map(rule => ({
      label: `${rule.name} (${rule.ruleCode})`,
      value: rule.id
    }))
  );

  readonly filteredAlerts = computed(() => {
    const search =
      this.search().trim().toLowerCase();

    return this.alerts().filter(alert => {
      const matchesSearch =
        !search ||
        alert.alertCode
          .toLowerCase()
          .includes(search) ||
        alert.alertType
          .toLowerCase()
          .includes(search) ||
        alert.message
          .toLowerCase()
          .includes(search) ||
        alert.deviceId
          .toLowerCase()
          .includes(search);

      const matchesSeverity =
        !this.severityFilter() ||
        alert.severity === this.severityFilter();

      const matchesStatus =
        !this.statusFilter() ||
        alert.status === this.statusFilter();

      return (
        matchesSearch &&
        matchesSeverity &&
        matchesStatus
      );
    });
  });

  readonly totalAlerts = computed(
    () => this.filteredAlerts().length
  );

  readonly criticalAlerts = computed(
    () =>
      this.filteredAlerts().filter(
        alert => alert.severity === 'CRITICAL'
      ).length
  );

  readonly openAlerts = computed(
    () =>
      this.filteredAlerts().filter(
        alert => alert.status === 'OPEN'
      ).length
  );

  readonly acknowledgedAlerts = computed(
    () =>
      this.filteredAlerts().filter(
        alert => alert.acknowledged
      ).length
  );

  readonly resolvedAlerts = computed(
    () =>
      this.filteredAlerts().filter(
        alert =>
          alert.status === 'RESOLVED'
      ).length
  );

  constructor() {
    super();

    this.activatedRoute.queryParamMap
      .pipe(this.untilDestroyed())
      .subscribe(params => {
        if (params.get('mode') === 'create') {
          this.draft.set(this.emptyDraft());
          this.rules.set([]);
          this.createOpen.set(true);
        } else {
          this.createOpen.set(false);
        }

        const siteId =
          this.parsePositiveNumber(
            params.get('siteId')
          );

        const deviceId = params.get('deviceId') ?? undefined;

        this.loadAlerts(siteId, deviceId);
      });

    this.loadLookups();
  }

  refresh(): void {
    const params =
      this.activatedRoute.snapshot.queryParamMap;

    this.loadAlerts(
      this.parsePositiveNumber(
        params.get('siteId')
      ),
      params.get('deviceId') ?? undefined
    );
  }

  openCreate(): void {
    void this.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { mode: 'create' }
    });
  }

  closeCreate(): void {
    if (!this.saving()) {
      void this.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: {}
      });
    }
  }

  setDraft<K extends keyof AlertPayload>(key: K, value: AlertPayload[K]): void {
    this.draft.update(current => ({ ...current, [key]: value }));
  }

  selectDevice(deviceId: string | null): void {
    this.draft.update(current => ({
      ...current,
      deviceId: deviceId ?? '',
      ruleId: 0,
      ruleName: ''
    }));
    this.rules.set([]);

    if (!deviceId) return;
    const device = this.devices().find(
      item => item.deviceId === deviceId
    );
    const tenantId = this.auth.tenantId();
    const siteCode = device?.siteCode ??
      this.sites().find(site => site.id === device?.siteId)?.siteCode;

    if (!device || !tenantId) return;
    if (!siteCode) {
      this.toast.warning(
        'The selected device is not linked to a valid site.'
      );
      return;
    }

    this.loadingRules.set(true);
    this.ruleService.getForDevice({
      tenantId,
      siteCode,
      deviceId
    }).pipe(
      this.untilDestroyed(),
      finalize(() => this.loadingRules.set(false))
    ).subscribe({
      next: rules => this.rules.set(rules ?? []),
      error: error => this.showError(error, 'Unable to load rules for this device.')
    });
  }

  selectRule(ruleId: number | null): void {
    const rule = this.rules().find(item => item.id === ruleId);
    this.draft.update(current => ({
      ...current,
      ruleId: rule?.id ?? 0,
      ruleName: rule?.name ?? '',
      severity: rule?.severity ?? current.severity
    }));
  }

  createAlert(): void {
    const payload = this.draft();
    if (!payload.deviceId || !payload.ruleId || !payload.alertType.trim() ||
        !payload.message.trim()) {
      this.toast.warning('Device, rule, alert type and message are required.');
      return;
    }

    this.saving.set(true);
    this.alertService.create(payload).pipe(
      this.untilDestroyed(),
      finalize(() => this.saving.set(false))
    ).subscribe({
      next: response => {
        this.alerts.update(alerts => [response.data, ...alerts]);
        this.closeCreate();
        this.toast.success('Alert created successfully.');
      },
      error: error => this.showError(error, 'Unable to create the alert.')
    });
  }

  selectAlert(alert: Alert): void {
    this.selectedAlert.set(alert);
  }

  closeDetails(): void {
    this.selectedAlert.set(null);
  }

  openSite(alert: Alert): void {
    if (!alert.siteId) {
      return;
    }

    void this.navigateByUrl(
      `/tenant/sites/${alert.siteId}`
    );
  }

  openDevice(alert: Alert): void {
    if (!alert.deviceId) {
      return;
    }

    void this.navigateByUrl(
      `/tenant/devices/${alert.deviceId}`
    );
  }

  acknowledge(alert: Alert): void {
    this.alertService
      .acknowledge(alert.id)
      .pipe(this.untilDestroyed())
      .subscribe({
        next: response => {
          this.updateAlert(response.data);
          this.toast.success(
            'Alert acknowledged successfully.'
          );
        },
        error: error => {
          this.showError(
            error,
            'Unable to acknowledge the alert.'
          );
        }
      });
  }

  resolve(alert: Alert): void {
    this.alertService
      .resolve(alert.id)
      .pipe(this.untilDestroyed())
      .subscribe({
        next: response => {
          this.toast.success(
            'Alert resolved successfully.'
          );
        },
        error: error => {
          this.showError(
            error,
            'Unable to resolve the alert.'
          );
        }
      });
  }

  clearFilters(): void {
    this.search.set('');
    this.severityFilter.set(null);
    this.statusFilter.set(null);
  }

  severityTag(
    severity: Severity
  ): 'danger' | 'warn' | 'info' {
    switch (severity) {
      case 'CRITICAL':
        return 'danger';

      case 'HIGH':
      case 'MEDIUM':
        return 'warn';

      default:
        return 'info';
    }
  }

  statusTag(
    status: AlertStatus
  ): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    switch (status) {
      case 'OPEN':
        return 'danger';

      case 'RESOLVED':
        return 'success';

      default:
        return 'info';
    }
  }

  private loadAlerts(
    _siteId?: number,
    deviceId?: string
  ): void {
    this.startLoading();
    this.clearPageError();

    const request = deviceId
      ? this.alertService.getByDevice(deviceId)
      : this.alertService.getAlerts();

    request
      .pipe(
        this.untilDestroyed(),
        finalize(() => this.stopLoading())
      )
      .subscribe({
        next: response => {
          this.alerts.set(response.data ?? []);
        },
        error: error => {
          this.setPageError(
            error,
            'Unable to load alerts.'
          );
        }
      });
  }

  private updateAlert(updatedAlert: Alert): void {
    this.alerts.update(alerts =>
      alerts.map(alert =>
        alert.id === updatedAlert.id
          ? updatedAlert
          : alert
      )
    );

    this.selectedAlert.set(updatedAlert);
  }

  private parsePositiveNumber(
    value: string | null
  ): number | undefined {
    const parsedValue = Number(value);

    return (
      Number.isInteger(parsedValue) &&
      parsedValue > 0
    )
      ? parsedValue
      : undefined;
  }

  private loadLookups(): void {
    forkJoin({
      devices: this.deviceService.getDevices({
        enabled: true,
        active: true,
        size: 500
      }),
      sites: this.siteService.getSites({
        enabled: true,
        size: 500
      })
    })
      .pipe(this.untilDestroyed())
      .subscribe({
        next: response => {
          this.devices.set(response.devices.data ?? []);
          this.sites.set(response.sites.data ?? []);
        },
        error: error => this.showError(
          error,
          'Unable to load device and site choices.'
        )
      });
  }

  private emptyDraft(): AlertPayload {
    return {
      deviceId: '',
      ruleId: 0,
      ruleName: '',
      alertType: '',
      severity: 'LOW',
      message: ''
    };
  }
}
