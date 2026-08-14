// Mirrors nuestro-tiempo-api/src/common/constants/notification-types.ts.
// This app can't import that sibling repo, so this union must be kept in
// sync by hand whenever a notification type is added on the API side.

export const NotificationType = {
  COUPLE_JOINED: "couple_joined",
  ALBUM_SHARED: "album_shared",
  IMAGE_UPLOADED: "image_uploaded",
  IMAGES_BATCH_UPLOADED: "images_batch_uploaded",
  EVENT_REMINDER: "event_reminder",
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

interface CoupleJoinedNotificationData {
  type: typeof NotificationType.COUPLE_JOINED;
  coupleId: string;
}

interface AlbumSharedNotificationData {
  type: typeof NotificationType.ALBUM_SHARED;
  albumId: string;
}

interface ImageUploadedNotificationData {
  type: typeof NotificationType.IMAGE_UPLOADED;
  albumId: string;
}

interface ImagesBatchUploadedNotificationData {
  type: typeof NotificationType.IMAGES_BATCH_UPLOADED;
  albumId: string;
  count: number;
}

interface EventReminderNotificationData {
  type: typeof NotificationType.EVENT_REMINDER;
  eventId: string;
}

// Add new notification data interfaces here and include them in this union.
export type NotificationData =
  | CoupleJoinedNotificationData
  | AlbumSharedNotificationData
  | ImageUploadedNotificationData
  | ImagesBatchUploadedNotificationData
  | EventReminderNotificationData;
