import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DOCUMENT,
  inject,
  signal
} from '@angular/core';
import {
  NavigationEnd,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { filter, fromEvent } from 'rxjs';

import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { PopoverModule } from 'primeng/popover';

import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';
import { BaseComponent } from '../../core/base/base.component';
import { STORAGE_KEYS } from '../../core/storage/storage.keys';
import { StorageService } from '../../core/storage/storage.service';
import { NavigationService } from '../../navigation/navigation.service';

interface ShellNotification {
  id: number;
  icon: string;
  tone: 'danger' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

@Component({
  selector: 'to-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MenuModule,
    PopoverModule
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellComponent extends BaseComponent {
  private readonly authService = inject(AuthService);
  private readonly navigationService = inject(NavigationService);
  private readonly document = inject(DOCUMENT);
  private readonly storage = inject(StorageService);

  readonly expanded = signal(false);
  readonly mobileOpen = signal(false);
  readonly pageTitle = signal('Dashboard');
  readonly fullscreen = signal(false);
  readonly darkMode = signal(
    this.storage.get<string>(STORAGE_KEYS.colorScheme) === 'dark'
  );
  readonly notifications = signal<ShellNotification[]>([
    {
      id: 1,
      icon: 'pi pi-exclamation-triangle',
      tone: 'danger',
      title: 'Critical alarm detected',
      message: 'Generator temperature exceeded its threshold at Tower T-104.',
      time: '4 min ago',
      unread: true
    },
    {
      id: 2,
      icon: 'pi pi-briefcase',
      tone: 'warning',
      title: 'Work order needs attention',
      message: 'WO-2841 is approaching its response SLA.',
      time: '28 min ago',
      unread: true
    },
    {
      id: 3,
      icon: 'pi pi-check-circle',
      tone: 'info',
      title: 'Device back online',
      message: 'Gateway GW-008 restored connectivity.',
      time: '1 hr ago',
      unread: false
    }
  ]);
  readonly unreadCount = computed(
    () => this.notifications().filter(item => item.unread).length
  );

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

    this.applyColorScheme();
    this.updatePageTitle();

    fromEvent(this.document, 'fullscreenchange')
      .pipe(this.untilDestroyed())
      .subscribe(() => {
        this.fullscreen.set(Boolean(this.document.fullscreenElement));
      });

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

  async toggleFullscreen(): Promise<void> {
    try {
      if (this.document.fullscreenElement) {
        await this.document.exitFullscreen();
      } else {
        await this.document.documentElement.requestFullscreen();
      }
    } catch {
      this.toast.error('Fullscreen mode is not available in this browser.');
    }
  }

  toggleDarkMode(): void {
    this.darkMode.update(value => !value);
    this.storage.set(
      STORAGE_KEYS.colorScheme,
      this.darkMode() ? 'dark' : 'light'
    );
    this.applyColorScheme();
  }

  markAllNotificationsRead(): void {
    this.notifications.update(items =>
      items.map(item => ({ ...item, unread: false }))
    );
  }

  markNotificationRead(notificationId: number): void {
    this.notifications.update(items =>
      items.map(item =>
        item.id === notificationId
          ? { ...item, unread: false }
          : item
      )
    );
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

  private applyColorScheme(): void {
    this.document.documentElement.classList.toggle(
      'towerops-dark',
      this.darkMode()
    );
    this.document.documentElement.style.colorScheme =
      this.darkMode() ? 'dark' : 'light';
  }

  private updatePageTitle(): void {
    const item = this.navigationService.findByUrl(
      this.router.url
    );

    this.pageTitle.set(item?.label ?? 'Dashboard');
  }
}
