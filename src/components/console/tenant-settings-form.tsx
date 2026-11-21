'use client';

import { useActionState } from 'react';
import { FormField } from '@/components/form-field';
import { FormStatus } from '@/components/form-status';
import { SubmitButton } from '@/components/submit-button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { updateTenant } from '@/lib/actions/platform';
import { initialActionState } from '@/lib/api/errors';
import type { OrganisationSettings } from '@/lib/api/types';
import { CURRENCIES } from '@/lib/format';

/** A tenant's name and settings, as its Owner would edit them. Read-only for support staff. */
export function TenantSettingsForm({
  tenantId,
  name,
  settings,
  timezones,
  canEdit,
}: {
  tenantId: string;
  name: string;
  settings: OrganisationSettings;
  timezones: string[];
  canEdit: boolean;
}) {
  const [state, action] = useActionState(updateTenant.bind(null, tenantId), initialActionState);
  const errors = state.fieldErrors ?? {};
  return (
    <form action={action} className="flex flex-col gap-4">
      <fieldset disabled={!canEdit} className="grid gap-4 sm:grid-cols-2">
        <FormField label="Organisation name" htmlFor="t-name" error={errors.name}>
          <Input id="t-name" name="name" defaultValue={name} required maxLength={100} />
        </FormField>
        <FormField
          label="Currency"
          htmlFor="t-currency"
          error={errors['settings.currency']}
          hint="Locked once ticket types have prices."
        >
          <NativeSelect
            id="t-currency"
            name="currency"
            defaultValue={settings.currency}
            className="w-full"
          >
            {CURRENCIES.map((c) => (
              <NativeSelectOption key={c} value={c}>
                {c}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </FormField>
        <FormField label="Timezone" htmlFor="t-timezone" error={errors['settings.timezone']}>
          <NativeSelect
            id="t-timezone"
            name="timezone"
            defaultValue={settings.timezone}
            className="w-full"
          >
            {timezones.map((zone) => (
              <NativeSelectOption key={zone} value={zone}>
                {zone}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </FormField>
        <FormField
          label="Phone country code"
          htmlFor="t-phone-code"
          error={errors['settings.phoneCountryCode']}
        >
          <Input
            id="t-phone-code"
            name="phoneCountryCode"
            defaultValue={settings.phoneCountryCode}
            maxLength={4}
            required
          />
        </FormField>
        <FormField label="Tax name" htmlFor="t-tax-name" error={errors['settings.tax.name']}>
          <Input
            id="t-tax-name"
            name="taxName"
            defaultValue={settings.tax.name}
            maxLength={40}
            required
          />
        </FormField>
        <FormField
          label="Tax rate (%)"
          htmlFor="t-tax-rate"
          error={errors['settings.tax.ratePercent']}
        >
          <Input
            id="t-tax-rate"
            name="taxRatePercent"
            type="number"
            min={0}
            max={100}
            step="0.01"
            defaultValue={settings.tax.ratePercent}
            required
          />
        </FormField>
        <FormField
          label="Contact email"
          htmlFor="t-contact-email"
          error={errors['settings.contactEmail']}
        >
          <Input
            id="t-contact-email"
            name="contactEmail"
            type="email"
            defaultValue={settings.contactEmail ?? ''}
          />
        </FormField>
        <FormField
          label="Contact phone"
          htmlFor="t-contact-phone"
          error={errors['settings.contactPhone']}
        >
          <Input
            id="t-contact-phone"
            name="contactPhone"
            defaultValue={settings.contactPhone ?? ''}
            maxLength={40}
          />
        </FormField>
        <div className="flex items-center gap-2">
          <Checkbox
            id="t-prices-include-tax"
            name="pricesIncludeTax"
            defaultChecked={settings.tax.pricesIncludeTax}
          />
          <Label htmlFor="t-prices-include-tax">Ticket prices include tax</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="t-managers-crm"
            name="eventManagersCanSeeCrm"
            defaultChecked={settings.eventManagersCanSeeCrm}
          />
          <Label htmlFor="t-managers-crm">Event Managers can see customers</Label>
        </div>
      </fieldset>
      <FormStatus state={state} />
      {canEdit ? (
        <div>
          <SubmitButton>Save changes</SubmitButton>
        </div>
      ) : null}
    </form>
  );
}
