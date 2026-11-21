import { describe, expect, it } from 'vitest';
import { ADMIN_NAV, TENANT_TABS, getActiveNav, tenantHref } from './navigation';

describe('getActiveNav', () => {
  it('matches top-level sections, including nested tenant pages', () => {
    expect(getActiveNav('/overview')).toBe('overview');
    expect(getActiveNav('/tenants/org_2abc')).toBe('tenants');
    expect(getActiveNav('/audit?actor=u_1')).toBe('audit');
  });

  it('returns null for unknown paths', () => {
    expect(getActiveNav('/')).toBeNull();
    expect(getActiveNav('/sign-in')).toBeNull();
  });

  it('has a unique href per item', () => {
    const hrefs = ADMIN_NAV.map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});

describe('tenantHref', () => {
  it('builds tenant page links, encoding each segment', () => {
    expect(tenantHref('org_2abc')).toBe('/tenants/org_2abc');
    expect(tenantHref('org_2abc', '')).toBe('/tenants/org_2abc');
    expect(tenantHref('org_2abc', 'events', 'e1', 'orders')).toBe(
      '/tenants/org_2abc/events/e1/orders',
    );
    expect(tenantHref('org/x', 'a b')).toBe('/tenants/org%2Fx/a%20b');
  });

  it('has a unique segment per tab', () => {
    const segments = TENANT_TABS.map((tab) => tab.segment);
    expect(new Set(segments).size).toBe(segments.length);
  });
});
