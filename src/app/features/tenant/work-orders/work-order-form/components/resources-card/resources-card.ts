import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output
} from '@angular/core';
import {
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';

import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';

import {
  WorkOrderAlertOption,
  WorkOrderDeviceOption,
  WorkOrderSiteOption,
  WorkOrderTicketOption
} from '../../../models/work-order-form.models';

@Component({
  selector: 'to-work-order-resources-card',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SelectModule,
    TooltipModule
  ],
  templateUrl: './resources-card.html',
  styleUrl: './resources-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkOrderResourcesCardComponent {
  readonly form = input.required<FormGroup>();

  readonly sites =
    input<WorkOrderSiteOption[]>([]);

  readonly devices =
    input<WorkOrderDeviceOption[]>([]);

  readonly alerts =
    input<WorkOrderAlertOption[]>([]);

  readonly tickets =
    input<WorkOrderTicketOption[]>([]);

  readonly loadingSites =
    input(false);

  readonly loadingDevices =
    input(false);

  readonly loadingAlerts =
    input(false);

  readonly loadingTickets =
    input(false);

  readonly readonly =
    input(false);

  readonly siteChanged =
    output<number | null>();

  readonly deviceChanged =
    output<number | null>();

  readonly alertChanged =
    output<number | null>();

  readonly ticketChanged =
    output<number | null>();

  readonly selectedSite = computed(() => {
    const siteId =
      this.form().get('siteId')?.value as
        | number
        | null
        | undefined;

    return this.sites().find(
      site => site.value === siteId
    ) ?? null;
  });

  readonly selectedDevice = computed(() => {
    const deviceId =
      this.form().get('deviceId')?.value as
        | number
        | null
        | undefined;

    return this.devices().find(
      device => device.value === deviceId
    ) ?? null;
  });

  readonly selectedAlert = computed(() => {
    const alertId =
      this.form().get('alertId')?.value as
        | number
        | null
        | undefined;

    return this.alerts().find(
      alert => alert.value === alertId
    ) ?? null;
  });

  readonly selectedTicket = computed(() => {
    const ticketId =
      this.form().get('ticketId')?.value as
        | number
        | null
        | undefined;

    return this.tickets().find(
      ticket => ticket.value === ticketId
    ) ?? null;
  });

  readonly hasSelectedSite = computed(
    () => this.selectedSite() !== null
  );

  readonly deviceSelectionDisabled = computed(
    () =>
      this.readonly() ||
      !this.hasSelectedSite() ||
      this.loadingDevices()
  );

  onSiteChange(
    siteId: number | null | undefined
  ): void {
    this.siteChanged.emit(siteId ?? null);
  }

  onDeviceChange(
    deviceId: number | null | undefined
  ): void {
    this.deviceChanged.emit(deviceId ?? null);
  }

  onAlertChange(
    alertId: number | null | undefined
  ): void {
    this.alertChanged.emit(alertId ?? null);
  }

  onTicketChange(
    ticketId: number | null | undefined
  ): void {
    this.ticketChanged.emit(ticketId ?? null);
  }

  isInvalid(controlName: string): boolean {
    const control =
      this.form().get(controlName);

    return Boolean(
      control?.invalid &&
      (control.dirty || control.touched)
    );
  }

  getErrorMessage(
    controlName: string
  ): string {
    const control =
      this.form().get(controlName);

    if (!control?.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }

    return 'Select a valid value.';
  }

  clearResources(): void {
    if (this.readonly()) {
      return;
    }

    this.form().patchValue({
      siteId: null,
      deviceId: null,
      alertId: null,
      ticketId: null
    });

    this.siteChanged.emit(null);
    this.deviceChanged.emit(null);
    this.alertChanged.emit(null);
    this.ticketChanged.emit(null);
  }
}