import type { AxiosRequestConfig } from "axios";
import axiosInstance, { type AuthAwareAxiosConfig } from "./axiosInstance";

export type ApiErrorPayload = {
  success?: false;
  message?: string;
  error?: string;
  errors?: unknown;
};

export class ApiRequestError extends Error {
  status?: number;
  payload?: ApiErrorPayload;

  constructor(message: string, options: { status?: number; payload?: ApiErrorPayload; cause?: unknown } = {}) {
    super(message, { cause: options.cause });
    this.name = "ApiRequestError";
    this.status = options.status;
    this.payload = options.payload;
  }
}

type ApiFetchOptions = Omit<RequestInit, "body" | "headers"> & {
  headers?: Record<string, string>;
  json?: unknown;
  body?: BodyInit | null;
  params?: Record<string, unknown>;
  skipAuthRedirect?: boolean;
};

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();

  const config: AxiosRequestConfig & AuthAwareAxiosConfig = {
    url: path,
    method: method as AxiosRequestConfig["method"],
    headers: options.headers,
    params: options.params,
    skipAuthRedirect: options.skipAuthRedirect,
  };

  if (options.json !== undefined) {
    config.data = options.json;
    config.headers = { "Content-Type": "application/json", ...(config.headers ?? {}) };
  } else if (options.body !== undefined) {
    config.data = options.body;
  }

  try {
    const response = await axiosInstance.request<T>(config);
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as { response?: { status?: number; data?: ApiErrorPayload }; message?: string };
    const payload = axiosError?.response?.data;
    const message = payload?.message ?? payload?.error ?? axiosError?.message ?? "Error de red";
    throw new ApiRequestError(message, {
      status: axiosError?.response?.status,
      payload,
      cause: error,
    });
  }
}
