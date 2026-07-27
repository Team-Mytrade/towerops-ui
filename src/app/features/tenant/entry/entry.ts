import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { finalize } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { BaseComponent } from '../../../core/base/base.component';
import { SiteCategory } from '../../../core/models/application.enums';
import { STORAGE_KEYS } from '../../../core/storage/storage.keys';
import { StorageService } from '../../../core/storage/storage.service';
import {
  CategoryDisplayConfig,
  SiteCategorySummary
} from './entry.models';
import { TenantEntryService } from './entry.service';

@Component({
  selector: 'to-tenant-entry',
  standalone: true,
  imports: [
    ButtonModule,
    ProgressSpinnerModule
  ],
  templateUrl: './entry.html',
  styleUrl: './entry.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TenantEntryComponent extends BaseComponent {
  private readonly entryService = inject(TenantEntryService);
  private readonly storageService = inject(StorageService);

  readonly categories = signal<SiteCategorySummary[]>([]);
  readonly loadingCategories = signal(true);

  readonly hasCategories = computed(
    () => this.categories().length > 0
  );

  readonly hasMultipleCategories = computed(
    () => this.categories().length > 1
  );

  readonly totalSites = computed(() =>
    this.categories().reduce(
      (total, category) => total + category.count,
      0
    )
  );

  readonly totalAlerts = computed(() =>
    this.categories().reduce(
      (total, category) =>
        total + (category.openAlerts ?? 0),
      0
    )
  );

  readonly totalCriticalSites = computed(() =>
    this.categories().reduce(
      (total, category) =>
        total + (category.criticalSites ?? 0),
      0
    )
  );

  readonly categoryConfig:
    Record<SiteCategory, CategoryDisplayConfig> = {
      TOWER: {
        label: 'Towers',
        description: 'Telecom tower infrastructure and connected assets',
        icon: 'pi pi-wifi'
      },
      BUILDING: {
        label: 'Buildings',
        description: 'Commercial and operational building facilities',
        icon: 'pi pi-building'
      },
      WAREHOUSE: {
        label: 'Warehouses',
        description: 'Storage facilities and logistics infrastructure',
        icon: 'pi pi-box'
      },
      TELECOM: {
        label: 'Telecom Sites',
        description: 'Telecommunications network infrastructure',
        icon: 'pi pi-sitemap'
      },
      POWER: {
        label: 'Power Sites',
        description: 'Power distribution and electrical infrastructure',
        icon: 'pi pi-bolt'
      },
      GENERATOR: {
        label: 'Generator Sites',
        description: 'Generator and backup-power infrastructure',
        icon: 'pi pi-cog'
      },
      FACILITY: {
        label: 'Facilities',
        description: 'Operational and managed facilities',
        icon: 'pi pi-home'
      },
      MARINE: {
        label: 'Marine Sites',
        description: 'Marine and offshore infrastructure',
        icon: 'pi pi-compass'
      },
      AVIATION: {
        label: 'Aviation Sites',
        description: 'Airport and aviation infrastructure',
        icon: 'pi pi-send'
      },
      DEFENSE: {
        label: 'Defense Sites',
        description: 'Restricted and critical defense infrastructure',
        icon: 'pi pi-shield'
      },
      AI_OPS_CENTER: {
        label: 'AI Ops Centers',
        description: 'AI-assisted operational monitoring centers',
        icon: 'pi pi-desktop'
      }
    };

  constructor() {
    super();
    this.loadCategories();
  }

  selectCategory(category: SiteCategorySummary): void {
    this.storageService.set(
      STORAGE_KEYS.selectedCategory,
      category.category
    );

    void this.navigateByUrl(
      `/tenant/dashboard/${category.category}`
    );
  }

  retry(): void {
    this.loadCategories();
  }

  getConfig(
    category: SiteCategory
  ): CategoryDisplayConfig {
    return this.categoryConfig[category];
  }

  getHealthTotal(category: SiteCategorySummary): number {
    return (
      (category.healthy ?? 0) +
      (category.warning ?? 0) +
      (category.critical ?? 0) +
      (category.offline ?? 0) +
      (category.maintenance ?? 0) +
      (category.unknown ?? 0)
    );
  }

  getHealthPercentage(
    category: SiteCategorySummary,
    value: number | undefined
  ): number {
    const total = this.getHealthTotal(category);

    if (!total || !value) {
      return 0;
    }

    return Math.round((value / total) * 100);
  }

  private loadCategories(): void {
    this.loadingCategories.set(true);
    this.clearPageError();

    this.entryService
      .getCategorySummary()
      .pipe(
        this.untilDestroyed(),
        finalize(() =>
          this.loadingCategories.set(false)
        )
      )
      .subscribe({
        next: response => {
          const categories = response.data ?? [];

          this.categories.set(categories);

          if (categories.length === 1) {
            this.selectCategory(categories[0]);
          }
        },
        error: error => {
          this.setPageError(
            error,
            'Unable to load site categories.'
          );
        }
      });
  }
}