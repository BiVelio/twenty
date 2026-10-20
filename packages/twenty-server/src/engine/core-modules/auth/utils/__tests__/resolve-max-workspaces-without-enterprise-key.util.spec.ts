import { MAX_WORKSPACES_WITHOUT_ENTERPRISE_KEY } from 'src/engine/core-modules/auth/constants/max-workspaces-without-organization-key.constants';
import { resolveMaxWorkspacesWithoutEnterpriseKey } from 'src/engine/core-modules/auth/utils/resolve-max-workspaces-without-enterprise-key.util';

describe('resolveMaxWorkspacesWithoutEnterpriseKey', () => {
  it('keeps the upstream limit of 5 when the variable is not set', () => {
    expect(MAX_WORKSPACES_WITHOUT_ENTERPRISE_KEY).toBe(5);
    expect(resolveMaxWorkspacesWithoutEnterpriseKey(undefined)).toEqual({
      limit: 5,
    });
  });

  it('keeps the upstream limit when the variable is empty or blank', () => {
    expect(resolveMaxWorkspacesWithoutEnterpriseKey('')).toEqual({ limit: 5 });
    expect(resolveMaxWorkspacesWithoutEnterpriseKey('   ')).toEqual({
      limit: 5,
    });
  });

  it.each([
    ['1', 1],
    ['5', 5],
    ['50', 50],
    [' 200 ', 200],
    ['007', 7],
  ])('accepts the whole number %p', (rawValue, expectedLimit) => {
    expect(resolveMaxWorkspacesWithoutEnterpriseKey(rawValue)).toEqual({
      limit: expectedLimit,
    });
  });

  it.each([
    '0',
    '-3',
    '2.5',
    '1e3',
    '0x10',
    'abc',
    '10 workspaces',
    'Infinity',
    '99999999999999999999',
  ])('keeps the upstream limit and reports %p as invalid', (rawValue) => {
    expect(resolveMaxWorkspacesWithoutEnterpriseKey(rawValue)).toEqual({
      limit: 5,
      invalidValue: rawValue,
    });
  });
});
