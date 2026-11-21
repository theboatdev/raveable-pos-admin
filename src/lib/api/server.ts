import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';
import { ApiError } from './errors';
import type { Staff } from './types';

export const API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
}

/**
 * Calls /v1/platform as the signed-in staff member. The API checks staff status and
 * audits the call; this console's own checks are only for a tidy UI.
 */
export async function platformApi<T>(path: string, { method = 'GET', body }: RequestOptions = {}) {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) redirect('/sign-in');

  let response: Response;
  try {
    response = await fetch(`${API_URL}/v1/platform${path}`, {
      method,
      headers: {
        authorization: `Bearer ${token}`,
        ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
    });
  } catch {
    throw new ApiError(503, 'API_UNREACHABLE', 'Could not reach the Raveable API. Is it running?');
  }

  if (response.status === 204) return undefined as T;
  const json = (await response.json().catch(() => null)) as
    | (T & { error?: { code: string; message: string; details?: unknown; requestId?: string } })
    | null;
  if (response.ok) return json as T;

  const error = json?.error;
  if (error?.code === 'NOT_PLATFORM_STAFF') redirect('/no-access');
  if (response.status === 401) redirect('/sign-in');
  throw new ApiError(
    response.status,
    error?.code ?? 'UNKNOWN',
    error?.message ?? `Request failed with status ${response.status}.`,
    error?.details,
    error?.requestId,
  );
}

/** The signed-in staff member. Fetched once per request; not audited by the API. */
export const getStaff = cache(() => platformApi<Staff>('/me'));

/**
 * Reads something about one tenant: unknown tenants and records are a 404 page, and a
 * tenant whose data was deleted sends you to its overview, which explains.
 */
export async function tenantRead<T>(tenantId: string, path = ''): Promise<T> {
  try {
    return await platformApi<T>(`/tenants/${encodeURIComponent(tenantId)}${path}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.code === 'TENANT_DATA_DELETED') {
      redirect(`/tenants/${encodeURIComponent(tenantId)}`);
    }
    throw error;
  }
}
