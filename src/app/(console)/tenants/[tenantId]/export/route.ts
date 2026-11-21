import { auth } from '@clerk/nextjs/server';
import { API_URL } from '@/lib/api/server';

/**
 * Downloads a tenant's whole database as JSON (platform admins only; the API checks
 * and audits it). Streams the API's response through, so large tenants never sit in
 * memory here.
 */
export async function GET(
  _request: Request,
  { params }: RouteContext<'/tenants/[tenantId]/export'>,
) {
  const { tenantId } = await params;
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) return Response.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const response = await fetch(
    `${API_URL}/v1/platform/tenants/${encodeURIComponent(tenantId)}/export`,
    { headers: { authorization: `Bearer ${token}` }, cache: 'no-store' },
  ).catch(() => null);
  if (!response) {
    return Response.json(
      { error: { code: 'API_UNREACHABLE', message: 'Could not reach the Raveable API.' } },
      { status: 503 },
    );
  }
  if (!response.ok || !response.body) {
    return Response.json(await response.json().catch(() => null), { status: response.status });
  }
  return new Response(response.body, {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition':
        response.headers.get('content-disposition') ?? 'attachment; filename="tenant.json"',
      'cache-control': 'no-store',
    },
  });
}
