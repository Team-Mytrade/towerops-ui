import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { finalize } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';

import { AuthService } from '../../../../core/auth/auth.service';
import { BaseComponent } from '../../../../core/base/base.component';
import { Device } from '../../devices/models/device.models';
import { DeviceService } from '../../devices/services/device.service';
import { Site } from '../../sites/models/site.models';
import { SiteService } from '../../sites/services/site.service';
import {
  Rule,
  RuleCondition,
  RulePayload,
  RuleScope,
  RuleSeverity
} from '../models/rule.models';
import { RuleService } from '../services/rule.service';

@Component({
  selector: 'to-rules-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    TagModule,
    TextareaModule
  ],
  templateUrl: './rules-page.html',
  styleUrl: './rules-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RulesPageComponent extends BaseComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly ruleService = inject(RuleService);
  private readonly siteService = inject(SiteService);
  private readonly deviceService = inject(DeviceService);

  readonly rules = signal<Rule[]>([]);
  readonly sites = signal<Site[]>([]);
  readonly lookupDevices = signal<Device[]>([]);
  readonly formDevices = signal<Device[]>([]);
  readonly loadingSites = signal(false);
  readonly loadingLookupDevices = signal(false);
  readonly loadingFormDevices = signal(false);
  readonly creating = signal(false);
  readonly searched = signal(false);

  readonly scopeOptions = [
    { label: 'Global', value: 'GLOBAL' },
    { label: 'Tenant', value: 'TENANT' },
    { label: 'Site', value: 'SITE' },
    { label: 'Device', value: 'DEVICE' }
  ];

  readonly operatorOptions = [
    { label: 'equals', value: 'EQ' },
    { label: 'not equal', value: 'NE' },
    { label: 'greater than', value: 'GT' },
    { label: 'greater/equal', value: 'GTE' },
    { label: 'less than', value: 'LT' },
    { label: 'less/equal', value: 'LTE' },
    { label: 'contains', value: 'CONTAINS' }
  ];

  readonly logicalOperatorOptions = [
    { label: 'AND', value: 'AND' },
    { label: 'OR', value: 'OR' }
  ];

  readonly severityOptions = [
    { label: 'Low', value: 'LOW' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'High', value: 'HIGH' },
    { label: 'Critical', value: 'CRITICAL' }
  ];

  readonly lookupForm = this.fb.nonNullable.group({
    tenantId: [this.auth.tenantId() ?? '', Validators.required],
    siteCode: ['', Validators.required],
    deviceId: ['', Validators.required]
  });

  readonly form = this.fb.nonNullable.group({
    ruleCode: ['', Validators.required],
    name: ['', Validators.required],
    description: [''],
    category: ['CONDITION' as const, Validators.required],
    scope: ['DEVICE' as RuleScope, Validators.required],
    tenantId: [this.auth.tenantId() ?? '', Validators.required],
    siteCode: [''],
    deviceId: [''],
    actionType: ['ALERT' as const, Validators.required],
    actionTarget: ['', Validators.required],
    severity: ['LOW' as RuleSeverity, Validators.required],
    priority: [0, [Validators.required, Validators.min(0)]],
    enabled: [true],
    conditions: this.fb.array([this.createCondition()])
  });

  constructor() {
    super();
    this.loadSites();
  }

  get conditions(): FormArray {
    return this.form.controls.conditions;
  }

  addCondition(): void {
    this.conditions.push(this.createCondition());
  }

  removeCondition(index: number): void {
    if (this.conditions.length > 1) {
      this.conditions.removeAt(index);
    }
  }

  onLookupSiteChanged(siteCode: string): void {
    this.lookupForm.patchValue({
      siteCode,
      deviceId: ''
    });
    this.lookupDevices.set([]);
    this.loadDevices(siteCode, 'lookup');
  }

  onFormSiteChanged(siteCode: string): void {
    this.form.patchValue({
      siteCode,
      deviceId: ''
    });
    this.formDevices.set([]);
    this.loadDevices(siteCode, 'form');
  }

  loadRules(): void {
    if (this.lookupForm.invalid) {
      this.lookupForm.markAllAsTouched();
      return;
    }

    this.startLoading();
    this.clearPageError();
    this.searched.set(true);

    this.ruleService
      .getForDevice(this.lookupForm.getRawValue())
      .pipe(
        this.untilDestroyed(),
        finalize(() => this.stopLoading())
      )
      .subscribe({
        next: rules => this.rules.set(rules ?? []),
        error: error =>
          this.setPageError(error, 'Unable to load device rules.')
      });
  }

  createRule(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: RulePayload = {
      ...value,
      priority: Number(value.priority),
      definition: {
        conditions: value.conditions as RuleCondition[]
      }
    };
    delete (payload as RulePayload & { conditions?: unknown }).conditions;

    this.creating.set(true);
    this.ruleService
      .create(payload)
      .pipe(
        this.untilDestroyed(),
        finalize(() => this.creating.set(false))
      )
      .subscribe({
        next: rule => {
          this.rules.update(rules => [
            rule,
            ...rules.filter(item => item.id !== rule.id)
          ]);
          this.toast.success('Rule created successfully.');
          this.form.controls.ruleCode.reset('');
          this.form.controls.name.reset('');
          this.form.controls.description.reset('');
        },
        error: error =>
          this.showError(error, 'Unable to create the rule.')
      });
  }

  severity(
    value: RuleSeverity
  ): 'secondary' | 'info' | 'warn' | 'danger' {
    return {
      LOW: 'secondary',
      MEDIUM: 'info',
      HIGH: 'warn',
      CRITICAL: 'danger'
    }[value] as 'secondary' | 'info' | 'warn' | 'danger';
  }

  private createCondition() {
    return this.fb.nonNullable.group({
      field: ['', Validators.required],
      operator: ['EQ' as const, Validators.required],
      value: ['', Validators.required],
      logicalOperator: ['AND' as const, Validators.required]
    });
  }

  private loadSites(): void {
    this.loadingSites.set(true);
    this.siteService
      .getSites({
        page: 0,
        size: 500,
        sort: 'siteName,asc',
        active: true
      })
      .pipe(
        this.untilDestroyed(),
        finalize(() => this.loadingSites.set(false))
      )
      .subscribe({
        next: response => this.sites.set(response.data ?? []),
        error: error =>
          this.showError(error, 'Unable to load sites.')
      });
  }

  private loadDevices(
    siteCode: string,
    target: 'lookup' | 'form'
  ): void {
    const site = this.sites().find(item => item.siteCode === siteCode);
    if (!site) {
      return;
    }

    const loadingSignal =
      target === 'lookup'
        ? this.loadingLookupDevices
        : this.loadingFormDevices;
    const deviceSignal =
      target === 'lookup'
        ? this.lookupDevices
        : this.formDevices;

    loadingSignal.set(true);
    this.deviceService
      .getDevices({
        siteId: site.id,
        page: 0,
        size: 500,
        sort: 'deviceName,asc',
        active: true
      })
      .pipe(
        this.untilDestroyed(),
        finalize(() => loadingSignal.set(false))
      )
      .subscribe({
        next: response => deviceSignal.set(response.data ?? []),
        error: error =>
          this.showError(error, 'Unable to load devices for this site.')
      });
  }
}
