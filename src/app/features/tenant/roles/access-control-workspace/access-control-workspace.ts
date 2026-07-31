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
  selector: 'to-access-control-workspace',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './access-control-workspace.html',
  styleUrl: './access-control-workspace.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccessControlWorkspaceComponent {}
