import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import {
  NavigationEnd,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { filter } from 'rxjs';

import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';

import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';
import { BaseComponent } from '../../core/base/base.component';
import { NavigationService } from '../../navigation/navigation.service';

@Component({
  selector: 'to-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MenuModule
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellComponent extends BaseComponent {
  private readonly authService = inject(AuthService);
  private readonly navigationService = inject(NavigationService);

  readonly expanded = signal(false);
  readonly mobileOpen = signal(false);
  readonly pageTitle = signal('Dashboard');

  readonly groups = this.navigationService.groups;
  readonly currentUser = this.authService.currentUser;

  readonly appName = environment.app.displayName;
  readonly version = environment.app.version;
  readonly build = environment.app.build;

  readonly userInitials = computed(() => {
    const username = this.currentUser()?.username?.trim();

    if (!username) {
      return 'U';
    }

    return username
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(value => value.charAt(0).toUpperCase())
      .join('');
  });

  readonly profileMenu: MenuItem[] = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      command: () => this.openProfile()
    },
    {
      separator: true
    },
    {
      label: 'Sign out',
      icon: 'pi pi-sign-out',
      command: () => this.logout()
    }
  ];

  constructor() {
    super();

    this.updatePageTitle();

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        this.untilDestroyed()
      )
      .subscribe(() => {
        this.mobileOpen.set(false);
        this.updatePageTitle();
      });
  }

  toggleExpanded(): void {
    this.expanded.update(value => !value);
  }

  toggleMobile(): void {
    this.mobileOpen.update(value => !value);
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
  }

  private openProfile(): void {
    const route =
      this.authService.userType() === 'TECHNICIAN'
        ? '/technician/profile'
        : '/tenant/profile';

    void this.navigateByUrl(route);
  }

  private updatePageTitle(): void {
    const item = this.navigationService.findByUrl(
      this.router.url
    );

    this.pageTitle.set(item?.label ?? 'Dashboard');
  }
}