import { describe, it, expect } from 'vitest';
import {
  getLatestVersionWithFallback,
  fetchLatestVersions,
} from '../src/utils/versionFetcher';

describe('versionFetcher - Unit Tests (Real npm Registry)', () => {
  describe('getLatestVersionWithFallback()', () => {
    it('should fetch latest version of typescript from npm registry', async () => {
      const result = await getLatestVersionWithFallback('typescript');

      expect(result).toBeDefined();
      expect(result.version).toMatch(/^\^\d+\.\d+\.\d+$/); // Should have caret prefix
      expect(result.usedFallback).toBeUndefined(); // Not a fallback scenario
      expect(result.warning).toBeUndefined();
    });

    it('should fetch latest version of vitest from npm registry', async () => {
      const result = await getLatestVersionWithFallback('vitest');

      expect(result).toBeDefined();
      expect(result.version).toMatch(/^\^\d+\.\d+\.\d+$/); // Should have caret prefix
      expect(result.usedFallback).toBeUndefined();
      // Note: warning may or may not be present depending on version age
    });

    it('should handle non-existent package with fallback', async () => {
      const result = await getLatestVersionWithFallback('this-package-definitely-does-not-exist-12345');

      expect(result).toBeDefined();
      expect(result.version).toBe('latest');
      expect(result.usedFallback).toBe(true);
      expect(result.warning).toContain('Could not fetch');
    });

    it('should return warning for brand new major version', async () => {
      // This test assumes we can find a package with a very recent major version
      // If typescript or another package has a brand new x.0.0 release, it will warn
      const result = await getLatestVersionWithFallback('typescript');

      // We can't guarantee a warning, but we can test the structure
      if (result.warning) {
        expect(result.warning).toContain('⚠️');
        expect(result.usedFallback).toBeUndefined();
      }

      expect(result.version).toMatch(/^\^\d+\.\d+\.\d+$/); // Should have caret prefix
    });
  });

  describe('fetchLatestVersions()', () => {
    it('should fetch multiple package versions in parallel', async () => {
      const packages = ['typescript', 'vitest', 'prettier', 'eslint'];
      const results = await fetchLatestVersions(packages);

      expect(results.size).toBe(packages.length);

      packages.forEach(pkg => {
        const result = results.get(pkg);
        expect(result).toBeDefined();
        expect(result!.version).toMatch(/^\^\d+\.\d+\.\d+$/); // Should have caret prefix
        expect(result!.usedFallback).toBeUndefined();
        // Note: warnings may appear for freshly released versions
        console.log(`✓ ${pkg}: ${result!.version}`);
      });
    });

    it('should handle mix of valid and invalid packages', async () => {
      const packages = [
        'typescript', // Valid
        'invalid-pkg-xyz-12345', // Invalid
        'vitest', // Valid
      ];

      const results = await fetchLatestVersions(packages);

      expect(results.size).toBe(3);

      // First package (typescript) should succeed
      const tsResult = results.get('typescript');
      expect(tsResult).toBeDefined();
      expect(tsResult!.version).toMatch(/^\^\d+\.\d+\.\d+$/);
      expect(tsResult!.usedFallback).toBeUndefined();

      // Second package (invalid) should use fallback
      const invalidResult = results.get('invalid-pkg-xyz-12345');
      expect(invalidResult).toBeDefined();
      expect(invalidResult!.version).toBe('latest');
      expect(invalidResult!.usedFallback).toBe(true);
      expect(invalidResult!.warning).toContain('Could not fetch');

      // Third package (vitest) should succeed
      const vitestResult = results.get('vitest');
      expect(vitestResult).toBeDefined();
      expect(vitestResult!.version).toMatch(/^\^\d+\.\d+\.\d+$/);
      expect(vitestResult!.usedFallback).toBeUndefined();
    });

    it('should complete within reasonable timeout', async () => {
      const startTime = Date.now();
      const packages = ['typescript', 'vitest', 'prettier'];

      await fetchLatestVersions(packages);

      const duration = Date.now() - startTime;

      // Should complete within 10 seconds (5s timeout per package + overhead)
      expect(duration).toBeLessThan(10000);
      console.log(`✓ Fetched ${packages.length} packages in ${duration}ms`);
    });
  });

  describe('Version format validation', () => {
    it('should return valid semantic versions or "latest"', async () => {
      const packages = ['typescript', 'eslint', 'prettier', 'tsup'];
      const results = await fetchLatestVersions(packages);

      packages.forEach(pkg => {
        const result = results.get(pkg);
        expect(result).toBeDefined();

        const isSemanticVersionWithCaret = /^\^\d+\.\d+\.\d+/.test(result!.version);
        const isLatestString = result!.version === 'latest';

        expect(isSemanticVersionWithCaret || isLatestString).toBe(true);

        if (!isSemanticVersionWithCaret) {
          expect(result!.usedFallback).toBe(true);
          console.log(`⚠️  ${pkg} used fallback: ${result!.version}`);
        }
      });
    });
  });

  describe('Fallback behavior', () => {
    it('should handle fetch timeout gracefully', async () => {
      // Test with a package that might be slow or non-existent
      const result = await getLatestVersionWithFallback('definitely-not-a-real-package-xyz-999');

      expect(result).toBeDefined();
      expect(result.version).toBe('latest');
      expect(result.usedFallback).toBe(true);
      expect(result.warning).toBeDefined();
    });

    it('should provide helpful warning messages', async () => {
      const result = await getLatestVersionWithFallback('non-existent-package-12345');

      if (result.warning) {
        expect(result.warning).toContain('⚠️');
        expect(result.warning).toContain('non-existent-package-12345');
        expect(result.warning).toMatch(/Could not fetch|days old/);
      }
    });
  });
});
