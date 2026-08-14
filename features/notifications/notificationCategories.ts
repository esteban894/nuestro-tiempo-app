import * as Notifications from "expo-notifications";

export const NotificationCategory = {
  EVENT_PROPOSAL: "event_proposal",
  EVENT_REJECTED: "event_rejected",
  EVENT_CHANGE: "event_change",
} as const;

export const NotificationAction = {
  CONFIRM: "confirm",
  DETAILS: "details",
  EDIT: "edit",
} as const;

Notifications.setNotificationCategoryAsync(NotificationCategory.EVENT_PROPOSAL, [
  {
    identifier: NotificationAction.CONFIRM,
    buttonTitle: "Me apunto",
    options: { opensAppToForeground: false },
  },
  {
    identifier: NotificationAction.DETAILS,
    buttonTitle: "Ver detalles",
    options: { opensAppToForeground: true },
  },
]);

Notifications.setNotificationCategoryAsync(NotificationCategory.EVENT_REJECTED, [
  {
    identifier: NotificationAction.EDIT,
    buttonTitle: "Editar",
    options: { opensAppToForeground: true },
  },
]);

// A plain change notice — never offers "Me apunto", since there's no pending
// proposal to confirm (already-confirmed appointment tweak, or an
// important_date edit, which never had proposal semantics).
Notifications.setNotificationCategoryAsync(NotificationCategory.EVENT_CHANGE, [
  {
    identifier: NotificationAction.DETAILS,
    buttonTitle: "Ver detalles",
    options: { opensAppToForeground: true },
  },
]);
