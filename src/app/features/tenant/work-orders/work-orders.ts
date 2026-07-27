import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  DatePipe,
  DecimalPipe,
  NgClass,
  TitleCasePipe
} from '@angular/common';

import {
  FormControl,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  forkJoin
} from 'rxjs';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  TableLazyLoadEvent,
  TableModule
} from 'primeng/table';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';

import {
  Severity,
  SiteCategory,
  WorkOrderStatus
} from '../../../core/models/application.enums';

import { BaseComponent } from '../../../core/base/base.component';

import {
  WORK_ORDER_SEVERITY_OPTIONS,
  WORK_ORDER_STATUS_OPTIONS,
  WorkOrderOption
} from './constants/work-order.constants';

import {
  WorkOrder,
  WorkOrderListQuery,
  WorkOrderSummary
} from './models/work-order.models';

import {
  WorkOrderService
} from './work-order.service';

interface FilterOption<T> {
  label: string;
  value: T | null;
}

const SITE_CATEGORY_OPTIONS:
  WorkOrderOption<SiteCategory>[] = [
    {
      label: 'Tower',
      value: 'TOWER'
    },
    {
      label: 'Building',
      value: 'BUILDING'
    },
    {
      label: 'Warehouse',
      value: 'WAREHOUSE'
    },
    {
      label: 'Telecom',
      value: 'TELECOM'
    },
    {
      label: 'Power',
      value: 'POWER'
    },
    {
      label: 'Generator',
      value: 'GENERATOR'
    },
    {
      label: 'Facility',
      value: 'FACILITY'
    },
    {
      label: 'Marine',
      value: 'MARINE'
    },
    {
      label: 'Aviation',
      value: 'AVIATION'
    },
    {
      label: 'Defense',
      value: 'DEFENSE'
    },
    {
      label: 'AI Ops Center',
      value: 'AI_OPS_CENTER'
    }
  ];

