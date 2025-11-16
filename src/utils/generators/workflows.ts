/**
 * GitHub Actions workflow generators
 */

import type { ProjectConfig } from './types.js';

/**
 * Generates a CI workflow for GitHub Actions
 * Runs tests, type checking, and linting on push and PR
 */
export function generateCIWorkflow(config: ProjectConfig): string {
  const nodeVersions = ['18', '20', '22'];

  // Build the steps dynamically based on config
  const steps: string[] = [
    `      - name: Checkout code
        uses: actions/checkout@v4`,

    `      - name: Setup Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v4
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
  // Only upload for Node 20 to avoid duplicate uploads
  if (config.testRunner !== 'none' && config.useCodecov) {
    steps.push(`      - name: Upload coverage to Codecov
        if: matrix.node-version == '20'
        uses: codecov/codecov-action@v4
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

