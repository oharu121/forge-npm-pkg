#!/usr/bin/env node

import { Command } from 'commander';
import * as clack from '@clack/prompts';
import { existsSync } from 'fs';
import { mkdir, writeFile, copyFile, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import {
  generatePackageJson,
  generateTsConfig,
  generateTsupConfig,
  generateEslintConfig,
  generatePrettierConfig,
  generateVitestConfig,
  generateJestConfig,
  generateReadme,
  generateGitignore,
} from './utils/generators.js';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ProjectConfig {
  packageName: string;
  language: 'typescript' | 'javascript';
  moduleType: 'esm' | 'commonjs' | 'dual';
  testRunner: 'vitest' | 'jest' | 'none';
  useLinting: boolean;
  useChangesets: boolean;
  initGit: boolean;
}

const program = new Command();

program
  .name('create-npm-package')
  .description('Scaffold a production-ready npm package')
  .argument('[package-name]', 'Name of the package to create')
  .action(async (packageName?: string) => {
    console.clear();

    clack.intro('🚀 Create NPM Package');

    try {
      // Step 1: Get or confirm package name
      let finalPackageName = packageName;

      if (!finalPackageName) {
        const nameInput = await clack.text({
          message: 'What is your package name?',
          placeholder: 'my-awesome-package',
          validate: (value) => {
            if (!value) return 'Package name is required';
            if (!/^[a-z0-9-_@/]+$/.test(value)) {
              return 'Package name can only contain lowercase letters, numbers, hyphens, underscores, and @/';
            }
            return undefined;
          },
        });

        if (clack.isCancel(nameInput)) {
          clack.cancel('Operation cancelled');
          process.exit(0);
        }

        finalPackageName = nameInput;
      } else {
        const confirmed = await clack.confirm({
          message: `Create package "${packageName}"?`,
        });

        if (clack.isCancel(confirmed) || !confirmed) {
          clack.cancel('Operation cancelled');
          process.exit(0);
        }
      }

      // Check if directory already exists
      const targetDir = join(process.cwd(), finalPackageName);
      if (existsSync(targetDir)) {
        clack.cancel(`Directory "${finalPackageName}" already exists`);
        process.exit(1);
      }

      // Step 2: Ask configuration questions
      const language = await clack.select({
        message: 'Which language?',
        options: [
          { value: 'typescript', label: 'TypeScript' },
          { value: 'javascript', label: 'JavaScript' },
        ],
      });

      if (clack.isCancel(language)) {
        clack.cancel('Operation cancelled');
        process.exit(0);
      }

      const moduleType = await clack.select({
        message: 'Which module format?',
        options: [
          { value: 'esm', label: 'ESM (Modern)', hint: 'Recommended' },
          { value: 'commonjs', label: 'CommonJS (Legacy)' },
          { value: 'dual', label: 'Dual (ESM + CJS)', hint: 'Maximum compatibility' },
        ],
      });

      if (clack.isCancel(moduleType)) {
        clack.cancel('Operation cancelled');
        process.exit(0);
      }

      const testRunner = await clack.select({
        message: 'Which test runner?',
        options: [
          { value: 'vitest', label: 'Vitest', hint: 'Fast & modern' },
          { value: 'jest', label: 'Jest', hint: 'Battle-tested' },
          { value: 'none', label: 'None' },
        ],
      });

      if (clack.isCancel(testRunner)) {
        clack.cancel('Operation cancelled');
        process.exit(0);
      }

      const useLinting = await clack.confirm({
        message: 'Initialize ESLint + Prettier?',
        initialValue: true,
      });

      if (clack.isCancel(useLinting)) {
        clack.cancel('Operation cancelled');
        process.exit(0);
      }

      const useChangesets = await clack.confirm({
        message: 'Set up automated releases with Changesets?',
        initialValue: false,
      });

      if (clack.isCancel(useChangesets)) {
        clack.cancel('Operation cancelled');
        process.exit(0);
      }

      const initGit = await clack.confirm({
        message: 'Initialize a new git repository?',
        initialValue: true,
      });

      if (clack.isCancel(initGit)) {
        clack.cancel('Operation cancelled');
        process.exit(0);
      }

      const config: ProjectConfig = {
        packageName: finalPackageName,
        language: language as 'typescript' | 'javascript',
        moduleType: moduleType as 'esm' | 'commonjs' | 'dual',
        testRunner: testRunner as 'vitest' | 'jest' | 'none',
        useLinting,
        useChangesets,
        initGit,
      };

      // Step 3: Create project
      const spinner = clack.spinner();
      spinner.start('Creating project structure');

      await createProject(config, targetDir);

      spinner.stop('Project created successfully!');

      // Step 4: Install dependencies
      spinner.start('Installing dependencies');

      try {
        // Detect package manager
        const packageManager = detectPackageManager();

        execSync(`${packageManager} install`, {
          cwd: targetDir,
          stdio: 'pipe',
        });

        spinner.stop('Dependencies installed!');
      } catch (error) {
        spinner.stop('Failed to install dependencies');
        clack.note(
          'You can install them manually by running:\n  cd ' +
            finalPackageName +
            '\n  npm install',
          'Manual Installation Required'
        );
      }

      // Step 5: Initialize git
      if (config.initGit) {
        spinner.start('Initializing git repository');
        try {
          execSync('git init', { cwd: targetDir, stdio: 'pipe' });
          execSync('git add .', { cwd: targetDir, stdio: 'pipe' });
          execSync('git commit -m "chore: initial commit"', {
            cwd: targetDir,
            stdio: 'pipe',
          });
          spinner.stop('Git repository initialized!');
        } catch (error) {
          spinner.stop('Failed to initialize git');
        }
      }

      // Step 6: Initialize changesets
      if (config.useChangesets) {
        spinner.start('Initializing changesets');
        try {
          execSync('npx changeset init', { cwd: targetDir, stdio: 'pipe' });
          spinner.stop('Changesets initialized!');
        } catch (error) {
          spinner.stop('Failed to initialize changesets');
        }
      }

      // Success message
      clack.outro('✨ All done! Your package is ready.');

      console.log('\n📦 Next steps:\n');
      console.log(`  cd ${finalPackageName}`);
      console.log('  npm run build        # Build your package');
      if (config.testRunner !== 'none') {
        console.log('  npm test             # Run tests');
      }
      console.log('  npm run check:exports # Validate package exports');
      if (config.useLinting) {
        console.log('  npm run lint         # Lint your code');
      }
      console.log('');
    } catch (error) {
      clack.cancel('An error occurred');
      console.error(error);
      process.exit(1);
    }
  });

program.parse();

/**
 * Creates the project directory structure and files
 */
async function createProject(config: ProjectConfig, targetDir: string): Promise<void> {
  // Create main directory
  await mkdir(targetDir, { recursive: true });

  // Create src directory
  const srcDir = join(targetDir, 'src');
  await mkdir(srcDir, { recursive: true });

  // Create example source file
  const mainFile = config.language === 'typescript' ? 'index.ts' : 'index.js';
  const exampleCode =
    config.language === 'typescript'
      ? `/**
 * Example function that greets a user
 * @param name - The name to greet
 * @returns A greeting message
 */
export function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

/**
 * Example function that adds two numbers
 * @param a - First number
 * @param b - Second number
 * @returns The sum of a and b
 */
export function add(a: number, b: number): number {
  return a + b;
}
`
      : `/**
 * Example function that greets a user
 * @param {string} name - The name to greet
 * @returns {string} A greeting message
 */
export function greet(name) {
  return \`Hello, \${name}!\`;
}

/**
 * Example function that adds two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} The sum of a and b
 */
export function add(a, b) {
  return a + b;
}
`;

  await writeFile(join(srcDir, mainFile), exampleCode);

  // Create test file if testing is enabled
  if (config.testRunner !== 'none') {
    const testExt = config.language === 'typescript' ? 'ts' : 'js';
    const testFile = `index.test.${testExt}`;
    const testCode =
      config.language === 'typescript'
        ? `import { describe, it, expect } from '${config.testRunner === 'vitest' ? 'vitest' : '@jest/globals'}';
import { greet, add } from './index.js';

describe('greet', () => {
  it('should return a greeting message', () => {
    expect(greet('World')).toBe('Hello, World!');
  });
});

describe('add', () => {
  it('should add two numbers correctly', () => {
    expect(add(2, 3)).toBe(5);
  });
});
`
        : `import { describe, it, expect } from '${config.testRunner === 'vitest' ? 'vitest' : '@jest/globals'}';
import { greet, add } from './index.js';

describe('greet', () => {
  it('should return a greeting message', () => {
    expect(greet('World')).toBe('Hello, World!');
  });
});

describe('add', () => {
  it('should add two numbers correctly', () => {
    expect(add(2, 3)).toBe(5);
  });
});
`;

    await writeFile(join(srcDir, testFile), testCode);
  }

  // Generate configuration files
  await writeFile(
    join(targetDir, 'package.json'),
    JSON.stringify(generatePackageJson(config), null, 2)
  );

  await writeFile(join(targetDir, 'README.md'), generateReadme(config));
  await writeFile(join(targetDir, '.gitignore'), generateGitignore());

  // TypeScript-specific files
  if (config.language === 'typescript') {
    await writeFile(
      join(targetDir, 'tsconfig.json'),
      JSON.stringify(generateTsConfig(config), null, 2)
    );
    await writeFile(
      join(targetDir, 'tsup.config.ts'),
      generateTsupConfig(config)
    );
  }

  // Linting files
  if (config.useLinting) {
    await writeFile(
      join(targetDir, '.eslintrc.json'),
      JSON.stringify(generateEslintConfig(config), null, 2)
    );
    await writeFile(
      join(targetDir, '.prettierrc'),
      JSON.stringify(generatePrettierConfig(), null, 2)
    );
  }

  // Test configuration files
  if (config.testRunner === 'vitest') {
    await writeFile(
      join(targetDir, 'vitest.config.ts'),
      generateVitestConfig(config)
    );
  } else if (config.testRunner === 'jest') {
    const jestExt = config.language === 'typescript' ? 'ts' : 'js';
    await writeFile(
      join(targetDir, `jest.config.${jestExt}`),
      generateJestConfig(config)
    );
  }

  // GitHub Actions workflow for Changesets
  if (config.useChangesets) {
    const workflowDir = join(targetDir, '.github', 'workflows');
    await mkdir(workflowDir, { recursive: true });

    const releaseWorkflow = `name: Release

on:
  push:
    branches:
      - main

concurrency: \${{ github.workflow }}-\${{ github.ref }}

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Create Release Pull Request or Publish to npm
        id: changesets
        uses: changesets/action@v1
        with:
          publish: npm run release
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: \${{ secrets.NPM_TOKEN }}
`;

    await writeFile(join(workflowDir, 'release.yml'), releaseWorkflow);
  }
}

/**
 * Detects which package manager the user prefers
 */
function detectPackageManager(): string {
  const userAgent = process.env.npm_config_user_agent || '';

  if (userAgent.includes('pnpm')) return 'pnpm';
  if (userAgent.includes('yarn')) return 'yarn';
  if (userAgent.includes('bun')) return 'bun';

  return 'npm';
}