@Component({
  selector: 'to-work-orders',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    NgClass,
    TitleCasePipe,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    ProgressSpinnerModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule
  ],
  templateUrl: './work-orders.html',
  styleUrl: './work-orders.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkOrdersComponent extends BaseComponent {
  private readonly workOrderService =
    inject(WorkOrderService);

  private readonly route =
    inject(ActivatedRoute);

  readonly isLoading = signal(false);
  readonly summaryLoading = signal(false);

  readonly workOrders =
    signal<WorkOrder[]>([]);

  readonly summary =
    signal<WorkOrderSummary | null>(null);

  readonly totalRecords = signal(0);
  readonly page = signal(0);
  readonly pageSize = signal(10);

  readonly categoryFilter =
    signal<SiteCategory | null>(null);

  readonly statusFilter =
    signal<WorkOrderStatus | null>(null);

  readonly severityFilter =
    signal<Severity | null>(null);

  readonly searchControl =
    new FormControl('', {
      nonNullable: true
    });

readonly statusOptions: FilterOption<WorkOrderStatus>[] = [
  {
    label: 'All statuses',
    value: null
  },
  ...WORK_ORDER_STATUS_OPTIONS.map(option => ({
    label: option.label,
    value: option.value
  }))
];

readonly severityOptions: FilterOption<Severity>[] = [
  {
    label: 'All severities',
    value: null
  },
  ...WORK_ORDER_SEVERITY_OPTIONS.map(option => ({
    label: option.label,
    value: option.value
  }))
];

readonly categoryOptions: FilterOption<SiteCategory>[] = [
  {
    label: 'All categories',
    value: null
  },
  ...SITE_CATEGORY_OPTIONS.map(option => ({
    label: option.label,
    value: option.value
  }))
];
  readonly hasFilters = computed(() =>
    Boolean(
      this.searchControl.value.trim() ||
      this.categoryFilter() ||
      this.statusFilter() ||
      this.severityFilter()
    )
  );

  readonly activeCount = computed(() => {
    const dashboard = this.summary();

    if (!dashboard) {
      return 0;
    }

    return (
      dashboard.created +
      dashboard.assigned +
      dashboard.scheduled +
      dashboard.inProgress
    );
  });

  readonly completedCount = computed(() => {
    return this.summary()?.completed ?? 0;
  });

  readonly overdueCount = computed(() => {
    return this.summary()?.overdue ?? 0;
  });

  readonly totalCount = computed(() => {
    return this.summary()?.total ??
      this.totalRecords();
  });

  constructor() {
    super();

    this.initializeQueryFilters();
    this.initializeSearch();
  }

  ngOnInit(): void {
    this.loadPage();
  }

  refresh(): void {
    this.loadPage();
  }

  clearFilters(): void {
    this.searchControl.setValue('', {
      emitEvent: false
    });

    this.categoryFilter.set(null);
    this.statusFilter.set(null);
    this.severityFilter.set(null);
    this.page.set(0);

    void this.updateUrlFilters();

    this.loadPage();
  }

  onCategoryChange(
    category: SiteCategory | null
  ): void {
    this.categoryFilter.set(category);
    this.page.set(0);

    void this.updateUrlFilters();

    this.loadPage();
  }

  onStatusChange(
    status: WorkOrderStatus | null
  ): void {
    this.statusFilter.set(status);
    this.page.set(0);

    void this.updateUrlFilters();

    this.loadPage();
  }

  onSeverityChange(
    severity: Severity | null
  ): void {
    this.severityFilter.set(severity);
    this.page.set(0);

    void this.updateUrlFilters();

    this.loadPage();
  }

  onLazyLoad(
    event: TableLazyLoadEvent
  ): void {
    const rows =
      event.rows ?? this.pageSize();

    const first =
      event.first ?? 0;

    const nextPage = Math.floor(
      first / rows
    );

    const pageChanged =
      nextPage !== this.page();

    const sizeChanged =
      rows !== this.pageSize();

    if (!pageChanged && !sizeChanged) {
      return;
    }

    this.page.set(nextPage);
    this.pageSize.set(rows);

    this.loadWorkOrders();
  }

  createWorkOrder(): void {
    void this.router.navigate([
      '/tenant/work-orders/create'
    ]);
  }

  openWorkOrder(
    workOrder: WorkOrder
  ): void {
    void this.router.navigate([
      '/tenant/work-orders',
      workOrder.id
    ]);
  }

  editWorkOrder(
    event: Event,
    workOrder: WorkOrder
  ): void {
    event.stopPropagation();

    void this.router.navigate(
      [
        '/tenant/work-orders',
        workOrder.id,
        'edit'
      ]
    );
  }

  openSite(
    event: Event,
    workOrder: WorkOrder
  ): void {
    event.stopPropagation();

    if (!workOrder.siteId) {
      return;
    }

    void this.router.navigate([
      '/tenant/sites',
      workOrder.siteId
    ]);
  }

  statusLabel(
    status: WorkOrderStatus
  ): string {
    return (
      WORK_ORDER_STATUS_OPTIONS.find(
        option => option.value === status
      )?.label ??
      status.replaceAll('_', ' ')
    );
  }

  statusSeverity(
    status: WorkOrderStatus
  ):
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'secondary'
    | 'contrast' {
    switch (status) {
      case 'COMPLETED':
      case 'VERIFIED':
      case 'CLOSED':
        return 'success';

      case 'IN_PROGRESS':
      case 'SCHEDULED':
        return 'info';

      case 'ASSIGNED':
      case 'CREATED':
        return 'warn';

      case 'CANCELLED':
        return 'danger';

      default:
        return 'secondary';
    }
  }

  severityLabel(
    severity?: Severity | null
  ): string {
    if (!severity) {
      return 'Not set';
    }

    return (
      WORK_ORDER_SEVERITY_OPTIONS.find(
        option => option.value === severity
      )?.label ?? severity
    );
  }

  severityClass(
    severity?: Severity | null
  ): string {
    switch (severity) {
      case 'LOW':
        return 'to-severity--low';

      case 'MEDIUM':
        return 'to-severity--medium';

      case 'HIGH':
        return 'to-severity--high';

      case 'CRITICAL':
        return 'to-severity--critical';

      default:
        return 'to-severity--unknown';
    }
  }

  technicianLabel(
    workOrder: WorkOrder
  ): string {
    return (
      workOrder.technicianName ||
      workOrder.technicianCode ||
      'Unassigned'
    );
  }

  siteLabel(
    workOrder: WorkOrder
  ): string {
    return (
      workOrder.siteName ||
      workOrder.siteCode ||
      'No site assigned'
    );
  }

  private initializeQueryFilters(): void {
    const category =
      this.route.snapshot.queryParamMap.get(
        'category'
      );

    const status =
      this.route.snapshot.queryParamMap.get(
        'status'
      );

    const severity =
      this.route.snapshot.queryParamMap.get(
        'severity'
      );

    const search =
      this.route.snapshot.queryParamMap.get(
        'search'
      );

    if (this.isSiteCategory(category)) {
      this.categoryFilter.set(category);
    }

    if (this.isWorkOrderStatus(status)) {
      this.statusFilter.set(status);
    }

    if (this.isSeverity(severity)) {
      this.severityFilter.set(severity);
    }

    if (search) {
      this.searchControl.setValue(
        search,
        {
          emitEvent: false
        }
      );
    }
  }

  private initializeSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.page.set(0);

        void this.updateUrlFilters();

        this.loadPage();
      });
  }

  private loadPage(): void {
    this.loading.set(true);
    this.summaryLoading.set(true);
    this.pageError.set(null);

    forkJoin({
      workOrders:
        this.workOrderService.getWorkOrders(
          this.buildListQuery()
        ),

      summary:
        this.workOrderService.getSummary({
          category:
            this.categoryFilter()
        })
    })
      .pipe(
        finalize(() => {
          this.loading.set(false);
          this.summaryLoading.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({
          workOrders,
          summary
        }) => {
          this.workOrders.set(
            workOrders.data?.content ?? []
          );

          this.totalRecords.set(
            workOrders.data?.totalElements ?? 0
          );

          this.summary.set(
            summary.data ?? null
          );
        },
        error: error => {
          this.workOrders.set([]);
          this.totalRecords.set(0);

          this.pageError.set(
            this.resolveErrorMessage(error)
          );
        }
      });
  }

  private loadWorkOrders(): void {
    this.loading.set(true);
    this.pageError.set(null);

    this.workOrderService
      .getWorkOrders(
        this.buildListQuery()
      )
      .pipe(
        finalize(() =>
          this.loading.set(false)
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: response => {
          this.workOrders.set(
            response.data?.content ?? []
          );

          this.totalRecords.set(
            response.data?.totalElements ?? 0
          );
        },
        error: error => {
          this.workOrders.set([]);
          this.totalRecords.set(0);

          this.pageError.set(
            this.resolveErrorMessage(error)
          );
        }
      });
  }

  private buildListQuery():
    WorkOrderListQuery {
    return {
      page: this.page(),
      size: this.pageSize(),

      search:
        this.searchControl.value.trim() ||
        undefined,

      category:
        this.categoryFilter(),

      status:
        this.statusFilter(),

      severity:
        this.severityFilter()
    };
  }

  private async updateUrlFilters():
    Promise<void> {
    await this.router.navigate([], {
      relativeTo: this.route,

      queryParams: {
        category:
          this.categoryFilter(),

        status:
          this.statusFilter(),

        severity:
          this.severityFilter(),

        search:
          this.searchControl.value.trim() ||
          null
      },

      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  private resolveErrorMessage(
    error: unknown
  ): string {
    if (
      typeof error === 'object' &&
      error !== null &&
      'error' in error
    ) {
      const apiError = error as {
        error?: {
          message?: string;
        };
      };

      if (apiError.error?.message) {
        return apiError.error.message;
      }
    }

    return (
      'Unable to load work orders. ' +
      'Please try again.'
    );
  }

  private isSiteCategory(
    value: string | null
  ): value is SiteCategory {
    return [
      'TOWER',
      'BUILDING',
      'WAREHOUSE',
      'TELECOM',
      'POWER',
      'GENERATOR',
      'FACILITY',
      'MARINE',
      'AVIATION',
      'DEFENSE',
      'AI_OPS_CENTER'
    ].includes(value ?? '');
  }

  private isWorkOrderStatus(
    value: string | null
  ): value is WorkOrderStatus {
    return [
      'CREATED',
      'ASSIGNED',
      'SCHEDULED',
      'IN_PROGRESS',
      'COMPLETED',
      'VERIFIED',
      'CLOSED',
      'CANCELLED'
    ].includes(value ?? '');
  }

  private isSeverity(
    value: string | null
  ): value is Severity {
    return [
      'LOW',
      'MEDIUM',
      'HIGH',
      'CRITICAL'
    ].includes(value ?? '');
  }
}