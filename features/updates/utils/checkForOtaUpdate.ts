import * as Updates from "expo-updates";

/**
 * Comprueba si hay un update OTA disponible y, de haberlo, lo descarga en segundo plano.
 *
 * Best-effort: nunca lanza. Devuelve `true` solo cuando un nuevo update quedó descargado y
 * listo para aplicarse (vía `Updates.reloadAsync()` o en el próximo cold start). En Expo Go,
 * dev client o `expo start` (`Updates.isEnabled === false`) sale temprano y devuelve `false`,
 * así el flujo de updates nunca corre en desarrollo.
 */
export async function checkForOtaUpdate(): Promise<boolean> {
  if (!Updates.isEnabled) return false;

  try {
    const result = await Updates.checkForUpdateAsync();
    if (!result.isAvailable) return false;

    await Updates.fetchUpdateAsync();
    return true;
  } catch {
    // Los updates son best-effort: sin conexión, sin credenciales o servidor caído
    // no deben romper la app. Simplemente no se ofrece update esta vez.
    return false;
  }
}
