import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

/**
 * Structural directive that renders its host template only if the current user
 * holds the given permission(s). Usage:
 *   <button *appHasPermission="'SUBSCRIBER_CREATE'">Add</button>
 *   <button *appHasPermission="['SUBSCRIBER_EDIT','SUBSCRIBER_DELETE']; any: true">...</button>
 */
@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authService = inject(AuthService);

  private permissions: string[] = [];
  private matchAny = false;
  private hasView = false;

  @Input() set appHasPermission(value: string | string[]) {
    this.permissions = Array.isArray(value) ? value : [value];
    this.updateView();
  }

  @Input() set appHasPermissionAny(value: boolean) {
    this.matchAny = value;
    this.updateView();
  }

  constructor() {
    effect(() => {
      this.authService.currentUser();
      this.updateView();
    });
  }

  private updateView(): void {
    const allowed = !this.permissions.length
      ? true
      : this.matchAny
        ? this.authService.hasAnyPermission(this.permissions)
        : this.permissions.every((p) => this.authService.hasPermission(p));

    if (allowed && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!allowed && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
