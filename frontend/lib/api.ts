import { getAccessToken, setAccessToken, clearAccessToken } from "./auth";

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080") + "/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  raw?: boolean;
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${BASE}/auth/refresh-token`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) return false;
        const json = await res.json().catch(() => null);
        const token = json?.data?.accessToken;
        if (token) setAccessToken(token);
        return true;
      } catch {
        return false;
      } finally {
        setTimeout(() => {
          refreshPromise = null;
        }, 0);
      }
    })();
  }
  return refreshPromise;
}

async function request<T>(
  path: string,
  options: ApiOptions = {},
  isRetry = false,
): Promise<T> {
  const token = getAccessToken();
  const { body, raw, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    ...(raw ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: finalHeaders,
    credentials: "include",
    body: raw ? (body as BodyInit) : body != null ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !isRetry) {
    const refreshed = await refreshToken();
    if (refreshed) return request<T>(path, options, true);
    clearAccessToken();
    throw new ApiError("Your session has expired. Please sign in again.", 401);
  }

  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
  }

  const payload = json as
    | { success?: boolean; message?: string; data?: T; items?: T }
    | null;

  if (!res.ok || (payload && payload.success === false)) {
    const message =
      payload?.message || `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status);
  }

  if (payload && "data" in payload && payload.data !== undefined) {
    return payload.data as T;
  }
  if (payload && "items" in payload) {
    return payload as unknown as T;
  }
  return payload as unknown as T;
}

export interface Paginated<T> {
  success: boolean;
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export const api = {
  get: <T>(path: string, options?: ApiOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: ApiOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: ApiOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  put: <T>(path: string, body?: unknown, options?: ApiOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  delete: <T>(path: string, options?: ApiOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
  upload: <T>(path: string, formData: FormData, method: "POST" | "PATCH" = "POST") =>
    request<T>(path, { method, body: formData, raw: true }),
};

export const fetcher = <T>(path: string) => api.get<T>(path);
