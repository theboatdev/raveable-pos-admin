import { describe, expect, it } from 'vitest';
import { ADMIN_NAV, getActiveNav } from './navigation';

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
