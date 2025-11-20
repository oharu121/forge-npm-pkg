/**
 * Node.js LTS version fetcher
 * Fetches active LTS versions from nodejs.org with fallback to known versions
 */

export interface NodeVersionConfig {
  minimum: number;
  engines: string;
  ciMatrix: number[];
  latestLTS: number;
}

interface NodeDistVersion {
  version: string;
  date: string;
  lts: false | string;
}

/**
 * Fallback Node versions if fetching fails
 * Update when new LTS releases (typically once per year)
 */
const FALLBACK_NODE_CONFIG: NodeVersionConfig = {
  minimum: 20,
  engines: '>=20.0.0',
  ciMatrix: [20, 22],
  latestLTS: 22
};

/**
 * Checks if a Node.js version is past its End-of-Life date
 */
function isPastEOL(majorVersion: number): boolean {
  const EOL_DATES: Record<number, Date> = {
    16: new Date('2023-09-11'),
    18: new Date('2025-04-30'),
    20: new Date('2026-04-30'),
    22: new Date('2027-04-30'),
    // Future versions (estimated based on Node.js release schedule)
    24: new Date('2028-04-30'),
    26: new Date('2029-04-30'),
  };

  const eolDate = EOL_DATES[majorVersion];
  if (!eolDate) {
    // If we don't know the EOL date, assume it's still active
    return false;
  }

  return Date.now() > eolDate.getTime();
}

/**
 * Fetches active LTS versions from nodejs.org
 */
export async function getNodeLTSVersions(): Promise<NodeVersionConfig> {
  try {
    const response = await fetch(
      'https://nodejs.org/dist/index.json',
      { signal: AbortSignal.timeout(5000) }
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const versions = await response.json() as NodeDistVersion[];

    // Filter for LTS versions that are not past EOL
    const ltsVersions = versions
      .filter(v => v.lts !== false) // Has LTS codename
      .map(v => parseInt(v.version.match(/^v(\d+)/)?.[1] || '0'))
      .filter(v => v > 0 && !isPastEOL(v))
      .filter((v, i, arr) => arr.indexOf(v) === i) // Unique
      .sort((a, b) => b - a); // Descending order

    if (ltsVersions.length === 0) {
      throw new Error('No active LTS versions found');
    }

    // Get the latest 2 LTS versions for CI matrix
    const ciMatrix = ltsVersions.slice(0, 2);
    const latestLTS = ltsVersions[0];

    // Use the older of the two as minimum (more compatible)
    const minimum = ciMatrix.length >= 2 ? ciMatrix[1] : latestLTS;

    return {
      minimum,
      engines: `>=${minimum}.0.0`,
      ciMatrix,
      latestLTS
    };

  } catch {
    // Fallback to known stable versions
    console.warn('⚠️  Could not fetch Node.js LTS versions, using fallback');
    return FALLBACK_NODE_CONFIG;
  }
}
