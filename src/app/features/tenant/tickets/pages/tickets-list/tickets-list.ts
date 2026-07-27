import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import {
  DatePipe,
  TitleCasePipe
} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

import {
  BaseComponent
} from '../../../../../core/base/base.component';

import {
  Priority,
  Severity,
  TicketStatus
} from '../../../../../core/models/application.enums';

import {
  TicketFormComponent,
  TicketFormMode
} from '../../components/ticket-form/ticket-form';

import {
  Ticket
} from '../../models/ticket.models';

import {
  TicketService
} from '../../services/ticket.service';

interface SelectOption<T> {
  label: string;
  value: T | null;
}

interface TicketListFilters {
  siteId?: number;
  deviceId?: number;
  technicianId?: number;
  alertId?: number;
}

@Component({
  selector: 'to-tickets-list',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    TitleCasePipe,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    TicketFormComponent
  ],
  templateUrl: './tickets-list.html',
  styleUrl: './tickets-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketsListComponent extends BaseComponent {
  private readonly ticketService =
    inject(TicketService);

  readonly tickets = signal<Ticket[]>([]);

  readonly selectedTicket =
    signal<Ticket | null>(null);

  readonly formMode =
    signal<TicketFormMode | null>(null);

  readonly editingTicket =
    signal<Ticket | null>(null);

  readonly loadingTicketForEdit =
    signal(false);

  readonly search = signal('');

  readonly statusFilter =
    signal<TicketStatus | null>(null);

  readonly priorityFilter =
    signal<Priority | null>(null);

  readonly severityFilter =
    signal<Severity | null>(null);

  private readonly currentFilters =
    signal<TicketListFilters>({});

  private listInitialized = false;

  readonly statusOptions:
    SelectOption<TicketStatus>[] = [
      {
        label: 'All statuses',
        value: null
      },
      {
        label: 'Open',
        value: 'OPEN'
      },
      {
        label: 'Assigned',
        value: 'ASSIGNED'
      },
      {
        label: 'Acknowledged',
        value: 'ACKNOWLEDGED'
      },
      {
        label: 'In Progress',
        value: 'IN_PROGRESS'
      },
      {
        label: 'On Hold',
        value: 'ON_HOLD'
      },
      {
        label: 'Completed',
        value: 'COMPLETED'
      },
      {
        label: 'Verified',
        value: 'VERIFIED'
      },
      {
        label: 'Resolved',
        value: 'RESOLVED'
      },
      {
        label: 'Confirmed',
        value: 'CONFIRMED'
      },
      {
        label: 'Closed',
        value: 'CLOSED'
      },
      {
        label: 'Rejected',
        value: 'REJECTED'
      },
      {
        label: 'Cancelled',
        value: 'CANCELLED'
      },
      {
        label: 'Reopened',
        value: 'REOPENED'
      }
    ];

  readonly priorityOptions:
    SelectOption<Priority>[] = [
      {
        label: 'All priorities',
        value: null
      },
      {
        label: 'Critical',
        value: 'CRITICAL'
      },
      {
        label: 'High',
        value: 'HIGH'
      },
      {
        label: 'Medium',
        value: 'MEDIUM'
      },
      {
        label: 'Low',
        value: 'LOW'
      }
    ];

  readonly severityOptions:
    SelectOption<Severity>[] = [
      {
        label: 'All severities',
        value: null
      },
      {
        label: 'Critical',
        value: 'CRITICAL'
      },
      {
        label: 'Error',
        value: 'ERROR'
      },
      {
        label: 'High',
        value: 'HIGH'
      },
      {
        label: 'Medium',
        value: 'MEDIUM'
      },
      {
        label: 'Low',
        value: 'LOW'
      }
    ];

  readonly filteredTickets = computed(() => {
    const search =
      this.search().trim().toLowerCase();

    const status = this.statusFilter();
    const priority = this.priorityFilter();
    const severity = this.severityFilter();

    return this.tickets().filter(ticket => {
      const matchesSearch =
        !search ||
        ticket.ticketCode
          .toLowerCase()
          .includes(search) ||
        ticket.title
          .toLowerCase()
          .includes(search) ||
        ticket.description
          .toLowerCase()
          .includes(search) ||
        (ticket.siteName ?? '')
          .toLowerCase()
          .includes(search) ||
        (ticket.siteCode ?? '')
          .toLowerCase()
          .includes(search) ||
        (ticket.deviceName ?? '')
          .toLowerCase()
          .includes(search) ||
        (ticket.deviceCode ?? '')
          .toLowerCase()
          .includes(search) ||
        (ticket.assignedTechnicianName ?? '')
          .toLowerCase()
          .includes(search) ||
        (ticket.assignedTechnicianCode ?? '')
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        !status ||
        ticket.status === status;

      const matchesPriority =
        !priority ||
        ticket.priority === priority;

      const matchesSeverity =
        !severity ||
        ticket.severity === severity;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesSeverity
      );
    });
  });

  readonly totalTickets = computed(
    () => this.filteredTickets().length
  );

  readonly openTickets = computed(
    () =>
      this.filteredTickets().filter(
        ticket =>
          ticket.status === 'OPEN' ||
          ticket.status === 'REOPENED'
      ).length
  );

  readonly assignedTickets = computed(
    () =>
      this.filteredTickets().filter(
        ticket =>
          ticket.status === 'ASSIGNED' ||
          ticket.status === 'ACKNOWLEDGED'
      ).length
  );

  readonly inProgressTickets = computed(
    () =>
      this.filteredTickets().filter(
        ticket =>
          ticket.status === 'IN_PROGRESS'
      ).length
  );

  readonly closedTickets = computed(
    () =>
      this.filteredTickets().filter(
        ticket =>
          ticket.status === 'CLOSED' ||
          ticket.status === 'RESOLVED' ||
          ticket.status === 'VERIFIED' ||
          ticket.status === 'CONFIRMED'
      ).length
  );

  readonly criticalTickets = computed(
    () =>
      this.filteredTickets().filter(
        ticket =>
          ticket.priority === 'CRITICAL' ||
          ticket.severity === 'CRITICAL' ||
          ticket.severity === 'ERROR'
      ).length
  );

  constructor() {
    super();

    this.activatedRoute.queryParamMap
      .pipe(this.untilDestroyed())
      .subscribe(params => {
        const filters: TicketListFilters = {
          siteId: this.parsePositiveNumber(
            params.get('siteId')
          ),
          deviceId: this.parsePositiveNumber(
            params.get('deviceId')
          ),
          technicianId: this.parsePositiveNumber(
            params.get('technicianId')
          ),
          alertId: this.parsePositiveNumber(
            params.get('alertId')
          )
        };

        const mode = params.get('mode');

        const ticketId =
          this.parsePositiveNumber(
            params.get('ticketId')
          );

        this.handleFormMode(
          mode,
          ticketId
        );

        if (
          !this.listInitialized ||
          !this.areFiltersEqual(
            filters,
            this.currentFilters()
          )
        ) {
          this.currentFilters.set(filters);
          this.listInitialized = true;
          this.loadTickets(filters);
        }
      });
  }

  refresh(): void {
    this.loadTickets(
      this.currentFilters()
    );
  }

  createTicket(): void {
    this.selectedTicket.set(null);

    void this.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        mode: 'create',
        ticketId: null
      },
      queryParamsHandling: 'merge'
    });
  }

  editTicket(ticket: Ticket): void {
    this.selectedTicket.set(null);

    void this.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        mode: 'edit',
        ticketId: ticket.id
      },
      queryParamsHandling: 'merge'
    });
  }

  closeForm(): void {
    void this.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        mode: null,
        ticketId: null
      },
      queryParamsHandling: 'merge'
    });
  }

  onTicketSaved(ticket: Ticket): void {
    this.tickets.update(currentTickets => {
      const existingTicket =
        currentTickets.some(
          current => current.id === ticket.id
        );

      if (!existingTicket) {
        return [
          ticket,
          ...currentTickets
        ];
      }

      return currentTickets.map(current =>
        current.id === ticket.id
          ? ticket
          : current
      );
    });

    this.selectedTicket.set(ticket);
    this.closeForm();
  }

  selectTicket(ticket: Ticket): void {
    this.selectedTicket.set(ticket);
  }

  closeDetails(): void {
    this.selectedTicket.set(null);
  }

  openTicket(ticket: Ticket): void {
    void this.navigateByUrl(
      `/tenant/tickets/${ticket.id}`
    );
  }

  openSite(ticket: Ticket): void {
    if (!ticket.siteId) {
      return;
    }

    void this.navigateByUrl(
      `/tenant/sites/${ticket.siteId}`
    );
  }

  openDevice(ticket: Ticket): void {
    if (!ticket.deviceId) {
      return;
    }

    void this.navigateByUrl(
      `/tenant/devices/${ticket.deviceId}`
    );
  }

  openAlert(ticket: Ticket): void {
    if (!ticket.alertId) {
      return;
    }

    void this.navigate(
      ['/tenant/alerts'],
      {
        queryParams: {
          alertId: ticket.alertId
        }
      }
    );
  }

  openWorkOrder(ticket: Ticket): void {
    if (!ticket.workOrderId) {
      return;
    }

    void this.navigateByUrl(
      `/tenant/work-orders/${ticket.workOrderId}`
    );
  }

  clearFilters(): void {
    this.search.set('');
    this.statusFilter.set(null);
    this.priorityFilter.set(null);
    this.severityFilter.set(null);
  }

  prioritySeverity(
    priority: Priority
  ): 'danger' | 'warn' | 'info' | 'secondary' {
    switch (priority) {
      case 'CRITICAL':
        return 'danger';

      case 'HIGH':
        return 'warn';

      case 'MEDIUM':
        return 'info';

      case 'LOW':
      default:
        return 'secondary';
    }
  }

  severityTag(
    severity: Severity
  ): 'danger' | 'warn' | 'info' {
    switch (severity) {
      case 'CRITICAL':
      case 'ERROR':
        return 'danger';

      case 'HIGH':
      case 'MEDIUM':
        return 'warn';

      case 'LOW':
      default:
        return 'info';
    }
  }

  statusSeverity(
    status: TicketStatus
  ):
    | 'success'
    | 'warn'
    | 'danger'
    | 'info'
    | 'secondary' {
    switch (status) {
      case 'OPEN':
      case 'REOPENED':
        return 'danger';

      case 'ASSIGNED':
      case 'ACKNOWLEDGED':
        return 'info';

      case 'IN_PROGRESS':
      case 'ON_HOLD':
        return 'warn';

      case 'COMPLETED':
      case 'VERIFIED':
      case 'RESOLVED':
      case 'CONFIRMED':
      case 'CLOSED':
        return 'success';

      case 'REJECTED':
      case 'CANCELLED':
        return 'secondary';

      default:
        return 'info';
    }
  }

  private handleFormMode(
    mode: string | null,
    ticketId?: number
  ): void {
    if (mode === 'create') {
      this.formMode.set('create');
      this.editingTicket.set(null);
      this.selectedTicket.set(null);
      this.loadingTicketForEdit.set(false);

      return;
    }

    if (mode === 'edit' && ticketId) {
      this.formMode.set('edit');
      this.selectedTicket.set(null);

      const existingTicket =
        this.tickets().find(
          ticket => ticket.id === ticketId
        );

      if (existingTicket) {
        this.editingTicket.set(existingTicket);
        this.loadingTicketForEdit.set(false);

        return;
      }

      if (
        this.editingTicket()?.id === ticketId
      ) {
        this.loadingTicketForEdit.set(false);
        return;
      }

      this.loadTicketForEdit(ticketId);
      return;
    }

    this.closeFormState();
  }

  private loadTicketForEdit(
    ticketId: number
  ): void {
    this.loadingTicketForEdit.set(true);
    this.editingTicket.set(null);

    this.ticketService
      .getById(ticketId)
      .pipe(
        this.untilDestroyed(),
        finalize(() =>
          this.loadingTicketForEdit.set(false)
        )
      )
      .subscribe({
        next: response => {
          this.editingTicket.set(response.data);
        },
        error: error => {
          this.showError(
            error,
            'Unable to load the ticket for editing.'
          );

          this.closeForm();
        }
      });
  }

  private closeFormState(): void {
    this.formMode.set(null);
    this.editingTicket.set(null);
    this.loadingTicketForEdit.set(false);
  }

  private loadTickets(
    filters: TicketListFilters
  ): void {
    this.startLoading();
    this.clearPageError();

    this.ticketService
      .getTickets({
        ...filters,
        page: 0,
        size: 500,
        sort: 'createdAt,desc'
      })
      .pipe(
        this.untilDestroyed(),
        finalize(() =>
          this.stopLoading()
        )
      )
      .subscribe({
        next: response => {
          this.tickets.set(
            response.data ?? []
          );

          this.syncEditingTicketFromList();
          this.syncSelectedTicketFromList();
        },
        error: error => {
          this.setPageError(
            error,
            'Unable to load tickets.'
          );
        }
      });
  }

  private syncEditingTicketFromList(): void {
    const editingTicket =
      this.editingTicket();

    if (!editingTicket) {
      return;
    }

    const updatedTicket =
      this.tickets().find(
        ticket =>
          ticket.id === editingTicket.id
      );

    if (updatedTicket) {
      this.editingTicket.set(updatedTicket);
    }
  }

  private syncSelectedTicketFromList(): void {
    const selectedTicket =
      this.selectedTicket();

    if (!selectedTicket) {
      return;
    }

    const updatedTicket =
      this.tickets().find(
        ticket =>
          ticket.id === selectedTicket.id
      );

    if (updatedTicket) {
      this.selectedTicket.set(updatedTicket);
    }
  }

  private areFiltersEqual(
    first: TicketListFilters,
    second: TicketListFilters
  ): boolean {
    return (
      first.siteId === second.siteId &&
      first.deviceId === second.deviceId &&
      first.technicianId ===
        second.technicianId &&
      first.alertId === second.alertId
    );
  }

  private parsePositiveNumber(
    value: string | null
  ): number | undefined {
    if (
      value === null ||
      value.trim() === ''
    ) {
      return undefined;
    }

    const parsedValue = Number(value);

    return (
      Number.isInteger(parsedValue) &&
      parsedValue > 0
    )
      ? parsedValue
      : undefined;
  }
}