import { MAX_WORKSPACES_WITHOUT_ENTERPRISE_KEY } from 'src/engine/core-modules/auth/constants/max-workspaces-without-organization-key.constants';

// BiVelio: the workspace cap without an enterprise key is configurable through
// BIVELIO_MAX_WORKSPACES. Unset or empty keeps the upstream value (5), so the
// default behaviour does not change. Any other value must be a whole number
// >= 1 written with digits only; anything else is reported as invalid and the
// upstream value is kept, so a typo can never lift the cap by accident.
export const BIVELIO_MAX_WORKSPACES_ENV_NAME = 'BIVELIO_MAX_WORKSPACES';

export type MaxWorkspacesResolution = {
  limit: number;
  invalidValue?: string;
};

export const resolveMaxWorkspacesWithoutEnterpriseKey = (
  rawValue: string | undefined,
): MaxWorkspacesResolution => {
  const trimmedValue = rawValue?.trim() ?? '';

  if (trimmedValue === '') {
    return { limit: MAX_WORKSPACES_WITHOUT_ENTERPRISE_KEY };
  }

  const parsedValue = /^[0-9]+$/.test(trimmedValue)
    ? Number(trimmedValue)
    : Number.NaN;

  if (!Number.isSafeInteger(parsedValue) || parsedValue < 1) {
    return {
      limit: MAX_WORKSPACES_WITHOUT_ENTERPRISE_KEY,
      invalidValue: trimmedValue,
    };
  }

  return { limit: parsedValue };
};
