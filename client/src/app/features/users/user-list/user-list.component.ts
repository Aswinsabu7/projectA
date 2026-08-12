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
import { UserService, UserQuery } from '../../../services/user.service';
import { NotificationService } from '../../../services/notification.service';
import { AppUser } from '../../../shared/models/user.model';
import { UserFormComponent } from '../user-form/user-form.component';

@Component({
  selector: 'app-user-list',
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
    UserFormComponent,
  ],
  templateUrl: './user-list.component.html',
})
export class UserListComponent {
  private readonly userService = inject(UserService);
  private readonly notificationService = inject(NotificationService);

  protected readonly PERMISSIONS = PERMISSIONS;

  protected readonly users = signal<AppUser[]>([]);
  protected readonly totalRecords = signal(0);
  protected readonly loading = signal(false);
  protected readonly searchTerm = signal('');

  protected readonly formVisible = signal(false);
  protected readonly selectedUser = signal<AppUser | null>(null);

  private lastQuery: UserQuery = { page: 1, limit: 10 };

  loadData(event: TableLazyLoadEvent): void {
    this.loading.set(true);
    const page = Math.floor((event.first || 0) / (event.rows || 10)) + 1;
    const query: UserQuery = { page, limit: event.rows || 10, search: this.searchTerm() || undefined };
    this.lastQuery = query;

    this.userService.list(query).subscribe({
      next: (res) => {
        this.users.set(res.items);
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
    this.selectedUser.set(null);
    this.formVisible.set(true);
  }

  openEditDialog(user: AppUser): void {
    this.selectedUser.set(user);
    this.formVisible.set(true);
  }

  onFormSaved(): void {
    this.formVisible.set(false);
    this.loadData({ first: 0, rows: this.lastQuery.limit || 10 });
  }

  toggleStatus(user: AppUser): void {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    this.userService.setStatus(user._id, newStatus).subscribe(() => {
      this.notificationService.success(`User ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully`);
      this.loadData({ first: 0, rows: this.lastQuery.limit || 10 });
    });
  }

  confirmDelete(user: AppUser): void {
    this.notificationService.confirmDelete(`Delete user "${user.username}"? This cannot be undone.`, () => {
      this.userService.delete(user._id).subscribe(() => {
        this.notificationService.success('User deleted successfully');
        this.loadData({ first: 0, rows: this.lastQuery.limit || 10 });
      });
    });
  }

  roleName(user: AppUser): string {
    return typeof user.role === 'string' ? user.role : user.role?.name || '-';
  }
}
