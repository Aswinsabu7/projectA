import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import { SubscriberService, SubscriberQuery } from '../../../services/subscriber.service';
import { NotificationService } from '../../../services/notification.service';
import { Subscriber } from '../../../shared/models/subscriber.model';
import { SubscriberFormComponent } from '../subscriber-form/subscriber-form.component';
import { SubscriberImportComponent } from '../subscriber-import/subscriber-import.component';

@Component({
  selector: 'app-subscriber-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    CurrencyPipe,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TagModule,
    SelectModule,
    ToolbarModule,
    DialogModule,
    SkeletonModule,
    ToastModule,
    ConfirmDialogModule,
    HasPermissionDirective,
    SubscriberFormComponent,
    SubscriberImportComponent,
  ],
  templateUrl: './subscriber-list.component.html',
  styleUrl: './subscriber-list.component.scss',
})
export class SubscriberListComponent {
  private readonly subscriberService = inject(SubscriberService);
  private readonly notificationService = inject(NotificationService);

  protected readonly PERMISSIONS = PERMISSIONS;

  protected readonly subscribers = signal<Subscriber[]>([]);
  protected readonly totalRecords = signal(0);
  protected readonly loading = signal(false);
  protected readonly searchTerm = signal('');
  protected readonly platformFilter = signal<string | null>(null);
  protected readonly statusFilter = signal<string | null>(null);

  protected readonly platformOptions = [
    { label: 'All Platforms', value: null },
    { label: 'YouTube', value: 'YouTube' },
    { label: 'Instagram', value: 'Instagram' },
  ];

  protected readonly statusOptions = [
    { label: 'All Statuses', value: null },
    { label: 'Active', value: 'Active' },
    { label: 'Renewal Due', value: 'Renewal Due' },
    { label: 'Expired', value: 'Expired' },
  ];

  protected readonly formVisible = signal(false);
  protected readonly importVisible = signal(false);
  protected readonly selectedSubscriber = signal<Subscriber | null>(null);

  private lastQuery: SubscriberQuery = { page: 1, limit: 10 };

  loadData(event: TableLazyLoadEvent): void {
    this.loading.set(true);
    const page = Math.floor((event.first || 0) / (event.rows || 10)) + 1;
    const sortField = Array.isArray(event.sortField) ? event.sortField[0] : event.sortField;

    const query: SubscriberQuery = {
      page,
      limit: event.rows || 10,
      search: this.searchTerm() || undefined,
      platform: this.platformFilter() || undefined,
      status: this.statusFilter() || undefined,
      sortBy: sortField || 'createdAt',
      sortOrder: event.sortOrder === 1 ? 'asc' : 'desc',
    };
    this.lastQuery = query;

    this.subscriberService.list(query).subscribe({
      next: (res) => {
        this.subscribers.set(res.items);
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
    this.selectedSubscriber.set(null);
    this.formVisible.set(true);
  }

  openEditDialog(subscriber: Subscriber): void {
    this.selectedSubscriber.set(subscriber);
    this.formVisible.set(true);
  }

  onFormSaved(): void {
    this.formVisible.set(false);
    this.loadData({ first: 0, rows: this.lastQuery.limit || 10 });
  }

  confirmDelete(subscriber: Subscriber): void {
    this.notificationService.confirmDelete(`Delete subscriber "${subscriber.fullName}"? This cannot be undone.`, () => {
      this.subscriberService.delete(subscriber._id).subscribe({
        next: () => {
          this.notificationService.success('Subscriber deleted successfully');
          this.loadData({ first: 0, rows: this.lastQuery.limit || 10 });
        },
      });
    });
  }

  exportExcel(): void {
    this.subscriberService.exportExcel(this.lastQuery).subscribe((blob) => {
      this.downloadBlob(blob, `subscribers-export-${Date.now()}.xlsx`);
      this.notificationService.success('Export downloaded successfully');
    });
  }

  onImportComplete(): void {
    this.importVisible.set(false);
    this.loadData({ first: 0, rows: this.lastQuery.limit || 10 });
  }

  statusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    if (status === 'Active') return 'success';
    if (status === 'Renewal Due') return 'warn';
    if (status === 'Expired') return 'danger';
    return 'info';
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
