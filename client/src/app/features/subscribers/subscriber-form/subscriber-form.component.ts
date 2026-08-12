import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { SubscriberService } from '../../../services/subscriber.service';
import { NotificationService } from '../../../services/notification.service';
import { Platform, Subscriber } from '../../../shared/models/subscriber.model';
import { FieldErrorComponent } from '../../../shared/components/field-error/field-error.component';

@Component({
  selector: 'app-subscriber-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    DatePickerModule,
    TextareaModule,
    ButtonModule,
    FieldErrorComponent,
  ],
  templateUrl: './subscriber-form.component.html',
})
export class SubscriberFormComponent implements OnInit {
  @Input() subscriber: Subscriber | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly subscriberService = inject(SubscriberService);
  private readonly notificationService = inject(NotificationService);

  protected readonly saving = signal(false);

  protected readonly platformOptions = [
    { label: 'YouTube', value: 'YouTube' },
    { label: 'Instagram', value: 'Instagram' },
  ];

  protected readonly form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]{7,15}$/)]],
    email: [''],
    platform: ['YouTube', Validators.required],
    subscriptionStartDate: [new Date(), Validators.required],
    subscriptionEndDate: [
      new Date(new Date().setMonth(new Date().getMonth() + 1)),
      Validators.required,
    ],
    amountPaid: [0, [Validators.required, Validators.min(0)]],
    remarks: [''],
  });

  ngOnInit(): void {
    if (this.subscriber) {
      this.form.patchValue({
        fullName: this.subscriber.fullName,
        mobileNumber: this.subscriber.mobileNumber,
        email: this.subscriber.email || '',
        platform: this.subscriber.platform,
        subscriptionStartDate: new Date(this.subscriber.subscriptionStartDate),
        subscriptionEndDate: new Date(this.subscriber.subscriptionEndDate),
        amountPaid: this.subscriber.amountPaid,
        remarks: this.subscriber.remarks || '',
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const value = this.form.getRawValue();
    const payload: Partial<Subscriber> = {
      ...value,
      platform: value.platform as Platform,
      subscriptionStartDate: value.subscriptionStartDate.toISOString(),
      subscriptionEndDate: value.subscriptionEndDate.toISOString(),
    };

    const request$ = this.subscriber
      ? this.subscriberService.update(this.subscriber._id, payload)
      : this.subscriberService.create(payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.notificationService.success(this.subscriber ? 'Subscriber updated successfully' : 'Subscriber created successfully');
        this.saved.emit();
      },
      error: () => this.saving.set(false),
    });
  }
}
