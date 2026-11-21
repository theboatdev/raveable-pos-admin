/** An error response from the API, or the API being unreachable. Safe to import anywhere. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
    readonly requestId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** What a Server Action hands back to its form (with useActionState). */
export interface ActionState {
  ok: boolean;
  message?: string;
  /** Invalid fields, keyed by the API's field path (for example `settings.timezone`). */
  fieldErrors?: Record<string, string>;
  /** Changes on every successful submit, so a form can reset itself by key. */
  at?: number;
}

export const initialActionState: ActionState = { ok: false };

/** Turns an ApiError into form state, keeping the first message per field. */
export function toActionState(error: ApiError): ActionState {
  const fieldErrors: Record<string, string> = {};
  if (error.code === 'VALIDATION_FAILED' && Array.isArray(error.details)) {
    for (const detail of error.details as { path?: string; message?: string }[]) {
      if (detail.path && detail.message && !fieldErrors[detail.path]) {
        fieldErrors[detail.path] = detail.message;
      }
    }
  }
  const reference = error.requestId ? ` (request ${error.requestId.slice(0, 8)})` : '';
  return {
    ok: false,
    message: `${error.message}${error.status >= 500 ? reference : ''}`,
    fieldErrors,
  };
}
