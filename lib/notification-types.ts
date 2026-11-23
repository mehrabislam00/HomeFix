export const NOTIFICATIONS_UPDATED_EVENT = "homefix:notifications-updated"

export type NotificationRole = "customer" | "technician" | "admin"

export type NotificationType =
  | "user_registered"
  | "booking_created"
  | "booking_updated"
  | "booking_cancelled"
  | "service_submitted"
  | "service_decision"
  | "service_removed"
  | "account_update"
  | "payment_processing"
  | "payment_completed"
  | "payment_issue"
