// Mirrors nuestro-tiempo-api/src/common/constants/notification-types.ts.
// This app can't import that sibling repo, so this union must be kept in
// sync by hand whenever a notification type is added on the API side.

export const NotificationType = {
  COUPLE_JOINED: "couple_joined",
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

interface CoupleJoinedNotificationData {
  type: typeof NotificationType.COUPLE_JOINED;
  coupleId: string;
}

// Add new notification data interfaces here and include them in this union.
export type NotificationData = CoupleJoinedNotificationData;
