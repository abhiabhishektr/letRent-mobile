import axios from "axios";
import Constants from "expo-constants";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  Constants.expoConfig?.extra?.apiBaseUrl ??
  "http://13.235.78.162:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    Accept: "application/json",
  },
});

export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; detail?: string; error?: string } | undefined;
    const apiMessage = data?.message ?? data?.detail ?? data?.error;

    if (typeof apiMessage === "string" && apiMessage.trim()) {
      return apiMessage;
    }

    if (error.code === "ECONNABORTED") {
      return "The request timed out. Please try again.";
    }

    if (!error.response) {
      return "Network error. Please check your connection and try again.";
    }

    if (error.response.status >= 500) {
      return "Server error. Please try again later.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
