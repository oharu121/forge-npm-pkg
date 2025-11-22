/**
 * GitHub Actions workflow generators
 */

import type { ProjectConfig } from './types.js';
import type { NodeVersionConfig } from '../nodeFetcher.js';
import type { ActionVersionResult } from '../actionsFetcher.js';

/**
 * Generates a CI workflow for GitHub Actions
 * Runs tests, type checking, and linting on push and PR
 */
export function generateCIWorkflow(
  config: ProjectConfig,
  nodeConfig: NodeVersionConfig,
  actionVersions: Map<string, ActionVersionResult>
): string {
  const nodeVersions = nodeConfig.ciMatrix.map(String);

  // Get action versions with fallbacks
  const checkoutVersion = actionVersions.get('actions/checkout')?.version || 'v4';
  const setupNodeVersion = actionVersions.get('actions/setup-node')?.version || 'v4';
  const codecovVersion = actionVersions.get('codecov/codecov-action')?.version || 'v4';

  // Build the steps dynamically based on config
  const steps: string[] = [
    `      - name: Checkout code
        uses: actions/checkout@${checkoutVersion}`,

    `      - name: Setup Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@${setupNodeVersion}
        with:
          node-version: \${{ matrix.node-version }}`,

    `      - name: Install dependencies
        run: npm install`,
  ];

  // Add typecheck step for TypeScript projects
  if (config.language === 'typescript') {
    steps.push(`      - name: Type check
        run: npm run typecheck`);
  }

  // Add lint step if linting is enabled
  if (config.useLinting) {
    steps.push(`      - name: Lint
        run: npm run lint`);
  }

  // Add test step if tests are configured
  // Use coverage in CI if setupCI is enabled, otherwise run regular tests
  if (config.testRunner !== 'none') {
    const testCommand = config.setupCI ? 'npm run test:coverage' : 'npm test';
    steps.push(`      - name: Run tests
        run: ${testCommand}`);
  }

  // Add build step
  steps.push(`      - name: Build
        run: npm run build`);

  // Add coverage upload only if Codecov is enabled and tests are configured
  // Only upload for latest LTS to avoid duplicate uploads
  if (config.testRunner !== 'none' && config.useCodecov) {
    steps.push(`      - name: Upload coverage to Codecov
        if: matrix.node-version == '${nodeConfig.latestLTS}'
        uses: codecov/codecov-action@${codecovVersion}
        continue-on-error: true
        with:
          token: \${{ secrets.CODECOV_TOKEN }}
          fail_ci_if_error: false`);
  }

  return `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [${nodeVersions.join(', ')}]
    steps:
${steps.join('\n\n')}
`;
}

/**
 * Generates a CD (Continuous Deployment) workflow for GitHub Actions
 * Publishes package to npm when a release is created
 */
export function generateCDWorkflow(
  nodeConfig: NodeVersionConfig,
  actionVersions: Map<string, ActionVersionResult>
): string {
  // Get action versions with fallbacks
  const checkoutVersion = actionVersions.get('actions/checkout')?.version || 'v4';
  const setupNodeVersion = actionVersions.get('actions/setup-node')?.version || 'v4';

  return `name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write

    steps:
      - name: Checkout
        uses: actions/checkout@${checkoutVersion}

      - name: Setup Node.js
        uses: actions/setup-node@${setupNodeVersion}
        with:
          node-version: '${nodeConfig.latestLTS}.x'
          registry-url: 'https://registry.npmjs.org'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run Tests
        run: npm run test:all

      - name: Publish to npm
        run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: \${{ secrets.NPM_TOKEN }}
`;
}

/**
 * Generates Dependabot configuration for automated dependency updates
 * Creates a .github/dependabot.yml file that checks npm dependencies weekly
 * Groups dev dependencies together to reduce PR noise
 */
export function generateDependabotConfig(): string {
  return `version: 2
updates:
  # Check for npm dependency updates
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
    # Group all development dependencies together
    groups:
       dev-dependencies:
          dependency-type: "development"

  # Check for GitHub Actions updates
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    # Group all actions together
    groups:
       actions:
          patterns:
            - "*"
`;
}

