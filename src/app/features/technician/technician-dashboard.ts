import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';

@Component({
  selector: 'to-technician-dashboard',
  standalone: true,
  template: `<h1>Technician Dashboard</h1>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TechnicianDashboard {}