import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SubscriberService } from '../../../services/subscriber.service';
import { NotificationService } from '../../../services/notification.service';
import { ImportPreviewResult } from '../../../shared/models/subscriber.model';

@Component({
  selector: 'app-subscriber-import',
  standalone: true,
  imports: [CommonModule, ButtonModule, FileUploadModule, TableModule, TagModule],
  templateUrl: './subscriber-import.component.html',
})
export class SubscriberImportComponent {
  @Output() completed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly subscriberService = inject(SubscriberService);
  private readonly notificationService = inject(NotificationService);

  protected readonly step = signal<'upload' | 'preview'>('upload');
  protected readonly previewing = signal(false);
  protected readonly importing = signal(false);
  protected readonly previewResult = signal<ImportPreviewResult | null>(null);

  downloadTemplate(): void {
    this.subscriberService.downloadImportTemplate().subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'subscriber-import-template.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  onFileSelect(event: { files: File[] }): void {
    const file = event.files[0];
    if (!file) return;

    this.previewing.set(true);
    this.subscriberService.previewImport(file).subscribe({
      next: (result) => {
        this.previewResult.set(result);
        this.step.set('preview');
        this.previewing.set(false);
      },
      error: () => this.previewing.set(false),
    });
  }

  confirmImport(): void {
    const result = this.previewResult();
    if (!result || !result.validRows.length) return;

    this.importing.set(true);
    this.subscriberService.confirmImport(result.validRows).subscribe({
      next: (res) => {
        this.importing.set(false);
        this.notificationService.success(`${res.insertedCount} subscribers imported successfully`);
        this.completed.emit();
      },
      error: () => this.importing.set(false),
    });
  }

  backToUpload(): void {
    this.previewResult.set(null);
    this.step.set('upload');
  }
}
