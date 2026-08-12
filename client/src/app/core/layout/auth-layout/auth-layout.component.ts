import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-layout">
      <div class="auth-card">
        <div class="auth-brand">
          <i class="pi pi-users" style="font-size: 2rem;"></i>
          <h1>projectA</h1>
          <p>Subscriber &amp; Renewal Management</p>
        </div>
        <router-outlet />
      </div>
    </div>
  `,
  styles: [
    `
      .auth-layout {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--p-primary-color, #6366f1) 0%, var(--p-surface-900, #1e1e2f) 100%);
        padding: 1rem;
      }
      .auth-card {
        width: 100%;
        max-width: 420px;
        background: var(--p-content-background);
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
      }
      .auth-brand {
        text-align: center;
        margin-bottom: 1.5rem;
      }
      .auth-brand h1 {
        margin: 0.5rem 0 0.25rem;
        font-size: 1.5rem;
      }
      .auth-brand p {
        margin: 0;
        color: var(--p-text-muted-color);
        font-size: 0.9rem;
      }
    `,
  ],
})
export class AuthLayoutComponent {}
