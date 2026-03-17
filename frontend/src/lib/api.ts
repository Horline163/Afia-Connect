import { getAuthToken } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api";

function buildUrl(path: string) {
  const base = API_BASE_URL.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

type ApiRequestOptions = RequestInit & {
  raw?: boolean;
};

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const token = getAuthToken();
  const headers = new Headers(options.headers ?? {});
  let body = options.body;

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (body && typeof body === "object" && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
    body,
  });

  const text = await response.text();
  let payload: ApiResponse<T> | null = null;
  if (text) {
    try {
      payload = JSON.parse(text) as ApiResponse<T>;
    } catch (error) {
      payload = null;
    }
  }

  if (!response.ok || (payload && payload.success === false)) {
    const message = payload?.message ?? response.statusText ?? "Request failed";
    throw new ApiError(message, response.status, payload);
  }

  return payload as ApiResponse<T>;
}

export async function apiData<T>(path: string, options?: ApiRequestOptions) {
  const response = await apiRequest<T>(path, options);
  return response.data;
}
