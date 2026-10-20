import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';

// BiVelio: the workspace cap without an enterprise key reads
// BIVELIO_MAX_WORKSPACES and keeps the upstream default of 5 otherwise.
type WorkspaceLimitCheck = {
  assertWorkspaceCountWithinLimit(workspaceCount: number): Promise<void>;
};

const buildService = (isEnterpriseKeyValid: boolean) => {
  // Only the two members the check uses; the rest of the service is not
  // needed and its constructor dependencies are not built.
  const service = Object.create(SignInUpService.prototype) as Record<
    string,
    unknown
  >;

  service.enterprisePlanService = {
    isValid: jest.fn().mockReturnValue(isEnterpriseKeyValid),
  };
  service.logger = { warn: jest.fn() };

  return service as unknown as WorkspaceLimitCheck & {
    logger: { warn: jest.Mock };
  };
};

describe('SignInUpService workspace limit (BIVELIO_MAX_WORKSPACES)', () => {
  const originalValue = process.env.BIVELIO_MAX_WORKSPACES;

  afterEach(() => {
    if (originalValue === undefined) {
      delete process.env.BIVELIO_MAX_WORKSPACES;
    } else {
      process.env.BIVELIO_MAX_WORKSPACES = originalValue;
    }
  });

  it('keeps the upstream cap of 5 when the variable is not set', async () => {
    delete process.env.BIVELIO_MAX_WORKSPACES;
    const service = buildService(false);

    await expect(
      service.assertWorkspaceCountWithinLimit(4),
    ).resolves.toBeUndefined();
    await expect(service.assertWorkspaceCountWithinLimit(5)).rejects.toThrow(
      AuthException,
    );
    await expect(service.assertWorkspaceCountWithinLimit(5)).rejects.toThrow(
      'Cannot create more than 5 workspaces without a valid enterprise key',
    );
    expect(service.logger.warn).not.toHaveBeenCalled();
  });

  it('uses BIVELIO_MAX_WORKSPACES when it is a whole number', async () => {
    process.env.BIVELIO_MAX_WORKSPACES = '50';
    const service = buildService(false);

    await expect(
      service.assertWorkspaceCountWithinLimit(5),
    ).resolves.toBeUndefined();
    await expect(
      service.assertWorkspaceCountWithinLimit(49),
    ).resolves.toBeUndefined();
    await expect(service.assertWorkspaceCountWithinLimit(50)).rejects.toThrow(
      'Cannot create more than 50 workspaces without a valid enterprise key',
    );
  });

  it('keeps the cap of 5 when BIVELIO_MAX_WORKSPACES is invalid', async () => {
    process.env.BIVELIO_MAX_WORKSPACES = 'unlimited';
    const service = buildService(false);

    await expect(service.assertWorkspaceCountWithinLimit(5)).rejects.toThrow(
      'Cannot create more than 5 workspaces without a valid enterprise key',
    );
    expect(service.logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('BIVELIO_MAX_WORKSPACES is not a whole number'),
    );
  });

  it('still lets a valid enterprise key skip the cap, as upstream', async () => {
    process.env.BIVELIO_MAX_WORKSPACES = '1';
    const service = buildService(true);

    await expect(
      service.assertWorkspaceCountWithinLimit(1000),
    ).resolves.toBeUndefined();
  });
});
