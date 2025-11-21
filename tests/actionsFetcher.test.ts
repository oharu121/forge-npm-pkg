import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchLatestActionVersions, SUPPORTED_ACTIONS, FALLBACK_VERSIONS } from '../src/utils/actionsFetcher.js';

describe('actionsFetcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchLatestActionVersions', () => {
    it('should fetch latest major versions for all supported actions', async () => {
      const versions = await fetchLatestActionVersions();

      // Should have entries for all supported actions
      expect(versions.size).toBe(SUPPORTED_ACTIONS.length);

      // Check each action has a version
      for (const action of SUPPORTED_ACTIONS) {
        const result = versions.get(action.key);
        expect(result).toBeDefined();
        expect(result?.version).toMatch(/^v\d+$/);
      }
    });

    it('should return version in format v{major}', async () => {
      const versions = await fetchLatestActionVersions();

      for (const [key, result] of versions.entries()) {
        expect(result.version).toMatch(/^v\d+$/);
        console.log(`${key}: ${result.version}`);
      }
    });

    it('should handle API failures gracefully', async () => {
      // Mock fetch to fail
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const versions = await fetchLatestActionVersions();

      // Should still return results with fallback versions
      expect(versions.size).toBe(SUPPORTED_ACTIONS.length);

      for (const [_key, result] of versions.entries()) {
        expect(result.version).toBeDefined();
        expect(result.usedFallback).toBe(true);
        expect(result.warning).toBeDefined();
      }

      globalThis.fetch = originalFetch;
    });

    it('should have reasonable fallback versions', () => {
      // Verify fallback versions are defined for all supported actions
      for (const action of SUPPORTED_ACTIONS) {
        const fallback = FALLBACK_VERSIONS[action.key];
        expect(fallback).toBeDefined();
        expect(fallback).toMatch(/^v\d+$/);
      }
    });
  });

  describe('version format', () => {
    it('should return major version tags compatible with GitHub Actions', async () => {
      const versions = await fetchLatestActionVersions();

      for (const [_key, result] of versions.entries()) {
        // Major version tags should be in format like v5, v6
        expect(result.version).toMatch(/^v\d+$/);

        // Should be a reasonable version number (not too high, not zero)
        const versionNumber = parseInt(result.version.slice(1), 10);
        expect(versionNumber).toBeGreaterThan(0);
        expect(versionNumber).toBeLessThan(100);
      }
    });
  });
});
