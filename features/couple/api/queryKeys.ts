export const coupleKeys = {
  all: ["couple"] as const,
  me: () => ["couple", "me"] as const,
};
