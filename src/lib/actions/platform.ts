'use server';

import type { ActionState } from '@/lib/api/errors';
import { platformApi } from '@/lib/api/server';
import { attempt, text } from './helpers';

const tenantPath = (tenantId: string) => `/tenants/${encodeURIComponent(tenantId)}`;

export async function suspendTenant(tenantId: string, reason: string): Promise<ActionState> {
  return attempt(
    () => platformApi(`${tenantPath(tenantId)}/suspend`, { method: 'POST', body: { reason } }),
    'Tenant suspended.',
  );
}

export async function reactivateTenant(tenantId: string): Promise<ActionState> {
  return attempt(
    () => platformApi(`${tenantPath(tenantId)}/reactivate`, { method: 'POST' }),
    'Tenant reactivated.',
  );
}

/** Edits a tenant's organisation: name and settings, with the organiser rules (currency lock). */
export async function updateTenant(
  tenantId: string,
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const rate = text(form, 'taxRatePercent');
  return attempt(
    () =>
      platformApi(tenantPath(tenantId), {
        method: 'PATCH',
        body: {
          name: text(form, 'name'),
          settings: {
            currency: text(form, 'currency'),
            timezone: text(form, 'timezone'),
            phoneCountryCode: text(form, 'phoneCountryCode').replace(/^\+/, ''),
            tax: {
              name: text(form, 'taxName'),
              ratePercent: rate === '' ? Number.NaN : Number(rate),
              pricesIncludeTax: form.get('pricesIncludeTax') === 'on',
            },
            eventManagersCanSeeCrm: form.get('eventManagersCanSeeCrm') === 'on',
            contactEmail: text(form, 'contactEmail') || null,
            contactPhone: text(form, 'contactPhone') || null,
          },
        },
      }),
    'Tenant details saved. The change is in the tenant’s audit log.',
  );
}

export async function changeTenantMemberRole(
  tenantId: string,
  userId: string,
  role: string,
): Promise<ActionState> {
  return attempt(
    () =>
      platformApi(`${tenantPath(tenantId)}/members/${encodeURIComponent(userId)}`, {
        method: 'PATCH',
        body: { role },
      }),
    'Role updated.',
  );
}

export async function removeTenantMember(tenantId: string, userId: string): Promise<ActionState> {
  return attempt(
    () =>
      platformApi(`${tenantPath(tenantId)}/members/${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      }),
    'Member removed.',
  );
}

/** Deletes the tenant: its Clerk organisation and its database. Cannot be undone. */
export async function deleteTenant(tenantId: string, confirmName: string): Promise<ActionState> {
  return attempt(
    () => platformApi(`${tenantPath(tenantId)}/delete`, { method: 'POST', body: { confirmName } }),
    'Tenant deleted.',
  );
}

export async function updateTenantDefaults(
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  return attempt(
    () =>
      platformApi('/settings', {
        method: 'PATCH',
        body: {
          newTenantDefaults: {
            currency: text(form, 'currency'),
            timezone: text(form, 'timezone'),
            phoneCountryCode: text(form, 'phoneCountryCode').replace(/^\+/, ''),
          },
        },
      }),
    'Defaults saved. They apply to organisations created from now on.',
  );
}

export async function setFeatureFlag(
  flag: 'offlineSales' | 'customerExport',
  enabled: boolean,
): Promise<ActionState> {
  return attempt(
    () =>
      platformApi('/settings', { method: 'PATCH', body: { featureFlags: { [flag]: enabled } } }),
    'Feature flag saved.',
  );
}

export async function inviteStaff(_prev: ActionState, form: FormData): Promise<ActionState> {
  const email = text(form, 'email');
  let emailSent = true;
  const result = await attempt(async () => {
    ({ emailSent } = await platformApi<{ emailSent: boolean }>('/staff/invitations', {
      method: 'POST',
      body: { email, role: text(form, 'role') },
    }));
  });
  if (!result.ok) return result;
  return {
    ...result,
    message: emailSent
      ? `Invitation sent to ${email}.`
      : `${email} already has an account: they become staff the next time they sign in here.`,
  };
}

export async function revokeStaffInvitation(invitationId: string): Promise<ActionState> {
  return attempt(
    () =>
      platformApi(`/staff/invitations/${encodeURIComponent(invitationId)}`, { method: 'DELETE' }),
    'Invitation revoked.',
  );
}

export async function changeStaffRole(userId: string, role: string): Promise<ActionState> {
  return attempt(
    () => platformApi(`/staff/${encodeURIComponent(userId)}`, { method: 'PATCH', body: { role } }),
    'Role updated.',
  );
}

export async function removeStaff(userId: string): Promise<ActionState> {
  return attempt(
    () => platformApi(`/staff/${encodeURIComponent(userId)}`, { method: 'DELETE' }),
    'Staff member removed.',
  );
}
