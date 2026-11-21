'use client';

import { useActionState, useState, useTransition } from 'react';
import { FormField } from '@/components/form-field';
import { FormStatus } from '@/components/form-status';
import { SubmitButton } from '@/components/submit-button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { setFeatureFlag, updateTenantDefaults } from '@/lib/actions/platform';
import { initialActionState } from '@/lib/api/errors';
import type { PlatformSettings } from '@/lib/api/types';
import { CURRENCIES } from '@/lib/format';

export function TenantDefaultsForm({
  defaults,
  timezones,
  canEdit,
}: {
  defaults: PlatformSettings['newTenantDefaults'];
  timezones: string[];
  canEdit: boolean;
}) {
  const [state, action] = useActionState(updateTenantDefaults, initialActionState);
  const errors = state.fieldErrors ?? {};
  return (
    <form action={action} className="flex flex-col gap-4">
      <fieldset disabled={!canEdit} className="grid gap-4 sm:grid-cols-3">
        <FormField
          label="Currency"
          htmlFor="d-currency"
          error={errors['newTenantDefaults.currency']}
        >
          <NativeSelect
            id="d-currency"
            name="currency"
            defaultValue={defaults.currency}
            className="w-full"
          >
            {CURRENCIES.map((c) => (
              <NativeSelectOption key={c} value={c}>
                {c}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </FormField>
        <FormField
          label="Timezone"
          htmlFor="d-timezone"
          error={errors['newTenantDefaults.timezone']}
        >
          <NativeSelect
            id="d-timezone"
            name="timezone"
            defaultValue={defaults.timezone}
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
          htmlFor="d-phone"
          error={errors['newTenantDefaults.phoneCountryCode']}
        >
          <Input
            id="d-phone"
            name="phoneCountryCode"
            defaultValue={defaults.phoneCountryCode}
            maxLength={4}
            required
          />
        </FormField>
      </fieldset>
      <FormStatus state={state} />
      {canEdit ? (
        <div>
          <SubmitButton>Save defaults</SubmitButton>
        </div>
      ) : null}
    </form>
  );
}

const FLAGS = [
  {
    key: 'offlineSales',
    label: 'Offline selling',
    description:
      'Tills keep selling for up to 24 hours without a connection. Off: tills need a connection to sell.',
  },
  {
    key: 'customerExport',
    label: 'Customer export',
    description: 'Organisers can download customers and attendees as CSV.',
  },
] as const;

export function FeatureFlags({
  flags,
  canEdit,
}: {
  flags: PlatformSettings['featureFlags'];
  canEdit: boolean;
}) {
  return (
    <ul className="flex flex-col gap-4">
      {FLAGS.map((flag) => (
        <FlagRow
          key={`${flag.key}:${flags[flag.key]}`}
          flag={flag}
          enabled={flags[flag.key]}
          canEdit={canEdit}
        />
      ))}
    </ul>
  );
}

function FlagRow({
  flag,
  enabled,
  canEdit,
}: {
  flag: (typeof FLAGS)[number];
  enabled: boolean;
  canEdit: boolean;
}) {
  const [checked, setChecked] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <li className="flex items-start gap-3">
      <Checkbox
        id={`flag-${flag.key}`}
        className="mt-0.5"
        checked={checked}
        disabled={!canEdit || pending}
        onCheckedChange={(value) => {
          const next = value === true;
          setChecked(next);
          setError(null);
          startTransition(async () => {
            const result = await setFeatureFlag(flag.key, next);
            if (!result.ok) {
              setChecked(!next);
              setError(result.message ?? 'Could not save.');
            }
          });
        }}
      />
      <div className="flex flex-col gap-1">
        <Label htmlFor={`flag-${flag.key}`}>{flag.label}</Label>
        <p className="text-sm text-muted-foreground">{flag.description}</p>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </li>
  );
}
