import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import { RoleService, RoleQuery } from '../../../services/role.service';
import { NotificationService } from '../../../services/notification.service';
import { Role } from '../../../shared/models/role.model';
import { RoleFormComponent } from '../role-form/role-form.component';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TagModule,
    ToolbarModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    ToggleSwitchModule,
    HasPermissionDirective,
    RoleFormComponent,
  ],
  templateUrl: './role-list.component.html',
})
export class RoleListComponent {
  private readonly roleService = inject(RoleService);
  private readonly notificationService = inject(NotificationService);

  protected readonly PERMISSIONS = PERMISSIONS;

  protected readonly roles = signal<Role[]>([]);
  protected readonly totalRecords = signal(0);
  protected readonly loading = signal(false);
  protected readonly searchTerm = signal('');

  protected readonly formVisible = signal(false);
  protected readonly selectedRole = signal<Role | null>(null);

  private lastQuery: RoleQuery = { page: 1, limit: 10 };

  loadData(event: TableLazyLoadEvent): void {
    this.loading.set(true);
    const page = Math.floor((event.first || 0) / (event.rows || 10)) + 1;
    const query: RoleQuery = { page, limit: event.rows || 10, search: this.searchTerm() || undefined };
    this.lastQuery = query;

    this.roleService.list(query).subscribe({
      next: (res) => {
        this.roles.set(res.items);
        this.totalRecords.set(res.meta.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearchChange(): void {
    this.loadData({ first: 0, rows: this.lastQuery.limit || 10 });
  }

  openCreateDialog(): void {
    this.selectedRole.set(null);
    this.formVisible.set(true);
  }

  openEditDialog(role: Role): void {
    this.selectedRole.set(role);
    this.formVisible.set(true);
  }

  onFormSaved(): void {
    this.formVisible.set(false);
    this.loadData({ first: 0, rows: this.lastQuery.limit || 10 });
  }

  toggleStatus(role: Role): void {
    this.roleService.setStatus(role._id, !role.isActive).subscribe(() => {
      this.notificationService.success(`Role ${!role.isActive ? 'activated' : 'deactivated'} successfully`);
      this.loadData({ first: 0, rows: this.lastQuery.limit || 10 });
    });
  }

  confirmDelete(role: Role): void {
    this.notificationService.confirmDelete(`Delete role "${role.name}"? This cannot be undone.`, () => {
      this.roleService.delete(role._id).subscribe(() => {
        this.notificationService.success('Role deleted successfully');
        this.loadData({ first: 0, rows: this.lastQuery.limit || 10 });
      });
    });
  }

  permissionCount(role: Role): number {
    return role.permissions?.length || 0;
  }
}
