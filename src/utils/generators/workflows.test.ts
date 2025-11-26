import { describe, it, expect } from 'vitest';
import { generateCIWorkflow, generateDependabotConfig, generateDependabotAutoMergeWorkflow } from './workflows';
import type { ProjectConfig } from './types';
import type { NodeVersionConfig } from '../nodeFetcher';
import type { ActionVersionResult } from '../actionsFetcher';

describe('generateCIWorkflow', () => {
  const mockNodeConfig: NodeVersionConfig = {
    minimum: 20,
    engines: '>=20.0.0',
    ciMatrix: [20, 22],
    latestLTS: 22
  };

  const mockActionVersions = new Map<string, ActionVersionResult>([
    ['actions/checkout', { version: 'v5' }],
    ['actions/setup-node', { version: 'v6' }],
    ['codecov/codecov-action', { version: 'v5' }]
  ]);

  it('should generate CI workflow with all steps for TypeScript project with tests and linting', () => {
    const config: ProjectConfig = {
      packageName: 'test-package',
      language: 'typescript',
      moduleType: 'esm',
      testRunner: 'vitest',
      useLinting: true,
      initGit: false,
      setupCI: true,
      setupCD: false,
      useCodecov: true, // Enable Codecov for this test
    };

    const workflow = generateCIWorkflow(config, mockNodeConfig, mockActionVersions);

    expect(workflow).toContain('name: CI');
    expect(workflow).toContain('on:');
    expect(workflow).toContain('push:');
    expect(workflow).toContain('pull_request:');
    expect(workflow).toContain('matrix:');
    expect(workflow).toContain('node-version: [20, 22]');
    expect(workflow).toContain('npm run typecheck');
    expect(workflow).toContain('npm run lint');
    expect(workflow).toContain('npm run test:coverage');
    expect(workflow).toContain('npm run build');
    expect(workflow).toContain('codecov');
    expect(workflow).toContain('actions/checkout@v5');
    expect(workflow).toContain('actions/setup-node@v6');
    expect(workflow).toContain('codecov/codecov-action@v5');
  });

  it('should not include typecheck for JavaScript projects', () => {
    const config: ProjectConfig = {
      packageName: 'test-package',
      language: 'javascript',
      moduleType: 'esm',
      testRunner: 'vitest',
      useLinting: true,
      initGit: false,
      setupCI: true,
      setupCD: false,
    };

    const workflow = generateCIWorkflow(config, mockNodeConfig, mockActionVersions);

    expect(workflow).not.toContain('npm run typecheck');
    expect(workflow).toContain('npm run lint');
    expect(workflow).toContain('npm run test:coverage');
  });

  it('should not include lint step when linting is disabled', () => {
    const config: ProjectConfig = {
      packageName: 'test-package',
      language: 'typescript',
      moduleType: 'esm',
      testRunner: 'vitest',
      useLinting: false,
      initGit: false,
      setupCI: true,
      setupCD: false,
    };

    const workflow = generateCIWorkflow(config, mockNodeConfig, mockActionVersions);

    expect(workflow).not.toContain('npm run lint');
    expect(workflow).toContain('npm run typecheck');
    expect(workflow).toContain('npm run test:coverage');
  });

  it('should not include test step when tests are disabled', () => {
    const config: ProjectConfig = {
      packageName: 'test-package',
      language: 'typescript',
      moduleType: 'esm',
      testRunner: 'none',
      useLinting: true,
      initGit: false,
      setupCI: true,
      setupCD: false,
      useCodecov: false,
    };

    const workflow = generateCIWorkflow(config, mockNodeConfig, mockActionVersions);

    expect(workflow).not.toContain('npm test');
    expect(workflow).not.toContain('npm run test:coverage');
    expect(workflow).not.toContain('codecov');
    expect(workflow).toContain('npm run typecheck');
    expect(workflow).toContain('npm run build');
  });

  it('should not include Codecov when useCodecov is false', () => {
    const config: ProjectConfig = {
      packageName: 'test-package',
      language: 'typescript',
      moduleType: 'esm',
      testRunner: 'vitest',
      useLinting: true,
      initGit: false,
      setupCI: true,
      setupCD: false,
      useCodecov: false, // Explicitly disable Codecov
    };

    const workflow = generateCIWorkflow(config, mockNodeConfig, mockActionVersions);

    expect(workflow).toContain('npm run test:coverage');
    expect(workflow).not.toContain('codecov');
    expect(workflow).toContain('npm run build');
  });
});

describe('generateDependabotConfig', () => {
  it('should generate valid Dependabot configuration', () => {
    const config = generateDependabotConfig();

    expect(config).toContain('version: 2');
    expect(config).toContain('package-ecosystem: "npm"');
    expect(config).toContain('directory: "/"');
    expect(config).toContain('interval: "weekly"');
    expect(config).toContain('open-pull-requests-limit: 10');
    expect(config).toContain('dependencies');
  });
});

describe('generateDependabotAutoMergeWorkflow', () => {
  const mockActionVersions = new Map<string, ActionVersionResult>([
    ['dependabot/fetch-metadata', { version: 'v2' }]
  ]);

  it('should generate valid auto-merge workflow', () => {
    const workflow = generateDependabotAutoMergeWorkflow(mockActionVersions);

    expect(workflow).toContain('name: Dependabot Auto-Merge');
    expect(workflow).toContain('pull_request_target');
    expect(workflow).toContain("github.actor == 'dependabot[bot]'");
    expect(workflow).toContain('dependabot/fetch-metadata@v2');
  });

  it('should use squash merge method', () => {
    const workflow = generateDependabotAutoMergeWorkflow(mockActionVersions);

    expect(workflow).toContain('gh pr merge --auto --squash');
  });

  it('should have required permissions', () => {
    const workflow = generateDependabotAutoMergeWorkflow(mockActionVersions);

    expect(workflow).toContain('contents: write');
    expect(workflow).toContain('pull-requests: write');
  });

  it('should use fallback version when not provided', () => {
    const emptyVersions = new Map<string, ActionVersionResult>();
    const workflow = generateDependabotAutoMergeWorkflow(emptyVersions);

    expect(workflow).toContain('dependabot/fetch-metadata@v2');
  });
});
