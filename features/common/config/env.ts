const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL no está definida. Copia .env.example a .env y configúrala antes de iniciar la app.",
  );
}

/** Configuración de entorno validada al cargar el módulo (falla temprano si falta algo). */
export const env = {
  API_URL,
} as const;
