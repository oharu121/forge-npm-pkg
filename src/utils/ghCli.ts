/**
 * GitHub CLI (gh) utilities
 * Provides functions to interact with GitHub via the gh CLI
 */

import { execSync } from 'child_process';

export interface GitHubRepo {
  name: string;
  nameWithOwner: string;
}

export interface CreateRepoOptions {
  name: string;
  description?: string;
  isPrivate: boolean;
  cwd: string;
}

export interface CreateRepoResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Checks if the gh CLI is installed and available
 */
export function isGhCliAvailable(): boolean {
  try {
    execSync('gh --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if the gh CLI is authenticated
 */
export function isGhCliAuthenticated(): boolean {
  try {
    execSync('gh auth status', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if gh CLI is ready to use (available + authenticated)
 */
export function isGhCliReady(): boolean {
  return isGhCliAvailable() && isGhCliAuthenticated();
}

/**
 * Gets list of repository names owned by the authenticated user
 * Returns only the repo names (not full paths)
 */
export function getUserRepoNames(): string[] {
  try {
    const output = execSync('gh repo list --json name --limit 1000', {
      stdio: 'pipe',
      encoding: 'utf-8',
    });
    const repos = JSON.parse(output) as GitHubRepo[];
    return repos.map((repo) => repo.name);
  } catch {
    return [];
  }
}

/**
 * Checks if a repository with the given name already exists for the user
 */
export function doesRepoExist(name: string): boolean {
  const repos = getUserRepoNames();
  return repos.includes(name);
}

/**
 * Creates a new GitHub repository and pushes the local code
 * Uses the current directory as the source
 */
export function createGitHubRepo(options: CreateRepoOptions): CreateRepoResult {
  const { name, description, isPrivate, cwd } = options;

  try {
    // Build the command
    const visibility = isPrivate ? '--private' : '--public';
    const descFlag = description ? `--description "${description.replace(/"/g, '\\"')}"` : '';

    const command = `gh repo create ${name} ${visibility} ${descFlag} --source=. --remote=origin --push`.trim();

    execSync(command, {
      cwd,
      stdio: 'pipe',
      encoding: 'utf-8',
    });

    // Get the repo URL
    const url = `https://github.com/${getGitHubUsername()}/${name}`;

    return {
      success: true,
      url,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Gets the authenticated GitHub username
 */
export function getGitHubUsername(): string {
  try {
    const output = execSync('gh api user --jq .login', {
      stdio: 'pipe',
      encoding: 'utf-8',
    });
    return output.trim();
  } catch {
    return '';
  }
}

/**
 * Generates the manual command for users to run if automatic creation fails
 */
export function getManualRepoCommand(
  name: string,
  isPrivate: boolean,
  description?: string
): string {
  const visibility = isPrivate ? '--private' : '--public';
  const descFlag = description ? ` --description "${description}"` : '';
  return `gh repo create ${name} ${visibility}${descFlag} --source=. --remote=origin --push`;
}
