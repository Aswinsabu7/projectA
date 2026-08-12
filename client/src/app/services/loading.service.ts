import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly requestCount = signal(0);
  readonly isLoading = computed(() => this.requestCount() > 0);

  show(): void {
    this.requestCount.update((c) => c + 1);
  }

  hide(): void {
    this.requestCount.update((c) => Math.max(0, c - 1));
  }
}
