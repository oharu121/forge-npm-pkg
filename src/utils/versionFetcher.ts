/**
 * Dynamic version fetcher with smart fallbacks
 * Fetches latest package versions from npm registry with automatic fallback to stable versions
 */

export interface VersionResult {
  version: string;
  warning?: string;
  usedFallback?: boolean;
}

interface NpmPackageData {
  version: string;
  time?: Record<string, string>;
  versions?: Record<string, unknown>;
}

/**
 * Compares two semver version strings
 */
function compareVersions(a: string, b: string): number {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if (aParts[i] > bParts[i]) return 1;
    if (aParts[i] < bParts[i]) return -1;
  }
  return 0;
}

/**
 * Generates a warning message if the version is too new or risky
 */
function generateWarning(pkg: string, version: string, daysOld: number): string | undefined {
  const [major, minor] = version.split('.').map(Number);

  // x.0.0 or x.0.x within 30 days - new major version
  if (minor === 0 && daysOld < 30) {
    const prevMajor = major - 1;
    return (
      `⚠️  ${pkg}@${version} (${daysOld} day${daysOld === 1 ? '' : 's'} old)\n` +
      `   New major version - may contain breaking changes.\n` +
      `   If issues occur, downgrade: npm install ${pkg}@${prevMajor}`
    );
  }

  // x.1.x within 14 days - early minor release
  if (minor === 1 && daysOld < 14) {
    return (
      `⚠️  ${pkg}@${version} (${daysOld} day${daysOld === 1 ? '' : 's'} old)\n` +
      `   Recently released - may have early bugs.`
    );
  }

  return undefined;
}

/**
 * Fetches the latest stable version as a fallback (at least 30 days old)
 */
async function getStableFallbackVersion(
  packageName: string
): Promise<VersionResult> {
  try {
    // Fetch all package metadata
    const response = await fetch(
      `https://registry.npmjs.org/${packageName}`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json() as NpmPackageData;
    const allVersions = Object.keys(data.versions || {});

    // Find stable versions (excluding pre-releases)
    const stableVersions = allVersions
      .filter(v => !v.includes('-')) // No alpha/beta/rc
      .filter(v => /^\d+\.\d+\.\d+$/.test(v)) // Valid semver
      .sort(compareVersions)
      .reverse();

    if (stableVersions.length === 0) {
      throw new Error('No stable versions found');
    }

    // Get the latest stable version that's at least 30 days old
    for (const version of stableVersions) {
      const publishedAt = new Date(data.time?.[version] || Date.now());
      const daysOld = Math.floor((Date.now() - publishedAt.getTime()) / (1000 * 60 * 60 * 24));

      if (daysOld >= 30) {
        return {
          version: `^${version}`,
          usedFallback: true,
          warning: `ℹ️  Using stable fallback: ${packageName}@${version} (${daysOld} days old)`
        };
      }
    }

    // If no version is 30+ days old, use the latest stable
    const latestStable = stableVersions[0];
    return {
      version: `^${latestStable}`,
      usedFallback: true,
      warning: `ℹ️  Using fallback: ${packageName}@${latestStable}`
    };

  } catch {
    // Last resort: Use "latest" string and let npm handle it during install
    return {
      version: 'latest',
      usedFallback: true,
      warning: `⚠️  Could not fetch ${packageName} versions, using "latest"`
    };
  }
}

/**
 * Fetches the latest version of a package with automatic fallback to stable version
 */
export async function getLatestVersionWithFallback(
  packageName: string
): Promise<VersionResult> {
  try {
    // Try to fetch latest version
    const response = await fetch(
      `https://registry.npmjs.org/${packageName}/latest`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json() as NpmPackageData;
    const version = data.version;
    const publishedAt = new Date(data.time?.[version] || Date.now());
    const daysOld = Math.floor((Date.now() - publishedAt.getTime()) / (1000 * 60 * 60 * 24));

    const warning = generateWarning(packageName, version, daysOld);

    return { version: `^${version}`, warning };

  } catch {
    // Fallback: Fetch previous stable major version
    return await getStableFallbackVersion(packageName);
  }
}

/**
 * Fetches latest versions for multiple packages in parallel
 */
export async function fetchLatestVersions(
  packageNames: string[]
): Promise<Map<string, VersionResult>> {
  const results = await Promise.all(
    packageNames.map(async (name) => {
      const result = await getLatestVersionWithFallback(name);
      return { name, result };
    })
  );

  return new Map(results.map(r => [r.name, r.result]));
}
