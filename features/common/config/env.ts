const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL no está definida. Copia .env.example a .env y configúrala antes de iniciar la app.",
  );
}

export const env = {
  API_URL,
} as const;
