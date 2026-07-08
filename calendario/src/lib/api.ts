const REQUEST_TIMEOUT = 15_000;

async function request(path: string, init: RequestInit = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(path, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
      signal: controller.signal,
      ...init,
    });

    let body: any = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }

    if (!res.ok) {
      const err = new Error('request_failed');
      (err as any).status = res.status;
      (err as any).body = body;
      throw err;
    }
    return body;
  } finally {
    clearTimeout(timer);
  }
}

export const apiGet = <T = any>(path: string) => request(path) as Promise<T>;
export const apiPost = <T = any>(path: string, data?: any) =>
  request(path, { method: 'POST', body: JSON.stringify(data ?? {}) }) as Promise<T>;
export const apiPatch = <T = any>(path: string, data?: any) =>
  request(path, { method: 'PATCH', body: JSON.stringify(data ?? {}) }) as Promise<T>;
export const apiDel = <T = any>(path: string, data?: any) =>
  request(path, { method: 'DELETE', body: data ? JSON.stringify(data) : undefined }) as Promise<T>;
