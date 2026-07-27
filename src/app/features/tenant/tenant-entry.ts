import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';

@Component({
  selector: 'to-tenant-entry',
  standalone: true,
  template: `<h1>Tenant Entry</h1>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TenantEntry {}