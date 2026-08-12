import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../services/auth.service';
import { ThemeService } from '../../../services/theme.service';
import { PERMISSIONS } from '../../../shared/constants/permissions';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  permission?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'pi pi-chart-line', route: '/dashboard', permission: PERMISSIONS.DASHBOARD_VIEW },
  { label: 'Subscribers', icon: 'pi pi-users', route: '/subscribers', permission: PERMISSIONS.SUBSCRIBER_VIEW },
  { label: 'Message History', icon: 'pi pi-whatsapp', route: '/messages', permission: PERMISSIONS.MESSAGE_VIEW },
  { label: 'Users', icon: 'pi pi-user', route: '/users', permission: PERMISSIONS.USER_VIEW },
  { label: 'Roles', icon: 'pi pi-shield', route: '/roles', permission: PERMISSIONS.ROLE_VIEW },
  { label: 'Audit Log', icon: 'pi pi-history', route: '/audit-log', permission: PERMISSIONS.AUDIT_LOG_VIEW },
  { label: 'Settings', icon: 'pi pi-cog', route: '/settings', permission: PERMISSIONS.SETTINGS_VIEW },
];

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonModule, AvatarModule, MenuModule, RippleModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly themeService = inject(ThemeService);

  protected readonly sidebarCollapsed = signal(false);
  protected readonly currentUser = this.authService.currentUser;

  protected readonly navItems = computed(() =>
    NAV_ITEMS.filter((item) => !item.permission || this.authService.hasPermission(item.permission))
  );

  protected readonly userMenuItems: MenuItem[] = [
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.logout(),
    },
  ];

  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  logout(): void {
    this.authService.logout();
  }
}
