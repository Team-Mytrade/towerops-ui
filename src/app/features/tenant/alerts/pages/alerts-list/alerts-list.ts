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
import { finalize } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

import { BaseComponent } from '../../../../../core/base/base.component';
import {
  Severity
} from '../../../../../core/models/application.enums';

import {
  Alert,
  AlertStatus
} from '../../models/alert.models';

import {
  AlertService
} from '../../services/alert.service';

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

  readonly alerts = signal<Alert[]>([]);
  readonly selectedAlert = signal<Alert | null>(null);

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
      {
        label: 'Acknowledged',
        value: 'ACKNOWLEDGED'
      },
      {
        label: 'In Progress',
        value: 'IN_PROGRESS'
      },
      { label: 'Resolved', value: 'RESOLVED' },
      { label: 'Closed', value: 'CLOSED' },
      { label: 'Suppressed', value: 'SUPPRESSED' }
    ];

  readonly filteredAlerts = computed(() => {
    const search =
      this.search().trim().toLowerCase();

    return this.alerts().filter(alert => {
      const matchesSearch =
        !search ||
        alert.alertCode
          .toLowerCase()
          .includes(search) ||
        alert.title
          .toLowerCase()
          .includes(search) ||
        alert.message
          .toLowerCase()
          .includes(search) ||
        (alert.siteName ?? '')
          .toLowerCase()
          .includes(search) ||
        (alert.deviceName ?? '')
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
        alert => alert.status === 'ACKNOWLEDGED'
      ).length
  );

  readonly resolvedAlerts = computed(
    () =>
      this.filteredAlerts().filter(
        alert =>
          alert.status === 'RESOLVED' ||
          alert.status === 'CLOSED'
      ).length
  );

  constructor() {
    super();

    this.activatedRoute.queryParamMap
      .pipe(this.untilDestroyed())
      .subscribe(params => {
        const siteId =
          this.parsePositiveNumber(
            params.get('siteId')
          );

        const deviceId =
          this.parsePositiveNumber(
            params.get('deviceId')
          );

        this.loadAlerts(siteId, deviceId);
      });
  }

  refresh(): void {
    const params =
      this.activatedRoute.snapshot.queryParamMap;

    this.loadAlerts(
      this.parsePositiveNumber(
        params.get('siteId')
      ),
      this.parsePositiveNumber(
        params.get('deviceId')
      )
    );
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

  createTicket(alert: Alert): void {
    this.alertService
      .createTicket(alert.id)
      .pipe(this.untilDestroyed())
      .subscribe({
        next: response => {
          this.toast.success(
            'Ticket created successfully.'
          );

          void this.navigateByUrl(
            `/tenant/tickets/${response.data.ticketId}`
          );
        },
        error: error => {
          this.showError(
            error,
            'Unable to create a ticket.'
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

      case 'ACKNOWLEDGED':
      case 'IN_PROGRESS':
        return 'warn';

      case 'RESOLVED':
      case 'CLOSED':
        return 'success';

      case 'SUPPRESSED':
        return 'secondary';

      default:
        return 'info';
    }
  }

  private loadAlerts(
    siteId?: number,
    deviceId?: number
  ): void {
    this.startLoading();
    this.clearPageError();

    this.alertService
      .getAlerts({
        siteId,
        deviceId,
        page: 0,
        size: 500,
        sort: 'createdAt,desc'
      })
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
}
