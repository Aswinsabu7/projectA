import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { SettingsService } from '../../services/settings.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TabsModule,
    InputTextModule,
    InputNumberModule,
    PasswordModule,
    SelectModule,
    ToggleSwitchModule,
    ButtonModule,
    ToastModule,
  ],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(SettingsService);
  private readonly notificationService = inject(NotificationService);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);

  protected readonly whatsappProviderOptions = [
    { label: 'Meta WhatsApp Cloud API', value: 'meta' },
    { label: 'Twilio', value: 'twilio' },
  ];

  protected readonly themeOptions = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ];

  protected readonly form = this.fb.nonNullable.group({
    theme: this.fb.nonNullable.group({
      defaultTheme: this.fb.nonNullable.control<'light' | 'dark'>('light'),
      allowUserToggle: [true],
    }),
    whatsapp: this.fb.nonNullable.group({
      provider: this.fb.nonNullable.control<'meta' | 'twilio'>('meta'),
      enabled: [false],
      metaToken: [''],
      metaPhoneNumberId: [''],
      twilioAccountSid: [''],
      twilioAuthToken: [''],
      twilioFrom: [''],
    }),
    smtp: this.fb.nonNullable.group({
      host: [''],
      port: [587],
      secure: [false],
      user: [''],
      password: [''],
      from: [''],
    }),
    passwordPolicy: this.fb.nonNullable.group({
      minLength: [8, [Validators.required, Validators.min(6)]],
      requireUppercase: [true],
      requireNumber: [true],
      requireSpecialChar: [false],
      expiryDays: [90],
    }),
    tokenExpiry: this.fb.nonNullable.group({
      accessTokenMinutes: [15, Validators.required],
      refreshTokenDays: [7, Validators.required],
    }),
    reminder: this.fb.nonNullable.group({
      cronSchedule: ['0 9 * * *', Validators.required],
      timezone: ['Asia/Kolkata', Validators.required],
    }),
  });

  ngOnInit(): void {
    this.settingsService.get().subscribe({
      next: (settings) => {
        this.form.patchValue({
          theme: settings.theme,
          whatsapp: settings.whatsapp,
          smtp: settings.smtp,
          passwordPolicy: settings.passwordPolicy,
          tokenExpiry: settings.tokenExpiry,
          reminder: { cronSchedule: settings.reminder.cronSchedule, timezone: settings.reminder.timezone },
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const value = this.form.getRawValue();

    this.settingsService.update({ ...value, reminder: { ...value.reminder, daysBefore: [3, 2, 1] } }).subscribe({
      next: () => {
        this.saving.set(false);
        this.notificationService.success('Settings updated successfully');
      },
      error: () => this.saving.set(false),
    });
  }
}
