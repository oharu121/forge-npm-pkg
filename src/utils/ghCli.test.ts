import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import {
  isGhCliAvailable,
  isGhCliAuthenticated,
  isGhCliReady,
  getUserRepoNames,
  doesRepoExist,
  getManualRepoCommand,
} from './ghCli';

// Mock child_process
vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

const mockExecSync = vi.mocked(execSync);

describe('ghCli', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isGhCliAvailable', () => {
    it('should return true when gh is available', () => {
      mockExecSync.mockReturnValueOnce('gh version 2.40.0');
      expect(isGhCliAvailable()).toBe(true);
      expect(mockExecSync).toHaveBeenCalledWith('gh --version', { stdio: 'pipe' });
    });

    it('should return false when gh is not available', () => {
      mockExecSync.mockImplementationOnce(() => {
        throw new Error('command not found');
      });
      expect(isGhCliAvailable()).toBe(false);
    });
  });

  describe('isGhCliAuthenticated', () => {
    it('should return true when gh is authenticated', () => {
      mockExecSync.mockReturnValueOnce('Logged in to github.com');
      expect(isGhCliAuthenticated()).toBe(true);
      expect(mockExecSync).toHaveBeenCalledWith('gh auth status', {
        stdio: 'pipe',
      });
    });

    it('should return false when gh is not authenticated', () => {
      mockExecSync.mockImplementationOnce(() => {
        throw new Error('not authenticated');
      });
      expect(isGhCliAuthenticated()).toBe(false);
    });
  });

  describe('isGhCliReady', () => {
    it('should return true when gh is available and authenticated', () => {
      mockExecSync
        .mockReturnValueOnce('gh version 2.40.0') // isGhCliAvailable
        .mockReturnValueOnce('Logged in'); // isGhCliAuthenticated
      expect(isGhCliReady()).toBe(true);
    });

    it('should return false when gh is not available', () => {
      mockExecSync.mockImplementationOnce(() => {
        throw new Error('command not found');
      });
      expect(isGhCliReady()).toBe(false);
    });

    it('should return false when gh is not authenticated', () => {
      mockExecSync
        .mockReturnValueOnce('gh version 2.40.0') // isGhCliAvailable
        .mockImplementationOnce(() => {
          throw new Error('not authenticated');
        }); // isGhCliAuthenticated
      expect(isGhCliReady()).toBe(false);
    });
  });

  describe('getUserRepoNames', () => {
    it('should return list of repo names', () => {
      const mockRepos = JSON.stringify([
        { name: 'repo1' },
        { name: 'repo2' },
        { name: 'my-package' },
      ]);
      mockExecSync.mockReturnValueOnce(mockRepos);

      const repos = getUserRepoNames();
      expect(repos).toEqual(['repo1', 'repo2', 'my-package']);
    });

    it('should return empty array on error', () => {
      mockExecSync.mockImplementationOnce(() => {
        throw new Error('network error');
      });
      expect(getUserRepoNames()).toEqual([]);
    });

    it('should return empty array for empty response', () => {
      mockExecSync.mockReturnValueOnce('[]');
      expect(getUserRepoNames()).toEqual([]);
    });
  });

  describe('doesRepoExist', () => {
    it('should return true if repo exists', () => {
      const mockRepos = JSON.stringify([
        { name: 'repo1' },
        { name: 'my-package' },
      ]);
      mockExecSync.mockReturnValueOnce(mockRepos);

      expect(doesRepoExist('my-package')).toBe(true);
    });

    it('should return false if repo does not exist', () => {
      const mockRepos = JSON.stringify([{ name: 'repo1' }, { name: 'repo2' }]);
      mockExecSync.mockReturnValueOnce(mockRepos);

      expect(doesRepoExist('my-package')).toBe(false);
    });
  });

  describe('getManualRepoCommand', () => {
    it('should generate public repo command', () => {
      const cmd = getManualRepoCommand('my-package', false);
      expect(cmd).toBe(
        'gh repo create my-package --public --source=. --remote=origin --push'
      );
    });

    it('should generate private repo command', () => {
      const cmd = getManualRepoCommand('my-package', true);
      expect(cmd).toBe(
        'gh repo create my-package --private --source=. --remote=origin --push'
      );
    });

    it('should include description when provided', () => {
      const cmd = getManualRepoCommand('my-package', false, 'A cool package');
      expect(cmd).toBe(
        'gh repo create my-package --public --description "A cool package" --source=. --remote=origin --push'
      );
    });
  });
});
