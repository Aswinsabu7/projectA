import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { AuditLogService, AuditLogQuery } from '../../services/audit-log.service';
import { AuditLog } from '../../shared/models/audit-log.model';

@Component({
  selector: 'app-audit-log-list',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, TableModule, InputTextModule, IconFieldModule, InputIconModule, TagModule, ToolbarModule],
  templateUrl: './audit-log-list.component.html',
})
export class AuditLogListComponent {
  private readonly auditLogService = inject(AuditLogService);

  protected readonly logs = signal<AuditLog[]>([]);
  protected readonly totalRecords = signal(0);
  protected readonly loading = signal(false);
  protected readonly searchTerm = signal('');

  private lastQuery: AuditLogQuery = { page: 1, limit: 10 };

  loadData(event: TableLazyLoadEvent): void {
    this.loading.set(true);
    const page = Math.floor((event.first || 0) / (event.rows || 10)) + 1;
    const query: AuditLogQuery = { page, limit: event.rows || 10, search: this.searchTerm() || undefined };
    this.lastQuery = query;

    this.auditLogService.list(query).subscribe({
      next: (res) => {
        this.logs.set(res.items);
        this.totalRecords.set(res.meta.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearchChange(): void {
    this.loadData({ first: 0, rows: this.lastQuery.limit || 10 });
  }
}
