import { albumKeys } from "@/features/albums";
import { calendarKeys, confirmCalendarEvent } from "@/features/calendar";
import { queryClient } from "@/features/common";
import { coupleKeys } from "@/features/couple";
import { imageKeys } from "@/features/images";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { NotificationAction } from "./notificationCategories";
import { NotificationData, NotificationType } from "./types";

type NotificationDataByType = {
  [T in NotificationType]: Extract<NotificationData, { type: T }>;
};

type NotificationEvent = "onReceived" | "onResponse";

type NotificationHandlerEntry<T extends NotificationType> = {
  onReceived?: (data: NotificationDataByType[T]) => void;
  onResponse?: (data: NotificationDataByType[T], actionIdentifier: string) => void;
};

type NotificationHandlerRegistry = {
  [T in NotificationType]: NotificationHandlerEntry<T>;
};

// Omitting a key here is a compile error: every NotificationType needs an entry.
const notificationHandlers: NotificationHandlerRegistry = {
  [NotificationType.COUPLE_JOINED]: {
    onReceived: () => {
      queryClient.invalidateQueries({ queryKey: coupleKeys.me() });
      router.replace("/");
    },
    onResponse: () => {
      queryClient.invalidateQueries({ queryKey: coupleKeys.me() });
      router.replace("/");
    },
  },

  [NotificationType.ALBUM_SHARED]: {
    onReceived: (data) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.list() });
      queryClient.invalidateQueries({ queryKey: albumKeys.detail(data.albumId) });
    },
    onResponse: (data) => {
      queryClient.invalidateQueries({ queryKey: albumKeys.list() });
      router.push({ pathname: "/album/[id]", params: { id: data.albumId } });
    },
  },

  [NotificationType.IMAGE_UPLOADED]: {
    onReceived: (data) => {
      queryClient.invalidateQueries({ queryKey: imageKeys.byAlbum(data.albumId) });
      queryClient.invalidateQueries({ queryKey: imageKeys.byAlbumInfinite(data.albumId) });
    },
    onResponse: (data) => {
      router.push({ pathname: "/album/[id]", params: { id: data.albumId } });
    },
  },

  [NotificationType.IMAGES_BATCH_UPLOADED]: {
    onReceived: (data) => {
      queryClient.invalidateQueries({ queryKey: imageKeys.byAlbum(data.albumId) });
      queryClient.invalidateQueries({ queryKey: imageKeys.byAlbumInfinite(data.albumId) });
    },
    onResponse: (data) => {
      router.push({ pathname: "/album/[id]", params: { id: data.albumId } });
    },
  },

  [NotificationType.EVENT_REMINDER]: {
    onReceived: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
    },
    onResponse: (data) => {
      router.push({ pathname: "/calendar/[id]", params: { id: data.eventId } });
    },
  },

  [NotificationType.EVENT_CREATED]: {
    onReceived: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
    },
    onResponse: (data) => {
      router.push({ pathname: "/calendar/[id]", params: { id: data.eventId } });
    },
  },

  [NotificationType.EVENT_UPDATED]: {
    onReceived: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
    },
    onResponse: (data) => {
      router.push({ pathname: "/calendar/[id]", params: { id: data.eventId } });
    },
  },

  [NotificationType.EVENT_PROPOSED]: {
    onReceived: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
    },
    onResponse: (data, actionIdentifier) => {
      if (actionIdentifier === NotificationAction.CONFIRM) {
        // Best-effort — this can run with the app backgrounded/killed. If it
        // doesn't reach the server (e.g. the OS drops the background task),
        // the partner can still confirm from the event detail screen; the
        // server status stays the single source of truth either way.
        confirmCalendarEvent(data.eventId)
          .catch(() => {
            console.log("doesn't send to back");
          })
          .finally(() => queryClient.invalidateQueries({ queryKey: calendarKeys.all }));
        return;
      }
      router.push({ pathname: "/calendar/[id]", params: { id: data.eventId } });
    },
  },

  [NotificationType.EVENT_CONFIRMED]: {
    onReceived: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
    },
    onResponse: (data) => {
      router.push({ pathname: "/calendar/[id]", params: { id: data.eventId } });
    },
  },

  [NotificationType.EVENT_REJECTED]: {
    onReceived: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
    },
    onResponse: (data, actionIdentifier) => {
      if (actionIdentifier === NotificationAction.EDIT) {
        router.push({ pathname: "/calendar/[id]/edit", params: { id: data.eventId } });
        return;
      }
      router.push({ pathname: "/calendar/[id]", params: { id: data.eventId } });
    },
  },
};

function isKnownNotificationType(type: unknown): type is NotificationType {
  return typeof type === "string" && (Object.values(NotificationType) as string[]).includes(type);
}

function isNotificationData(data: unknown): data is NotificationData {
  if (typeof data !== "object" || data === null || !("type" in data)) return false;
  return isKnownNotificationType((data as { type: unknown }).type);
}

function dispatch(
  data: unknown,
  event: NotificationEvent,
  actionIdentifier?: string,
  notificationId?: string,
) {
  if (!isNotificationData(data)) return;

  // The runtime guard above already correlates data.type with its registry
  // entry; TS can't express that correlation through a union-keyed lookup,
  // so it's asserted once here instead of widening every handler to accept
  // the full NotificationData union.
  const entry = notificationHandlers[data.type] as NotificationHandlerEntry<NotificationType>;
  if (event === "onResponse") {
    entry.onResponse?.(data, actionIdentifier ?? Notifications.DEFAULT_ACTION_IDENTIFIER);
    // Action-button taps (e.g. "confirm" with opensAppToForeground: false)
    // don't auto-dismiss the notification like tapping the body does — clear
    // it explicitly so it doesn't linger in the tray once handled.
    if (notificationId) {
      Notifications.dismissNotificationAsync(notificationId).catch(() => {});
    }
  } else {
    entry.onReceived?.(data);
  }
}

export function handleNotificationReceived(notification: Notifications.Notification) {
  dispatch(notification.request.content.data, "onReceived");
}

export function handleNotificationResponse(response: Notifications.NotificationResponse) {
  dispatch(
    response.notification.request.content.data,
    "onResponse",
    response.actionIdentifier,
    response.notification.request.identifier,
  );
}
