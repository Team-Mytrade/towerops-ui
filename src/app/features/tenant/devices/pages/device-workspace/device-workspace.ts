import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

@Component({
  selector: 'to-device-workspace',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],
  templateUrl: './device-workspace.html',
  styleUrl: './device-workspace.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceWorkspaceComponent {}
