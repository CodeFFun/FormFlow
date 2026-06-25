const ACCESS_TOKEN_KEY = "formflow_access_token";

let inMemoryToken: string | null = null;

export function getAccessToken(): string | null {
  if (inMemoryToken) return inMemoryToken;
  if (typeof window === "undefined") return null;
  inMemoryToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  return inMemoryToken;
}

export function setAccessToken(token: string): void {
  inMemoryToken = token;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
}

export function clearAccessToken(): void {
  inMemoryToken = null;
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

export interface TokenClaims {
  userId: string;
  email?: string;
  username?: string;
  exp?: number;
}

export function decodeToken(token?: string | null): TokenClaims | null {
  const t = token ?? getAccessToken();
  if (!t) return null;
  const part = t.split(".")[1];
  if (!part) return null;
  try {
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as TokenClaims;
  } catch {
    return null;
  }
}

export function getCurrentUserId(): string | null {
  return decodeToken()?.userId ?? null;
}
