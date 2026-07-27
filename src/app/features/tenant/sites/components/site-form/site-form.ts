import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { finalize } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

import { BaseFormComponent } from '../../../../../core/base/base-form.component';
import { SiteCategory } from '../../../../../core/models/application.enums';
import {
  Site,
  SitePayload
} from '../../models/site.models';
import { SiteService } from '../../services/site.service';

export type SiteFormMode = 'create' | 'edit';

interface CategoryOption {
  label: string;
  value: SiteCategory;
}

@Component({
  selector: 'to-site-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
    ToggleSwitchModule
  ],
  templateUrl: './site-form.html',
  styleUrl: './site-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteFormComponent extends BaseFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly siteService = inject(SiteService);

  readonly mode = input<SiteFormMode>('create');
  readonly site = input<Site | null>(null);

  readonly saved = output<Site>();
  readonly cancelled = output<void>();

  readonly categoryOptions: CategoryOption[] = [
    { label: 'Tower', value: 'TOWER' },
    { label: 'Building', value: 'BUILDING' },
    { label: 'Warehouse', value: 'WAREHOUSE' },
    { label: 'Telecom', value: 'TELECOM' },
    { label: 'Power', value: 'POWER' },
    { label: 'Generator', value: 'GENERATOR' },
    { label: 'Facility', value: 'FACILITY' },
    { label: 'Marine', value: 'MARINE' },
    { label: 'Aviation', value: 'AVIATION' },
    { label: 'Defense', value: 'DEFENSE' },
    { label: 'AI Ops Center', value: 'AI_OPS_CENTER' }
  ];

  readonly form = this.formBuilder.nonNullable.group({
    siteCode: [
      '',
      [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-z0-9_-]+$/)
      ]
    ],

    siteName: [
      '',
      [
        Validators.required,
        Validators.maxLength(150)
      ]
    ],

    category: [
      null as SiteCategory | null,
      Validators.required
    ],

    address: this.formBuilder.nonNullable.group({
      line1: ['', Validators.required],
      line2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      postalCode: ['', Validators.required]
    }),

    latitude: [
      0,
      [
        Validators.required,
        Validators.min(-90),
        Validators.max(90)
      ]
    ],

    longitude: [
      0,
      [
        Validators.required,
        Validators.min(-180),
        Validators.max(180)
      ]
    ],

    description: [
      '',
      Validators.maxLength(500)
    ],

    enabled: [true]
  });

  constructor() {
    super();

    effect(() => {
      const site = this.site();

      if (this.mode() === 'edit' && site) {
        this.patchSite(site);
        return;
      }

      if (this.mode() === 'create') {
        this.resetToDefaults();
      }
    });
  }

  submit(): void {
    if (!this.validateForm()) {
      return;
    }

    const payload = this.buildPayload();

    this.startSubmitting();

    const request =
      this.mode() === 'edit' && this.site()
        ? this.siteService.update(
            this.site()!.id,
            payload
          )
        : this.siteService.create(payload);

    request
      .pipe(
        this.untilDestroyed(),
        finalize(() => this.stopSubmitting())
      )
      .subscribe({
        next: response => {
          const message =
            this.mode() === 'edit'
              ? 'Site updated successfully.'
              : 'Site created successfully.';

          this.toast.success(message);
          this.saved.emit(response.data);
        },
        error: error => {
          this.showError(
            error,
            this.mode() === 'edit'
              ? 'Unable to update the site.'
              : 'Unable to create the site.'
          );
        }
      });
  }

  cancel(): void {
    this.cancelled.emit();
  }

  siteCodeError(): string | null {
    return this.getControlError(
      'siteCode',
      'Site code'
    );
  }

  siteNameError(): string | null {
    return this.getControlError(
      'siteName',
      'Site name'
    );
  }

  categoryError(): string | null {
    return this.getControlError(
      'category',
      'Category'
    );
  }

  fieldError(
    controlName: string,
    label: string
  ): string | null {
    return this.getControlError(
      controlName,
      label
    );
  }

  private buildPayload(): SitePayload {
    const value = this.form.getRawValue();

    return {
      siteCode: value.siteCode.trim(),
      siteName: value.siteName.trim(),
      category: value.category!,
      address: {
        line1: value.address.line1.trim(),
        line2: value.address.line2.trim(),
        city: value.address.city.trim(),
        state: value.address.state.trim(),
        country: value.address.country.trim(),
        postalCode: value.address.postalCode.trim()
      },
      latitude: value.latitude,
      longitude: value.longitude,
      description: value.description.trim(),
      enabled: value.enabled
    };
  }

  private patchSite(site: Site): void {
    const address =
      typeof site.address === 'object' &&
      site.address !== null
        ? site.address
        : {};

    this.form.reset({
      siteCode: site.siteCode,
      siteName: site.siteName,
      category: site.category,

      address: {
        line1: address.line1 ?? '',
        line2: address.line2 ?? '',
        city: address.city ?? '',
        state: address.state ?? '',
        country: address.country ?? '',
        postalCode: address.postalCode ?? ''
      },

      latitude: site.latitude ?? 0,
      longitude: site.longitude ?? 0,
      description: site.description ?? '',
      enabled: site.enabled
    });

    this.submitted.set(false);
  }

  private resetToDefaults(): void {
    this.form.reset({
      siteCode: '',
      siteName: '',
      category: null,

      address: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        country: '',
        postalCode: ''
      },

      latitude: 0,
      longitude: 0,
      description: '',
      enabled: true
    });

    this.submitted.set(false);
  }
}