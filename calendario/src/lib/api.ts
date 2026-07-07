async function request(path: string, init: RequestInit = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    ...init,
  });

  let body: any = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const err = new Error(body?.error || `HTTP ${res.status}`);
    (err as any).status = res.status;
    (err as any).body = body;
    throw err;
  }
  return body;
}

export const apiGet = <T = any>(path: string) => request(path) as Promise<T>;
export const apiPost = <T = any>(path: string, data?: any) =>
  request(path, { method: 'POST', body: JSON.stringify(data ?? {}) }) as Promise<T>;
export const apiPatch = <T = any>(path: string, data?: any) =>
  request(path, { method: 'PATCH', body: JSON.stringify(data ?? {}) }) as Promise<T>;
export const apiDel = <T = any>(path: string, data?: any) =>
  request(path, { method: 'DELETE', body: data ? JSON.stringify(data) : undefined }) as Promise<T>;
