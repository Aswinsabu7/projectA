export interface AppSettings {
  _id?: string;
  key: string;
  theme: { defaultTheme: 'light' | 'dark'; allowUserToggle: boolean };
  whatsapp: {
    provider: 'meta' | 'twilio';
    enabled: boolean;
    metaToken: string;
    metaPhoneNumberId: string;
    twilioAccountSid: string;
    twilioAuthToken: string;
    twilioFrom: string;
  };
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    from: string;
  };
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumber: boolean;
    requireSpecialChar: boolean;
    expiryDays: number;
  };
  tokenExpiry: {
    accessTokenMinutes: number;
    refreshTokenDays: number;
  };
  reminder: {
    cronSchedule: string;
    timezone: string;
    daysBefore: number[];
  };
}
