import { albumKeys } from "@/features/albums";
import { calendarKeys } from "@/features/calendar";
import { queryClient } from "@/features/common";
import { coupleKeys } from "@/features/couple";
import { imageKeys } from "@/features/images";
import type * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { NotificationData, NotificationType } from "./types";

type NotificationDataByType = {
  [T in NotificationType]: Extract<NotificationData, { type: T }>;
};

type NotificationEvent = "onReceived" | "onResponse";

type NotificationHandlerEntry<T extends NotificationType> = {
  onReceived?: (data: NotificationDataByType[T]) => void;
  onResponse?: (data: NotificationDataByType[T]) => void;
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
};

function isKnownNotificationType(type: unknown): type is NotificationType {
  return typeof type === "string" && (Object.values(NotificationType) as string[]).includes(type);
}

function isNotificationData(data: unknown): data is NotificationData {
  if (typeof data !== "object" || data === null || !("type" in data)) return false;
  return isKnownNotificationType((data as { type: unknown }).type);
}

function dispatch(data: unknown, event: NotificationEvent) {
  if (!isNotificationData(data)) return;

  // The runtime guard above already correlates data.type with its registry
  // entry; TS can't express that correlation through a union-keyed lookup,
  // so it's asserted once here instead of widening every handler to accept
  // the full NotificationData union.
  const entry = notificationHandlers[data.type] as NotificationHandlerEntry<NotificationType>;
  entry[event]?.(data);
}

export function handleNotificationReceived(notification: Notifications.Notification) {
  dispatch(notification.request.content.data, "onReceived");
}

export function handleNotificationResponse(response: Notifications.NotificationResponse) {
  dispatch(response.notification.request.content.data, "onResponse");
}
