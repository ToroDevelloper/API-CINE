const DEFAULT_API_BASE_URL = "http://localhost:3000";

export const API_BASE_URL: string =
  (import.meta as any).env?.VITE_API_URL ?? DEFAULT_API_BASE_URL;

export type ApiErrorPayload = {
  success?: false;
  message?: string;
  errors?: unknown;
};

export async function apiFetch<T>(
  path: string,
  options: (RequestInit & { json?: unknown }) = {}
): Promise<T> {
  const url = path.startsWith("http")
    ? path
    : `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers = new Headers(options.headers);

  let body: BodyInit | undefined = options.body as BodyInit | undefined;
  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.json);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body,
    credentials: "include",
  });

  if (response.ok) {
    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  }

  let message = `Error HTTP ${response.status}`;
  try {
    const payload = (await response.json()) as ApiErrorPayload;
    if (payload?.message) message = payload.message;
  } catch {
    // ignore
  }

  throw new Error(message);
}
