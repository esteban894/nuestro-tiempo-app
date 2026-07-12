import Toast from "react-native-toast-message";
import { ApiError, isNetworkError } from "../../../api/httpClient";

const FALLBACK_MESSAGE = "Ocurrió un error inesperado.";

/** Classifies an error thrown by the API layer and surfaces it as a themed toast. */
export function showErrorToast(error: unknown) {
  if (isNetworkError(error)) {
    Toast.show({ type: "error", text1: "Sin conexión", text2: error.message });
    return;
  }

  if (error instanceof ApiError) {
    Toast.show({ type: "error", text1: "Error", text2: error.message });
    return;
  }

  Toast.show({ type: "error", text1: "Error", text2: FALLBACK_MESSAGE });
}
