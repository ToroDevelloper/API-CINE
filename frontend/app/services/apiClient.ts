import type { AxiosRequestConfig } from "axios";
import axiosInstance from "./axiosInstance";

export type ApiErrorPayload = {
  success?: false;
  message?: string;
  errors?: unknown;
};

type ApiFetchOptions = Omit<RequestInit, "body" | "headers"> & {
  headers?: Record<string, string>;
  json?: unknown;
  body?: any;
  params?: Record<string, unknown>;
};

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();

  const config: AxiosRequestConfig = {
    url: path,
    method: method as AxiosRequestConfig["method"],
    headers: options.headers,
    params: options.params,
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
  } catch (error: any) {
    const payload = error?.response?.data as ApiErrorPayload | undefined;
    const message = payload?.message ?? error?.message ?? "Error de red";
    throw new Error(message);
  }
}

