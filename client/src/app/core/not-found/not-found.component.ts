import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, ButtonModule],
  template: `
    <div class="status-page">
      <i class="pi pi-exclamation-circle"></i>
      <h1>404</h1>
      <p>The page you are looking for does not exist.</p>
      <button pButton type="button" label="Go to Dashboard" icon="pi pi-home" routerLink="/dashboard"></button>
    </div>
  `,
  styles: [
    `
      .status-page {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        text-align: center;
      }
      i {
        font-size: 3rem;
        color: var(--p-primary-color);
      }
      h1 {
        font-size: 3rem;
        margin: 0;
      }
      p {
        color: var(--p-text-muted-color);
        margin-bottom: 1rem;
      }
    `,
  ],
})
export class NotFoundComponent {}
