const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

export async function apiJson<T = any>(path: string, init: RequestInit = {}): Promise<{ ok: boolean; data?: T; error?: string }>{
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        ...(init.headers || {}),
        ...(init.body ? { "Content-Type": "application/json" } : {}),
      },
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || (data && data.ok === false)) {
      const msg = (data && (data.message || data.error)) || `Error ${res.status}`;
      return { ok: false, error: msg };
    }
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: "Network error" };
  }
}

export async function apiMultipart<T = any>(path: string, formData: FormData): Promise<{ ok: boolean; data?: T; error?: string }>{
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || (data && data.ok === false)) {
      const msg = (data && (data.message || data.error)) || `Error ${res.status}`;
      return { ok: false, error: msg };
    }
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: "Network error" };
  }
}