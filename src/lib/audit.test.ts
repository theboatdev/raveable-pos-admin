import { describe, expect, it } from 'vitest';
import { describeAction, isChange, summariseDetails } from './audit';

describe('audit labels', () => {
  it('describes known actions and passes unknown ones through', () => {
    expect(describeAction('platform.tenant.suspended')).toBe('Suspended a tenant');
    expect(describeAction('event.status_changed')).toBe('event.status_changed');
  });

  it('tells reads from changes', () => {
    expect(isChange({ action: 'platform.tenant.viewed' })).toBe(false);
    expect(isChange({ action: 'platform.tenants.listed' })).toBe(false);
    expect(isChange({ action: 'platform.tenant.audit_viewed' })).toBe(false);
    expect(isChange({ action: 'platform.tenant.customers_viewed' })).toBe(false);
    expect(isChange({ action: 'platform.tenant.exported' })).toBe(false);
    expect(isChange({ action: 'platform.tenant.suspended' })).toBe(true);
    expect(isChange({ action: 'platform.tenant.member_role_changed' })).toBe(true);
  });

  it('summarises details', () => {
    expect(summariseDetails({ reason: 'Unpaid', page: 2, empty: '' })).toBe(
      'reason: Unpaid · page: 2',
    );
    expect(summariseDetails({ featureFlags: { offlineSales: false } })).toBe(
      'featureFlags: {"offlineSales":false}',
    );
  });
});
