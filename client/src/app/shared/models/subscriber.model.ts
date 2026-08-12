export type Platform = 'Instagram' | 'YouTube';
export type SubscriberStatus = 'Active' | 'Expired' | 'Renewal Due';

export interface Subscriber {
  _id: string;
  subscriberId: string;
  fullName: string;
  mobileNumber: string;
  email?: string;
  platform: Platform;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  amountPaid: number;
  remarks?: string;
  status: SubscriberStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriberImportRow {
  rowNumber: number;
  fullName: string;
  mobileNumber: string;
  email: string;
  platform: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  amountPaid: number;
  errors?: string[];
}

export interface ImportPreviewResult {
  validRows: SubscriberImportRow[];
  invalidRows: SubscriberImportRow[];
  totalRows: number;
}
