import { NavigationGroup } from './navigation.models';

export const SUPER_ADMIN_NAVIGATION: NavigationGroup[] = [
  {
    id: 'platform',
    items: [
      {
        id: 'platform-dashboard',
        label: 'Dashboard',
        icon: 'pi pi-home',
        route: '/platform/dashboard',
        exact: true,
      },
      {
        id: 'tenants',
        label: 'Tenants',
        icon: 'pi pi-building',
        route: '/platform/tenants',
      },
      {
        id: 'platform-map',
        label: 'Platform Map',
        icon: 'pi pi-map',
        route: '/platform/map',
      },
    ],
  },
  {
    id: 'operations',
    title: 'Operations',
    items: [
      {
        id: 'platform-alerts',
        label: 'Alerts',
        icon: 'pi pi-bell',
        route: '/platform/alerts',
      },
      {
        id: 'platform-work-orders',
        label: 'Work Orders',
        icon: 'pi pi-briefcase',
        route: '/platform/work-orders',
      },
      {
        id: 'audit-logs',
        label: 'Audit Logs',
        icon: 'pi pi-history',
        route: '/platform/audit-logs',
      },
    ],
  },
  {
    id: 'system',
    title: 'System',
    items: [
      {
        id: 'system-health',
        label: 'System Health',
        icon: 'pi pi-server',
        route: '/platform/system-health',
      },
      {
        id: 'platform-settings',
        label: 'Settings',
        icon: 'pi pi-cog',
        route: '/platform/settings',
      },
    ],
  },
];

export const TENANT_NAVIGATION: NavigationGroup[] = [
  {
    id: 'workspace',
    items: [
      {
        id: 'tenant-dashboard',
        label: 'Dashboard',
        icon: 'pi pi-home',
        route: '/tenant/dashboard',
        exact: true,
      },
      {
        id: 'category-selection',
        label: 'Site Categories',
        icon: 'pi pi-th-large',
        route: '/tenant/categories',
      },
    ],
  },
  {
    id: 'infrastructure',
    title: 'Infrastructure',
    items: [
      {
        id: 'sites',
        label: 'Sites',
        icon: 'pi pi-map-marker',
        route: '/tenant/sites',
        permission: 'sites:view',
      },
      {
        id: 'devices',
        label: 'Devices',
        icon: 'pi pi-microchip',
        route: '/tenant/devices',
        exact: true,
        permission: 'devices:view',
      },
      {
        id: 'device-models',
        label: 'Device Models',
        icon: 'pi pi-box',
        route: '/tenant/devices/models',
        permission: 'devices:view',
      },
      {
        id: 'device-credentials',
        label: 'Credentials',
        icon: 'pi pi-key',
        route: '/tenant/devices/credentials',
        permission: 'devices:view',
      },
    ],
  },
  {
    id: 'operations',
    title: 'Operations',
    items: [
      {
        id: 'rules',
        label: 'Rules',
        icon: 'pi pi-sliders-h',
        route: '/tenant/rules',
        permission: 'rules:view',
      },
      {
        id: 'alerts',
        label: 'Alerts',
        icon: 'pi pi-bell',
        route: '/tenant/alerts',
        permission: 'alerts:view',
      },
      {
        id: 'tickets',
        label: 'Tickets',
        icon: 'pi pi-ticket',
        route: '/tenant/tickets',
        permission: 'tickets:view',
      },
      {
        id: 'technicians',
        label: 'Technicians',
        icon: 'pi pi-users',
        route: '/tenant/technicians',
        permission: 'technicians:view',
      },
      {
        id: 'work-orders',
        label: 'Work Orders',
        icon: 'pi pi-briefcase',
        route: '/tenant/work-orders',
        permission: 'work-orders:view',
      },
    ],
  },
  {
    id: 'administration',
    title: 'Administration',
    items: [
      {
        id: 'users',
        label: 'Users',
        icon: 'pi pi-user',
        route: '/tenant/users',
        permission: 'users:view',
      },
      {
        id: 'roles',
        label: 'Roles',
        icon: 'pi pi-id-card',
        route: '/tenant/roles',
        permission: 'roles:view',
      },
      {
        id: 'permissions',
        label: 'Permissions',
        icon: 'pi pi-lock',
        route: '/tenant/permissions',
        permission: 'permissions:view',
      },
      {
        id: 'notification-settings',
        label: 'Notifications',
        icon: 'pi pi-send',
        route: '/tenant/notification-settings',
      },
      {
        id: 'tenant-settings',
        label: 'Settings',
        icon: 'pi pi-cog',
        route: '/tenant/settings',
      },
    ],
  },
];

export const TECHNICIAN_NAVIGATION: NavigationGroup[] = [
  {
    id: 'technician',
    items: [
      {
        id: 'technician-dashboard',
        label: 'Dashboard',
        icon: 'pi pi-home',
        route: '/technician/dashboard',
        exact: true,
      },
      {
        id: 'my-jobs',
        label: 'My Jobs',
        icon: 'pi pi-briefcase',
        route: '/technician/jobs',
      },
      {
        id: 'job-history',
        label: 'Job History',
        icon: 'pi pi-history',
        route: '/technician/history',
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: 'pi pi-bell',
        route: '/technician/notifications',
      },
      {
        id: 'profile',
        label: 'My Profile',
        icon: 'pi pi-user',
        route: '/technician/profile',
      },
    ],
  },
];