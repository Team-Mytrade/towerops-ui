import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  RuleCategory,
  RuleCondition,
  RuleDefinition,
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

  readonly categoryOptions: ReadonlyArray<{ label: string; value: RuleCategory; icon: string }> = [
    { label: 'Condition', value: 'CONDITION', icon: 'pi pi-filter' },
    { label: 'Regex', value: 'REGEX', icon: 'pi pi-code' },
    { label: 'Threshold', value: 'THRESHOLD', icon: 'pi pi-chart-line' },
    { label: 'Range', value: 'RANGE', icon: 'pi pi-arrows-h' },
    { label: 'State change', value: 'STATE_CHANGE', icon: 'pi pi-sync' },
    { label: 'Absence', value: 'ABSENCE', icon: 'pi pi-clock' },
    { label: 'Aggregation', value: 'AGGREGATION', icon: 'pi pi-chart-bar' },
    { label: 'Schedule', value: 'SCHEDULE', icon: 'pi pi-calendar' },
    { label: 'Geo fence', value: 'GEO_FENCE', icon: 'pi pi-map-marker' },
    { label: 'Duplicate', value: 'DUPLICATE', icon: 'pi pi-copy' },
    { label: 'Script', value: 'SCRIPT', icon: 'pi pi-file-edit' }
  ];
  readonly scopeOptions = ['GLOBAL', 'TENANT', 'SITE', 'DEVICE'].map(value => ({ label: this.title(value), value }));
  readonly actionTypeOptions = ['ALERT', 'TICKET', 'NOTIFICATION'].map(value => ({ label: this.title(value), value }));
  readonly actionTargetOptions = ['EMAIL', 'SMS', 'LOG', 'SYSTEM', 'DASHBOARD'].map(value => ({ label: this.title(value), value }));
  readonly operatorOptions = [
    { label: 'Equals', value: 'EQ' },
    { label: 'Not equal', value: 'NE' },
    { label: 'Greater than', value: 'GT' },
    { label: 'Greater or equal', value: 'GTE' },
    { label: 'Less than', value: 'LT' },
    { label: 'Less or equal', value: 'LTE' },
    { label: 'Contains', value: 'CONTAINS' }
  ];
  readonly logicalOperatorOptions = ['AND', 'OR'].map(value => ({ label: value, value }));
  readonly severityOptions = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(value => ({ label: this.title(value), value }));
  readonly aggregationOptions = ['AVG', 'SUM', 'MIN', 'MAX', 'COUNT'].map(value => ({ label: value, value }));
  readonly geoEventOptions = ['ENTER', 'EXIT'].map(value => ({ label: this.title(value), value }));

  readonly lookupForm = this.fb.nonNullable.group({
    tenantId: [this.auth.tenantId() ?? '', Validators.required],
    siteCode: ['', Validators.required],
    deviceId: ['', Validators.required]
  });

  readonly form = this.fb.nonNullable.group({
    ruleCode: ['', [Validators.required, Validators.pattern(/^[A-Z0-9_]+$/)]],
    name: ['', Validators.required],
    description: [''],
    category: ['CONDITION' as RuleCategory, Validators.required],
    scope: ['DEVICE' as RuleScope, Validators.required],
    tenantId: [this.auth.tenantId() ?? '', Validators.required],
    siteCode: [''],
    deviceId: [''],
    actionType: ['ALERT' as const, Validators.required],
    actionTarget: ['', Validators.required],
    severity: ['LOW' as RuleSeverity, Validators.required],
    priority: [0, [Validators.required, Validators.min(0)]],
    enabled: [true],
    conditions: this.fb.array([this.createCondition()]),
    definition: this.fb.nonNullable.group({
      field: [''], operator: ['GT' as const], pattern: [''], threshold: [0],
      duration: [''], minValue: [0], maxValue: [0], fromValue: [''], toValue: [''],
      aggregationType: ['AVG' as const], window: [''], value: [0], cronExpression: [''],
      latitude: [0], longitude: [0], radiusMeters: [0], event: ['ENTER' as const],
      language: ['javascript' as const], expression: ['']
    })
  });

  constructor() {
    super();
    this.loadSites();
    this.configureCategory(this.form.controls.category.value);
    this.configureScope(this.form.controls.scope.value);

    this.form.controls.category.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(category => this.configureCategory(category));
    this.form.controls.scope.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(scope => this.configureScope(scope));
  }

  get conditions(): FormArray { return this.form.controls.conditions; }
  get category(): RuleCategory { return this.form.controls.category.value; }
  get scope(): RuleScope { return this.form.controls.scope.value; }

  selectCategory(category: RuleCategory): void {
    this.form.controls.category.setValue(category);
  }

  categoryIcon(category: RuleCategory): string {
    return this.categoryOptions.find(option => option.value === category)?.icon ?? 'pi pi-bolt';
  }

  categoryHelp(category: RuleCategory): string {
    const help: Record<RuleCategory, string> = {
      CONDITION: 'Combine one or more telemetry comparisons using AND or OR.',
      REGEX: 'Match a field value against a regular-expression pattern.',
      THRESHOLD: 'Trigger when a measurement crosses a limit for a duration.',
      RANGE: 'Keep a measurement between a minimum and maximum value.',
      STATE_CHANGE: 'Detect an explicit transition from one state to another.',
      ABSENCE: 'Trigger when an expected signal is missing for a duration.',
      AGGREGATION: 'Evaluate an aggregate measurement over a rolling window.',
      SCHEDULE: 'Run an action on a cron-based schedule.',
      GEO_FENCE: 'Detect entry into or exit from a geographic radius.',
      DUPLICATE: 'Detect repeated field values within a time window.',
      SCRIPT: 'Evaluate advanced business logic with a JavaScript expression.'
    };
    return help[category];
  }

  payloadPreview(): string {
    const value = this.form.getRawValue();
    const payload: RulePayload = {
      ruleCode: value.ruleCode.trim().toUpperCase(), name: value.name.trim(),
      description: value.description.trim(), category: value.category, scope: value.scope,
      tenantId: value.tenantId, siteCode: this.needsSite(value.scope) ? value.siteCode : null,
      deviceId: value.scope === 'DEVICE' ? value.deviceId : null, actionType: value.actionType,
      actionTarget: value.actionTarget, severity: value.severity, priority: Number(value.priority),
      enabled: value.enabled,
      definition: this.buildDefinition(value.category, value.conditions, value.definition)
    };
    return JSON.stringify(payload, null, 2);
  }

  addCondition(): void { this.conditions.push(this.createCondition()); }
  removeCondition(index: number): void {
    if (this.conditions.length > 1) this.conditions.removeAt(index);
  }

  onLookupSiteChanged(siteCode: string): void {
    this.lookupForm.patchValue({ siteCode, deviceId: '' });
    this.lookupDevices.set([]);
    if (siteCode) this.loadDevices(siteCode, 'lookup');
  }

  onFormSiteChanged(siteCode: string | null): void {
    this.form.patchValue({ siteCode: siteCode ?? '', deviceId: '' });
    this.formDevices.set([]);
    if (siteCode) this.loadDevices(siteCode, 'form');
  }

  loadRules(): void {
    if (this.lookupForm.invalid) { this.lookupForm.markAllAsTouched(); return; }
    this.startLoading();
    this.clearPageError();
    this.searched.set(true);
    this.ruleService.getForDevice(this.lookupForm.getRawValue()).pipe(
      this.untilDestroyed(), finalize(() => this.stopLoading())
    ).subscribe({
      next: rules => this.rules.set(rules ?? []),
      error: error => this.setPageError(error, 'Unable to load device rules.')
    });
  }

  createRule(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning(
        this.needsDevice() && !this.form.controls.deviceId.value
          ? 'Select a device before creating the rule.'
          : 'Complete all required fields before creating the rule.'
      );
      return;
    }
    const value = this.form.getRawValue();
    const payload: RulePayload = {
      ruleCode: value.ruleCode.trim().toUpperCase(),
      name: value.name.trim(), description: value.description.trim(),
      category: value.category, scope: value.scope, tenantId: value.tenantId,
      siteCode: this.needsSite(value.scope) ? value.siteCode : null,
      deviceId: value.scope === 'DEVICE' ? value.deviceId : null,
      actionType: value.actionType, actionTarget: value.actionTarget,
      severity: value.severity, priority: Number(value.priority), enabled: value.enabled,
      definition: this.buildDefinition(value.category, value.conditions, value.definition)
    };

    this.creating.set(true);
    this.ruleService.create(payload).pipe(
      this.untilDestroyed(), finalize(() => this.creating.set(false))
    ).subscribe({
      next: rule => {
        this.rules.update(rules => [rule, ...rules.filter(item => item.id !== rule.id)]);
        this.toast.success('Rule created successfully.');
        this.resetForm();
      },
      error: error => this.showError(error, 'Unable to create the rule.')
    });
  }

  definitionSummary(rule: Rule): string {
    const definition = rule.definition as unknown as Record<string, unknown>;
    if ('conditions' in definition) {
      return (definition['conditions'] as RuleCondition[])
        .map((item, index) => `${index ? item.logicalOperator ?? 'AND' : ''} ${item.field} ${item.operator} ${item.value}`.trim())
        .join(' ');
    }
    return Object.entries(definition).map(([key, value]) => `${key}: ${value}`).join(' · ');
  }

  severity(value: RuleSeverity): 'secondary' | 'info' | 'warn' | 'danger' {
    return ({ LOW: 'secondary', MEDIUM: 'info', HIGH: 'warn', CRITICAL: 'danger' } as const)[value];
  }

  categoryLabel(category: RuleCategory): string {
    return this.categoryOptions.find(option => option.value === category)?.label ?? category;
  }

  needsSite(scope = this.scope): boolean { return scope === 'SITE' || scope === 'DEVICE'; }
  needsDevice(scope = this.scope): boolean { return scope === 'DEVICE'; }

  private configureScope(scope: RuleScope): void {
    this.setRequired(this.form.controls.siteCode, this.needsSite(scope));
    this.setRequired(this.form.controls.deviceId, this.needsDevice(scope));
    if (!this.needsSite(scope)) this.form.patchValue({ siteCode: '', deviceId: '' }, { emitEvent: false });
    else if (!this.needsDevice(scope)) this.form.controls.deviceId.reset('', { emitEvent: false });
  }

  private configureCategory(category: RuleCategory): void {
    Object.values(this.form.controls.definition.controls).forEach(control => {
      control.clearValidators(); control.updateValueAndValidity({ emitEvent: false });
    });
    this.conditions.controls.forEach(control => category === 'CONDITION'
      ? control.enable({ emitEvent: false }) : control.disable({ emitEvent: false }));

    const requiredByCategory: Record<RuleCategory, string[]> = {
      CONDITION: [], REGEX: ['field', 'pattern'],
      THRESHOLD: ['field', 'operator', 'threshold', 'duration'],
      RANGE: ['field', 'minValue', 'maxValue'], STATE_CHANGE: ['field', 'fromValue', 'toValue'],
      ABSENCE: ['field', 'duration'], AGGREGATION: ['aggregationType', 'field', 'window', 'operator', 'value'],
      SCHEDULE: ['cronExpression'], GEO_FENCE: ['latitude', 'longitude', 'radiusMeters', 'event'],
      DUPLICATE: ['field', 'window'], SCRIPT: ['language', 'expression']
    };
    requiredByCategory[category].forEach(name => {
      const control = this.form.controls.definition.get(name)!;
      const validators: ValidatorFn[] = [Validators.required];
      if (['radiusMeters', 'threshold'].includes(name)) validators.push(Validators.min(0.000001));
      control.setValidators(validators);
      control.updateValueAndValidity({ emitEvent: false });
    });
  }

  private buildDefinition(category: RuleCategory, conditions: RuleCondition[], d: any): RuleDefinition {
    switch (category) {
      case 'CONDITION': return { conditions: conditions.map(item => ({ ...item })) };
      case 'REGEX': return { field: d.field, pattern: d.pattern };
      case 'THRESHOLD': return { field: d.field, operator: d.operator, threshold: Number(d.threshold), duration: d.duration };
      case 'RANGE': return { field: d.field, minValue: Number(d.minValue), maxValue: Number(d.maxValue) };
      case 'STATE_CHANGE': return { field: d.field, fromValue: d.fromValue, toValue: d.toValue };
      case 'ABSENCE': return { field: d.field, duration: d.duration };
      case 'AGGREGATION': return { aggregationType: d.aggregationType, field: d.field, window: d.window, operator: d.operator, value: Number(d.value) };
      case 'SCHEDULE': return { cronExpression: d.cronExpression };
      case 'GEO_FENCE': return { latitude: Number(d.latitude), longitude: Number(d.longitude), radiusMeters: Number(d.radiusMeters), event: d.event };
      case 'DUPLICATE': return { field: d.field, window: d.window };
      case 'SCRIPT': return { language: 'javascript', expression: d.expression };
    }
  }

  private createCondition() {
    return this.fb.nonNullable.group({
      field: ['', Validators.required], operator: ['EQ' as const, Validators.required],
      value: ['', Validators.required], logicalOperator: ['AND' as const, Validators.required]
    });
  }

  private setRequired(control: AbstractControl, required: boolean): void {
    control.setValidators(required ? Validators.required : null);
    control.updateValueAndValidity({ emitEvent: false });
  }

  resetForm(): void {
    this.form.patchValue({ ruleCode: '', name: '', description: '' });
    while (this.conditions.length > 1) this.conditions.removeAt(1);
    this.conditions.at(0).reset({ field: '', operator: 'EQ', value: '', logicalOperator: 'AND' });
  }

  private title(value: string): string {
    return value.toLowerCase().replaceAll('_', ' ').replace(/^./, char => char.toUpperCase());
  }

  private loadSites(): void {
    this.loadingSites.set(true);
    this.siteService.getSites({ page: 0, size: 500, sort: 'siteName,asc', active: true }).pipe(
      this.untilDestroyed(), finalize(() => this.loadingSites.set(false))
    ).subscribe({
      next: response => this.sites.set(response.data ?? []),
      error: error => this.showError(error, 'Unable to load sites.')
    });
  }

  private loadDevices(siteCode: string, target: 'lookup' | 'form'): void {
    const site = this.sites().find(item => item.siteCode === siteCode);
    if (!site) return;
    const loading = target === 'lookup' ? this.loadingLookupDevices : this.loadingFormDevices;
    const devices = target === 'lookup' ? this.lookupDevices : this.formDevices;
    loading.set(true);
    this.deviceService.getDevices({ siteId: site.id, page: 0, size: 500, sort: 'deviceName,asc', active: true }).pipe(
      this.untilDestroyed(), finalize(() => loading.set(false))
    ).subscribe({
      next: response => devices.set(response.data ?? []),
      error: error => this.showError(error, 'Unable to load devices for this site.')
    });
  }

}
