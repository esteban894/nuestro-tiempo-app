import { i18n } from "@/features/i18n";
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

function registerNotificationCategories() {
  Notifications.setNotificationCategoryAsync(NotificationCategory.EVENT_PROPOSAL, [
    {
      identifier: NotificationAction.CONFIRM,
      buttonTitle: i18n.t("notifications.actions.confirm"),
      options: { opensAppToForeground: false },
    },
    {
      identifier: NotificationAction.DETAILS,
      buttonTitle: i18n.t("notifications.actions.details"),
      options: { opensAppToForeground: true },
    },
  ]);

  Notifications.setNotificationCategoryAsync(NotificationCategory.EVENT_REJECTED, [
    {
      identifier: NotificationAction.EDIT,
      buttonTitle: i18n.t("notifications.actions.edit"),
      options: { opensAppToForeground: true },
    },
  ]);

  Notifications.setNotificationCategoryAsync(NotificationCategory.EVENT_CHANGE, [
    {
      identifier: NotificationAction.DETAILS,
      buttonTitle: i18n.t("notifications.actions.details"),
      options: { opensAppToForeground: true },
    },
  ]);
}

registerNotificationCategories();
i18n.on("languageChanged", registerNotificationCategories);
