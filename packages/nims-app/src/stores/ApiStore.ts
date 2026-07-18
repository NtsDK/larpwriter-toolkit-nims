export class ApiStore {
  async call<T = void>(method: string, args?: unknown): Promise<T> {
    const res = await fetch(`/api/${method}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(args !== undefined ? [args] : []),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API ${method}: ${res.status} — ${text.slice(0, 200)}`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : undefined;
  }

  async get<T>(method: string, params?: Record<string, unknown>): Promise<T> {
    const query = params ? `?params=${encodeURIComponent(JSON.stringify([params]))}` : '';
    const res = await fetch(`/api/${method}${query}`, {
      credentials: 'include',
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API ${method}: ${res.status} — ${text.slice(0, 200)}`);
    }
    return res.json();
  }
}
