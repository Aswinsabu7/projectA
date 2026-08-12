export type MessageType = 'REMINDER_3_DAYS' | 'REMINDER_2_DAYS' | 'REMINDER_1_DAY' | 'EXPIRED' | 'MANUAL';
export type MessageStatus = 'Pending' | 'Sent' | 'Failed';

export interface MessageHistory {
  _id: string;
  subscriber: { _id: string; subscriberId: string; fullName: string; mobileNumber: string; platform: string } | string;
  mobileNumber: string;
  messageDate: string;
  messageType: MessageType;
  messageContent: string;
  status: MessageStatus;
  provider: string;
  createdBy?: { username: string; firstName: string; lastName: string } | null;
  createdAt?: string;
}
