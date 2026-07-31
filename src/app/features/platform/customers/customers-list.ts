import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

import { BaseComponent } from '../../../core/base/base.component';
import { Customer } from './customer.models';
import { CustomerService } from './customer.service';

interface SelectOption {
  label: string;
  value: boolean | null;
}

@Component({
  selector: 'to-customers-list',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule
  ],
  templateUrl: './customers-list.html',
  styleUrl: './customers-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersListComponent extends BaseComponent {
  private readonly customerService = inject(CustomerService);

  readonly customers = signal<Customer[]>([]);
  readonly search = signal('');
  readonly statusFilter = signal<boolean | null>(null);

  readonly statusOptions: SelectOption[] = [
    { label: 'All statuses', value: null },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  readonly filteredCustomers = computed(() => {
    const search = this.search().trim().toLowerCase();

    return this.customers().filter(customer => {
      const matchesSearch =
        !search ||
        customer.tenantName.toLowerCase().includes(search) ||
        customer.tenantId.toLowerCase().includes(search) ||
        customer.email?.toLowerCase().includes(search) ||
        customer.phoneNumber?.toLowerCase().includes(search) ||
        customer.address?.toLowerCase().includes(search);

      return (
        matchesSearch &&
        (this.statusFilter() === null ||
          customer.active === this.statusFilter())
      );
    });
  });

  readonly activeCustomers = computed(
    () =>
      this.customers().filter(
        customer => customer.active
      ).length
  );

  readonly inactiveCustomers = computed(
    () =>
      this.customers().filter(
        customer => !customer.active
      ).length
  );

  readonly customersWithContact = computed(
    () =>
      this.customers().filter(
        customer => customer.email || customer.phoneNumber
      ).length
  );

  readonly filtersActive = computed(
    () =>
      Boolean(
        this.search() ||
        this.statusFilter() !== null
      )
  );

  constructor() {
    super();
    this.loadCustomers();
  }

  refresh(): void {
    this.loadCustomers();
  }

  clearFilters(): void {
    this.search.set('');
    this.statusFilter.set(null);
  }

  initials(name: string): string {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  }

  private loadCustomers(): void {
    this.startLoading();
    this.clearPageError();

    this.customerService
      .getCustomers()
      .pipe(
        this.untilDestroyed(),
        finalize(() => this.stopLoading())
      )
      .subscribe({
        next: response => {
          this.customers.set(response.data ?? []);
        },
        error: error => {
          this.setPageError(
            error,
            'Unable to load tenants.'
          );
        }
      });
  }
}
