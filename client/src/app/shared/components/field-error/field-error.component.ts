import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/**
 * Renders a small red validation message below a form field when the bound
 * control is invalid and has been touched (e.g. after the user blurs the
 * field, or after a failed form submit calls `markAllAsTouched()`).
 */
@Component({
  selector: 'app-field-error',
  standalone: true,
  template: `
    @if (errorMessage(); as message) {
      <small class="p-error field-error">{{ message }}</small>
    }
  `,
  styles: [
    `
      .field-error {
        display: block;
        margin-top: 0.25rem;
        color: var(--p-red-500, #ef4444);
      }
    `,
  ],
})
export class FieldErrorComponent {
  @Input({ required: true }) control!: AbstractControl | null;
  @Input() label = 'This field';

  errorMessage(): string | null {
    const control = this.control;
    if (!control || !control.invalid || !(control.touched || control.dirty)) return null;

    const errors = control.errors;
    if (!errors) return null;

    if (errors['required']) return `${this.label} is required`;
    if (errors['email']) return 'Enter a valid email address';
    if (errors['pattern']) return `${this.label} format is invalid`;
    if (errors['minlength']) return `${this.label} must be at least ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `${this.label} must be at most ${errors['maxlength'].requiredLength} characters`;
    if (errors['min']) return `${this.label} must be at least ${errors['min'].min}`;
    if (errors['max']) return `${this.label} must be at most ${errors['max'].max}`;

    return `${this.label} is invalid`;
  }
}
