import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

import { BaseComponent } from '../../../../../core/base/base.component';
import {
  SiteCategory,
  SiteHealthStatus
} from '../../../../../core/models/application.enums';
import {
  MapComponent
} from '../../../../../shared/components/map/map';
import {
  MapMarker
} from '../../../../../shared/components/map/map.models';
import {
  Site
} from '../../models/site.models';
import {
  SiteService
} from '../../services/site.service';
import { SiteFormComponent, SiteFormMode } from '../../components/site-form/site-form';

type SiteViewMode = 'LIST' | 'MAP';

interface SelectOption<T> {
  label: string;
  value: T | null;
}

@Component({
  selector: 'to-sites-list',
  standalone: true,
  imports: [
    FormsModule,
    TitleCasePipe,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    MapComponent,
    SiteFormComponent
  ],
  templateUrl: './sites-list.html',
  styleUrl: './sites-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SitesListComponent extends BaseComponent {
  private readonly siteService = inject(SiteService);

  readonly sites = signal<Site[]>([]);
  readonly search = signal('');
  readonly categoryFilter =
    signal<SiteCategory | null>(null);
  readonly healthFilter =
    signal<SiteHealthStatus | null>(null);
  readonly viewMode = signal<SiteViewMode>('LIST');
  readonly selectedSite = signal<Site | null>(null);
  readonly formMode = signal<SiteFormMode | null>(null);
  readonly editingSite = signal<Site | null>(null);

  readonly categoryOptions: SelectOption<SiteCategory>[] = [
    { label: 'All categories', value: null },
    { label: 'Towers', value: 'TOWER' },
    { label: 'Buildings', value: 'BUILDING' },
    { label: 'Warehouses', value: 'WAREHOUSE' },
    { label: 'Telecom', value: 'TELECOM' },
    { label: 'Power', value: 'POWER' },
    { label: 'Generators', value: 'GENERATOR' },
    { label: 'Facilities', value: 'FACILITY' },
    { label: 'Marine', value: 'MARINE' },
    { label: 'Aviation', value: 'AVIATION' },
    { label: 'Defense', value: 'DEFENSE' },
    { label: 'AI Ops Centers', value: 'AI_OPS_CENTER' }
  ];

  readonly healthOptions: SelectOption<SiteHealthStatus>[] = [
    { label: 'All health states', value: null },
    { label: 'Healthy', value: 'HEALTHY' },
    { label: 'Warning', value: 'WARNING' },
    { label: 'Critical', value: 'CRITICAL' },
    { label: 'Offline', value: 'OFFLINE' },
    { label: 'Maintenance', value: 'MAINTENANCE' },
    { label: 'Unknown', value: 'UNKNOWN' }
  ];

  readonly filteredSites = computed(() => {
    const search = this.search()
      .trim()
      .toLowerCase();

    return this.sites().filter(site => {
      const matchesSearch =
        !search ||
        site.siteCode.toLowerCase().includes(search) ||
        site.siteName.toLowerCase().includes(search) ||
        this.formatAddress(site.address)
          .toLowerCase()
          .includes(search);

      const matchesCategory =
        !this.categoryFilter() ||
        site.category === this.categoryFilter();

      const matchesHealth =
        !this.healthFilter() ||
        site.healthStatus === this.healthFilter();

      return (
        matchesSearch &&
        matchesCategory &&
        matchesHealth
      );
    });
  });

  readonly totalSites = computed(
    () => this.filteredSites().length
  );

  readonly healthySites = computed(
    () =>
      this.filteredSites().filter(
        site => site.healthStatus === 'HEALTHY'
      ).length
  );

  readonly criticalSites = computed(
    () =>
      this.filteredSites().filter(
        site => site.healthStatus === 'CRITICAL'
      ).length
  );

  readonly offlineSites = computed(
    () =>
      this.filteredSites().filter(
        site => site.healthStatus === 'OFFLINE'
      ).length
  );

  readonly mapMarkers = computed<MapMarker[]>(() =>
    this.filteredSites()
      .filter(
        site =>
          site.latitude !== null &&
          site.longitude !== null
      )
      .map(site => ({
        id: site.id,
        latitude: site.latitude!,
        longitude: site.longitude!,
        title: site.siteName,
        subtitle: this.formatAddress(site.address),
        category: site.category,
        healthStatus: site.healthStatus ?? 'UNKNOWN',
        siteCode: site.siteCode,
        deviceCount: site.deviceCount ?? 0,
        openAlerts: site.openAlerts ?? 0,
        data: site
      }))
  );

  constructor() {
    super();
     this.activatedRoute.queryParamMap
    .pipe(this.untilDestroyed())
    .subscribe(params => {
      const mode = params.get('mode');
      const siteId = Number(params.get('siteId'));

      if (mode === 'create') {
        this.formMode.set('create');
        this.editingSite.set(null);
        return;
      }

      if (
        mode === 'edit' &&
        Number.isInteger(siteId) &&
        siteId > 0
      ) {
        this.formMode.set('edit');

        const existingSite = this.sites().find(
          site => site.id === siteId
        );

        if (existingSite) {
          this.editingSite.set(existingSite);
        } else {
          this.loadSiteForEdit(siteId);
        }

        return;
      }

      this.closeFormState();
    });
    this.loadSites();
  }

  refresh(): void {
    this.loadSites();
  }

  setViewMode(mode: SiteViewMode): void {
    this.viewMode.set(mode);
  }

  selectSite(site: Site): void {
    this.selectedSite.set(site);
  }

  closeDetails(): void {
    this.selectedSite.set(null);
  }

  openSite(site: Site): void {
    void this.navigateByUrl(
      `/tenant/sites/${site.id}`
    );
  }

createSite(): void {
  void this.navigate([], {
    relativeTo: this.activatedRoute,
    queryParams: {
      mode: 'create'
    }
  });
}

editSite(site: Site): void {
  void this.navigate([], {
    relativeTo: this.activatedRoute,
    queryParams: {
      mode: 'edit',
      siteId: site.id
    }
  });
}

closeForm(): void {
  void this.navigate([], {
    relativeTo: this.activatedRoute,
    queryParams: {}
  });
}

onSiteSaved(site: Site): void {
  this.sites.update(currentSites => {
    const index = currentSites.findIndex(
      item => item.id === site.id
    );

    if (index === -1) {
      return [site, ...currentSites];
    }

    return currentSites.map(item =>
      item.id === site.id
        ? site
        : item
    );
  });

  this.closeForm();
}

private closeFormState(): void {
  this.formMode.set(null);
  this.editingSite.set(null);
}

private loadSiteForEdit(siteId: number): void {
  this.siteService
    .getById(siteId)
    .pipe(this.untilDestroyed())
    .subscribe({
      next: response => {
        this.editingSite.set(response.data);
      },
      error: error => {
        this.showError(
          error,
          'Unable to load the site for editing.'
        );

        this.closeForm();
      }
    });
}

  onMarkerSelected(marker: MapMarker): void {
    const site = marker.data as Site | undefined;

    if (site) {
      this.selectSite(site);
    }
  }

  clearFilters(): void {
    this.search.set('');
    this.categoryFilter.set(null);
    this.healthFilter.set(null);
  }

  formatAddress(
    address: Site['address']
  ): string {
    if (!address) {
      return 'Address not available';
    }

    if (typeof address === 'string') {
      return address;
    }

    return [
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.country,
      address.postalCode
    ]
      .filter(Boolean)
      .join(', ');
  }

  healthSeverity(
    status?: SiteHealthStatus | null
  ): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    switch (status) {
      case 'HEALTHY':
        return 'success';

      case 'WARNING':
        return 'warn';

      case 'CRITICAL':
        return 'danger';

      case 'MAINTENANCE':
        return 'info';

      default:
        return 'secondary';
    }
  }

  private loadSites(): void {
    this.startLoading();
    this.clearPageError();

    this.siteService
      .getSites()
      .pipe(
        this.untilDestroyed(),
        finalize(() => this.stopLoading())
      )
      .subscribe({
        next: response => {
          this.sites.set(response.data ?? []);
        },
        error: error => {
          this.setPageError(
            error,
            'Unable to load sites.'
          );
        }
      });
  }
}
