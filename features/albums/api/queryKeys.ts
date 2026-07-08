export const albumKeys = {
  all: ["albums"] as const,
  list: () => ["albums", "list"] as const,
  detail: (id: string) => ["albums", "detail", id] as const,
  current: () => ["albums", "current"] as const,
};
