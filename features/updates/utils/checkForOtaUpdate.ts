import * as Updates from "expo-updates";

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
