import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { RoleService } from '../../../services/role.service';
import { NotificationService } from '../../../services/notification.service';
import { Permission, Role } from '../../../shared/models/role.model';
import { FieldErrorComponent } from '../../../shared/components/field-error/field-error.component';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    CheckboxModule,
    ButtonModule,
    FieldErrorComponent,
  ],
  templateUrl: './role-form.component.html',
})
export class RoleFormComponent implements OnInit {
  @Input() role: Role | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly roleService = inject(RoleService);
  private readonly notificationService = inject(NotificationService);

  protected readonly saving = signal(false);
  protected readonly groupedPermissions = signal<Record<string, Permission[]>>({});
  protected readonly selectedPermissionKeys = signal<Set<string>>(new Set());

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
  });

  ngOnInit(): void {
    this.roleService.getPermissionsGrouped().subscribe((grouped) => this.groupedPermissions.set(grouped));

    if (this.role) {
      this.form.patchValue({ name: this.role.name, description: this.role.description });
      if (this.role.isSystemRole) this.form.controls.name.disable();

      const keys = (this.role.permissions as (Permission | string)[]).map((p) => (typeof p === 'string' ? p : p.key));
      this.selectedPermissionKeys.set(new Set(keys));
    }
  }

  groupKeys(): string[] {
    return Object.keys(this.groupedPermissions());
  }

  isChecked(permission: Permission): boolean {
    return this.selectedPermissionKeys().has(permission.key);
  }

  togglePermission(permission: Permission, checked: boolean): void {
    const updated = new Set(this.selectedPermissionKeys());
    if (checked) {
      updated.add(permission.key);
    } else {
      updated.delete(permission.key);
    }
    this.selectedPermissionKeys.set(updated);
  }

  toggleGroup(group: string, checked: boolean): void {
    const updated = new Set(this.selectedPermissionKeys());
    for (const permission of this.groupedPermissions()[group] || []) {
      if (checked) updated.add(permission.key);
      else updated.delete(permission.key);
    }
    this.selectedPermissionKeys.set(updated);
  }

  isGroupFullyChecked(group: string): boolean {
    const perms = this.groupedPermissions()[group] || [];
    return perms.length > 0 && perms.every((p) => this.selectedPermissionKeys().has(p.key));
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const value = this.form.getRawValue();
    const permissions = Array.from(this.selectedPermissionKeys());

    const request$ = this.role
      ? this.roleService.update(this.role._id, { name: value.name, description: value.description })
      : this.roleService.create({ name: value.name, description: value.description, permissions });

    request$.subscribe({
      next: () => {
        if (this.role) {
          this.roleService.assignPermissions(this.role._id, permissions).subscribe({
            next: () => this.finishSave(),
            error: () => this.saving.set(false),
          });
        } else {
          this.finishSave();
        }
      },
      error: () => this.saving.set(false),
    });
  }

  private finishSave(): void {
    this.saving.set(false);
    this.notificationService.success(this.role ? 'Role updated successfully' : 'Role created successfully');
    this.saved.emit();
  }
}
