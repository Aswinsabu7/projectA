import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { ChartModule } from 'primeng/chart';
import { ThemeService } from '../../services/theme.service';
import { DashboardService, DashboardCharts, DashboardWidgets } from '../../services/dashboard.service';

interface WidgetCard {
  label: string;
  value: number;
  icon: string;
  color: string;
  isCurrency?: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, CardModule, SkeletonModule, ChartModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly themeService = inject(ThemeService);

  protected readonly loadingWidgets = signal(true);
  protected readonly loadingCharts = signal(true);
  protected readonly widgets = signal<DashboardWidgets | null>(null);
  protected readonly charts = signal<DashboardCharts | null>(null);

  protected readonly widgetCards = computed<WidgetCard[]>(() => {
    const w = this.widgets();
    if (!w) return [];
    return [
      { label: 'Total Subscribers', value: w.totalSubscribers, icon: 'pi pi-users', color: '#6366f1' },
      { label: 'Active', value: w.activeSubscribers, icon: 'pi pi-check-circle', color: '#22c55e' },
      { label: 'Renewal Due', value: w.renewalDue, icon: 'pi pi-clock', color: '#f59e0b' },
      { label: 'Expired', value: w.expiredSubscribers, icon: 'pi pi-times-circle', color: '#ef4444' },
      { label: 'Expiring in 3 Days', value: w.expiringIn3Days, icon: 'pi pi-calendar', color: '#f97316' },
      { label: 'Expiring in 2 Days', value: w.expiringIn2Days, icon: 'pi pi-calendar', color: '#f97316' },
      { label: 'Expiring in 1 Day', value: w.expiringIn1Day, icon: 'pi pi-calendar', color: '#dc2626' },
      { label: 'Revenue Collected', value: w.revenueCollected, icon: 'pi pi-wallet', color: '#0ea5e9', isCurrency: true },
    ];
  });

  protected readonly platformChartData = computed(() => {
    const c = this.charts();
    if (!c) return null;
    return {
      labels: c.subscribersByPlatform.map((p) => p.platform),
      datasets: [{ data: c.subscribersByPlatform.map((p) => p.count), backgroundColor: ['#6366f1', '#ec4899'] }],
    };
  });

  protected readonly growthChartData = computed(() => {
    const c = this.charts();
    if (!c) return null;
    return {
      labels: c.monthlyGrowth.map((g) => g.label),
      datasets: [
        {
          label: 'New Subscribers',
          data: c.monthlyGrowth.map((g) => g.count),
          backgroundColor: '#6366f1',
        },
      ],
    };
  });

  protected readonly revenueChartData = computed(() => {
    const c = this.charts();
    if (!c) return null;
    return {
      labels: c.revenueTrend.map((r) => r.label),
      datasets: [
        {
          label: 'Revenue',
          data: c.revenueTrend.map((r) => r.revenue),
          fill: true,
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14,165,233,0.2)',
          tension: 0.35,
        },
      ],
    };
  });

  protected readonly chartOptions = computed(() => {
    const isDark = this.themeService.mode() === 'dark';
    const textColor = isDark ? '#e5e7eb' : '#374151';
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    return {
      plugins: { legend: { labels: { color: textColor } } },
      scales: {
        x: { ticks: { color: textColor }, grid: { color: gridColor } },
        y: { ticks: { color: textColor }, grid: { color: gridColor } },
      },
    };
  });

  ngOnInit(): void {
    this.dashboardService.getWidgets().subscribe((widgets) => {
      this.widgets.set(widgets);
      this.loadingWidgets.set(false);
    });

    this.dashboardService.getCharts(6).subscribe((charts) => {
      this.charts.set(charts);
      this.loadingCharts.set(false);
    });
  }
}
