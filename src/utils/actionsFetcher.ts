/**
 * GitHub Actions version fetcher
 * Fetches latest major version tags for GitHub Actions (e.g., v5, v6)
 */

export interface ActionVersionResult {
  version: string;
  warning?: string;
  usedFallback?: boolean;
}

interface GitHubRelease {
  tag_name: string;
  published_at: string;
  prerelease: boolean;
  draft: boolean;
}

/**
 * Parses a git tag to extract major version
 * @example "v6.0.1" -> 6
 * @example "v5.2" -> 5
 */
function extractMajorVersion(tag: string): number | null {
  const match = tag.match(/^v?(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Fetches the latest major version tag for a GitHub Action
 * @param owner GitHub owner/org (e.g., "actions")
 * @param repo Repository name (e.g., "checkout")
 * @returns Major version tag like "v5" or "v6"
 */
async function fetchLatestMajorVersion(
  owner: string,
  repo: string
): Promise<ActionVersionResult> {
  try {
    // Fetch releases from GitHub API
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases`,
      {
        signal: AbortSignal.timeout(5000),
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'forge-npm-pkg'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const releases = await response.json() as GitHubRelease[];

    // Filter out drafts and pre-releases, find latest major version
    const stableReleases = releases.filter(r => !r.draft && !r.prerelease);

    if (stableReleases.length === 0) {
      throw new Error('No stable releases found');
    }

    // Find the highest major version
    let highestMajor = 0;
    for (const release of stableReleases) {
      const major = extractMajorVersion(release.tag_name);
      if (major !== null && major > highestMajor) {
        highestMajor = major;
      }
    }

    if (highestMajor === 0) {
      throw new Error('Could not determine major version');
    }

    return {
      version: `v${highestMajor}`
    };

  } catch {
    // Return a warning but don't fail - use a reasonable default
    return {
      version: 'v5', // Conservative default
      usedFallback: true,
      warning: `⚠️  Could not fetch ${owner}/${repo} version, using v5`
    };
  }
}

/**
 * Predefined GitHub Actions we support
 */
export interface ActionConfig {
  owner: string;
  repo: string;
  key: string;
}

export const SUPPORTED_ACTIONS: ActionConfig[] = [
  { owner: 'actions', repo: 'checkout', key: 'actions/checkout' },
  { owner: 'actions', repo: 'setup-node', key: 'actions/setup-node' },
  { owner: 'codecov', repo: 'codecov-action', key: 'codecov/codecov-action' },
  { owner: 'dependabot', repo: 'fetch-metadata', key: 'dependabot/fetch-metadata' }
];

/**
 * Fetches latest major versions for all supported GitHub Actions in parallel
 * @returns Map of action key (e.g., "actions/checkout") to version result
 */
export async function fetchLatestActionVersions(): Promise<Map<string, ActionVersionResult>> {
  const results = await Promise.all(
    SUPPORTED_ACTIONS.map(async (action) => {
      const result = await fetchLatestMajorVersion(action.owner, action.repo);
      return { key: action.key, result };
    })
  );

  return new Map(results.map(r => [r.key, r.result]));
}

/**
 * Fallback versions if API calls fail
 */
export const FALLBACK_VERSIONS: Record<string, string> = {
  'actions/checkout': 'v5',
  'actions/setup-node': 'v6',
  'codecov/codecov-action': 'v5',
  'dependabot/fetch-metadata': 'v2'
};
