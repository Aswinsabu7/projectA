import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import { MessageHistoryService, MessageQuery } from '../../../services/message-history.service';
import { NotificationService } from '../../../services/notification.service';
import { MessageHistory } from '../../../shared/models/message-history.model';

@Component({
  selector: 'app-message-history-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TagModule,
    SelectModule,
    ToolbarModule,
    ToastModule,
    HasPermissionDirective,
  ],
  templateUrl: './message-history-list.component.html',
})
export class MessageHistoryListComponent {
  private readonly messageHistoryService = inject(MessageHistoryService);
  private readonly notificationService = inject(NotificationService);

  protected readonly PERMISSIONS = PERMISSIONS;

  protected readonly messages = signal<MessageHistory[]>([]);
  protected readonly totalRecords = signal(0);
  protected readonly loading = signal(false);
  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal<string | null>(null);
  protected readonly resendingId = signal<string | null>(null);

  protected readonly statusOptions = [
    { label: 'All Statuses', value: null },
    { label: 'Sent', value: 'Sent' },
    { label: 'Failed', value: 'Failed' },
    { label: 'Pending', value: 'Pending' },
  ];

  private lastQuery: MessageQuery = { page: 1, limit: 10 };

  loadData(event: TableLazyLoadEvent): void {
    this.loading.set(true);
    const page = Math.floor((event.first || 0) / (event.rows || 10)) + 1;
    const query: MessageQuery = {
      page,
      limit: event.rows || 10,
      search: this.searchTerm() || undefined,
      status: this.statusFilter() || undefined,
    };
    this.lastQuery = query;

    this.messageHistoryService.list(query).subscribe({
      next: (res) => {
        this.messages.set(res.items);
        this.totalRecords.set(res.meta.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearchChange(): void {
    this.loadData({ first: 0, rows: this.lastQuery.limit || 10 });
  }

  resend(message: MessageHistory): void {
    this.resendingId.set(message._id);
    this.messageHistoryService.resend(message._id).subscribe({
      next: () => {
        this.resendingId.set(null);
        this.notificationService.success('Message resent successfully');
        this.loadData({ first: 0, rows: this.lastQuery.limit || 10 });
      },
      error: () => this.resendingId.set(null),
    });
  }

  subscriberName(message: MessageHistory): string {
    return typeof message.subscriber === 'string' ? message.subscriber : message.subscriber?.fullName || '-';
  }

  statusSeverity(status: string): 'success' | 'warn' | 'danger' {
    if (status === 'Sent') return 'success';
    if (status === 'Pending') return 'warn';
    return 'danger';
  }
}
