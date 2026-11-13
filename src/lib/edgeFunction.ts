const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export class EdgeFunctionError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Request failed (${status})`);
    this.status = status;
  }
}

export async function postEdgeFunction(slug: string, body: Record<string, unknown>): Promise<Response> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${slug}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ANON_KEY}`,
      apikey: ANON_KEY,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new EdgeFunctionError(res.status);
  return res;
}

export async function requestEdgeFunction<T>(slug: string, body: Record<string, unknown>): Promise<T> {
  const res = await postEdgeFunction(slug, body);
  return (await res.json()) as T;
}
