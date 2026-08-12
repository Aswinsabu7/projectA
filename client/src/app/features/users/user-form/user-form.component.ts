import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { UserService } from '../../../services/user.service';
import { RoleService } from '../../../services/role.service';
import { NotificationService } from '../../../services/notification.service';
import { AppUser } from '../../../shared/models/user.model';
import { Role } from '../../../shared/models/role.model';
import { FieldErrorComponent } from '../../../shared/components/field-error/field-error.component';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, PasswordModule, SelectModule, ButtonModule, FieldErrorComponent],
  templateUrl: './user-form.component.html',
})
export class UserFormComponent implements OnInit {
  @Input() user: AppUser | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly notificationService = inject(NotificationService);

  protected readonly saving = signal(false);
  protected readonly roles = signal<Role[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    mobile: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]{7,15}$/)]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: [''],
    role: ['', Validators.required],
  });

  ngOnInit(): void {
    this.roleService.getActiveRoles().subscribe((roles) => this.roles.set(roles));

    if (this.user) {
      this.form.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        mobile: this.user.mobile,
        username: this.user.username,
        role: typeof this.user.role === 'string' ? this.user.role : this.user.role?._id,
      });
      this.form.controls.username.disable();
      this.form.controls.password.clearValidators();
    } else {
      this.form.controls.password.setValidators([Validators.required, Validators.minLength(8)]);
    }
    this.form.controls.password.updateValueAndValidity();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const value = this.form.getRawValue();

    const request$ = this.user
      ? this.userService.update(this.user._id, {
          firstName: value.firstName,
          lastName: value.lastName,
          email: value.email,
          mobile: value.mobile,
          role: value.role,
        })
      : this.userService.create({
          firstName: value.firstName,
          lastName: value.lastName,
          email: value.email,
          mobile: value.mobile,
          username: value.username,
          role: value.role,
          password: value.password,
        });

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.notificationService.success(this.user ? 'User updated successfully' : 'User created successfully');
        this.saved.emit();
      },
      error: () => this.saving.set(false),
    });
  }
}
