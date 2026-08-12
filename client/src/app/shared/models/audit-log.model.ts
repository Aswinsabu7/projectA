export interface AuditLog {
  _id: string;
  action: string;
  module: string;
  entityId?: string;
  description: string;
  performedByUsername: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}
