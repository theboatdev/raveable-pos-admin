import 'server-only';
import { refresh } from 'next/cache';
import { ApiError, type ActionState, toActionState } from '@/lib/api/errors';

/**
 * Runs an API mutation for a Server Action: API errors become form state, success
 * refreshes the page's data. Anything else (including redirects) propagates.
 */
export async function attempt(
  mutation: () => Promise<unknown>,
  successMessage?: string,
): Promise<ActionState> {
  try {
    await mutation();
  } catch (error) {
    if (error instanceof ApiError) return toActionState(error);
    throw error;
  }
  refresh();
  return { ok: true, message: successMessage, at: Date.now() };
}

/** Trimmed text field, '' when missing. */
export const text = (form: FormData, name: string) => String(form.get(name) ?? '').trim();

/** Whole number field, or NaN so the API reports it as invalid. */
export const integer = (form: FormData, name: string) => {
  const value = text(form, name);
  return value === '' ? Number.NaN : Number(value);
};

export const invalid = (fieldErrors: Record<string, string>): ActionState => ({
  ok: false,
  message: 'Some fields are missing or invalid.',
  fieldErrors,
});
