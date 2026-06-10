import axios, { type AxiosError } from "axios";

const DEFAULT_API_BASE_URL = "http://localhost:3000";

export type AuthAwareAxiosConfig = {
  skipAuthRedirect?: boolean;
};

export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? "" : DEFAULT_API_BASE_URL);

if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  throw new Error("VITE_API_URL must be configured for production builds");
}

const normalizedBaseUrl = API_BASE_URL.replace(/\/+$/, "");
const baseURL = normalizedBaseUrl.endsWith("/api")
  ? normalizedBaseUrl.slice(0, -"/api".length)
  : normalizedBaseUrl;

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

type ApiErrorBody = {
  message?: string;
  error?: string;
};

let isHandlingUnauthorized = false;

function getMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object") {
    const body = data as ApiErrorBody;
    return body.message ?? body.error ?? fallback;
  }
  return fallback;
}

function emitAuthEvent(name: "api:unauthorized" | "api:forbidden", message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(name, { detail: { message } }));
}

function clearClientState() {
  localStorage.clear();
  sessionStorage.clear();
}

function handleUnauthorized(error: AxiosError) {
  if (typeof window === "undefined" || isHandlingUnauthorized) return;

  const requestUrl = error.config?.url ?? "";
  const authConfig = error.config as AuthAwareAxiosConfig | undefined;
  if (
    requestUrl.includes("/auth/login") ||
    requestUrl.includes("/auth/logout") ||
    authConfig?.skipAuthRedirect
  ) {
    return;
  }

  isHandlingUnauthorized = true;
  const message = getMessage(error.response?.data, "Sesion expirada. Inicia sesion nuevamente.");

  emitAuthEvent("api:unauthorized", message);
  void axios.post(`${baseURL}/api/auth/logout`, undefined, { withCredentials: true }).catch(() => undefined);
  clearClientState();
  window.location.href = "/login";
}

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      handleUnauthorized(error);
    }

    if (error.response?.status === 403) {
      emitAuthEvent(
        "api:forbidden",
        getMessage(error.response.data, "No tienes permisos para realizar esta accion.")
      );
    }

    if (error?.response?.data) {
      console.warn("Error en la respuesta:", error.response.data);
    } else {
      console.warn("Error desconocido:", error);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
