/**
 * Generator functions for creating configuration files
 * This module contains all the logic for generating package.json, tsconfig.json,
 * and other configuration files based on user preferences.
 */

interface ProjectConfig {
  packageName: string;
  language: 'typescript' | 'javascript';
  moduleType: 'esm' | 'commonjs' | 'dual';
  testRunner: 'vitest' | 'jest' | 'none';
  useLinting: boolean;
  useChangesets: boolean;
  initGit: boolean;
}

/**
 * Generates a complete package.json based on the project configuration.
 * This is the most critical function as it handles the complex exports mapping
 * for different module types (ESM, CommonJS, Dual).
 */
export function generatePackageJson(config: ProjectConfig): Record<string, any> {
  const pkg: Record<string, any> = {
    name: config.packageName,
    version: '0.1.0',
    description: 'A new npm package',
    // Set package type based on module format
    type: config.moduleType === 'commonjs' ? 'commonjs' : 'module',
    // Entry points - these depend on both language and module type
    ...generateEntryPoints(config),
    files: config.language === 'typescript' ? ['dist'] : ['src'],
    scripts: generateScripts(config),
    keywords: [],
    author: '',
    license: 'MIT',
    devDependencies: generateDevDependencies(config),
  };

  // Add release script if using changesets
  if (config.useChangesets) {
    pkg.scripts.release = 'changeset publish';
  }

  return pkg;
}

/**
 * Generates the entry points (main, module, types, exports) for package.json.
 * This is complex because it needs to handle:
 * - ESM-only packages
 * - CommonJS-only packages
 * - Dual packages (both ESM and CJS)
 * - TypeScript declaration files
 */
function generateEntryPoints(config: ProjectConfig): Record<string, any> {
  const isTypeScript = config.language === 'typescript';
  const baseDir = isTypeScript ? 'dist' : 'src';

  const entryPoints: Record<string, any> = {};

  // For JavaScript projects without build step
  if (!isTypeScript) {
    entryPoints.main = './src/index.js';
    if (config.moduleType === 'esm' || config.moduleType === 'dual') {
      entryPoints.module = './src/index.js';
    }
    entryPoints.exports = {
      '.': './src/index.js',
    };
    return entryPoints;
  }

  // TypeScript projects with build step
  switch (config.moduleType) {
    case 'esm':
      // ESM-only: Use .js extension (with "type": "module" in package.json)
      entryPoints.main = './dist/index.js';
      entryPoints.types = './dist/index.d.ts';
      entryPoints.exports = {
        '.': {
          types: './dist/index.d.ts',
          import: './dist/index.js',
        },
      };
      break;

    case 'commonjs':
      // CommonJS-only: Use .js extension (with "type": "commonjs")
      entryPoints.main = './dist/index.js';
      entryPoints.types = './dist/index.d.ts';
      entryPoints.exports = {
        '.': {
          types: './dist/index.d.ts',
          require: './dist/index.js',
        },
      };
      break;

    case 'dual':
      // Dual format: Export both ESM (.mjs) and CJS (.js)
      // This provides maximum compatibility
      entryPoints.main = './dist/index.js'; // CJS default
      entryPoints.module = './dist/index.mjs'; // ESM
      entryPoints.types = './dist/index.d.ts';
      entryPoints.exports = {
        '.': {
          types: './dist/index.d.ts',
          import: './dist/index.mjs',
          require: './dist/index.js',
        },
      };
      break;
  }

  return entryPoints;
}

/**
 * Generates npm scripts based on project configuration
 */
function generateScripts(config: ProjectConfig): Record<string, string> {
  const scripts: Record<string, string> = {};

  // Build script (only for TypeScript)
  if (config.language === 'typescript') {
    scripts.build = 'tsup';
    scripts.typecheck = 'tsc --noEmit';
  }

  // Test script
  if (config.testRunner === 'vitest') {
    scripts.test = 'vitest run';
    scripts['test:watch'] = 'vitest';
  } else if (config.testRunner === 'jest') {
    scripts.test = 'jest';
    scripts['test:watch'] = 'jest --watch';
  }

  // Linting scripts
  if (config.useLinting) {
    const ext = config.language === 'typescript' ? 'ts' : 'js';
    scripts.lint = `eslint . --ext .${ext}`;
    scripts['lint:fix'] = `eslint . --ext .${ext} --fix`;
    scripts.format = 'prettier --write "src/**/*.{ts,js,json,md}"';
    scripts['format:check'] = 'prettier --check "src/**/*.{ts,js,json,md}"';
  }

  // Package validation (only for TypeScript as it checks types)
  if (config.language === 'typescript') {
    scripts['check:exports'] = 'attw --pack';
  }

  // Prepublish hook
  if (config.language === 'typescript') {
    scripts.prepublishOnly = 'npm run build';
  }

  return scripts;
}

/**
 * Generates the devDependencies object based on project configuration
 */
function generateDevDependencies(config: ProjectConfig): Record<string, string> {
  const deps: Record<string, string> = {};

  // TypeScript and build tools
  if (config.language === 'typescript') {
    deps.typescript = '^5.3.3';
    deps.tsup = '^8.0.1';
    deps['@types/node'] = '^20.11.0';
    // Package validation tool
    deps['@arethetypeswrong/cli'] = '^0.15.0';
  }

  // Test runners
  if (config.testRunner === 'vitest') {
    deps.vitest = '^1.2.0';
  } else if (config.testRunner === 'jest') {
    deps.jest = '^29.7.0';
    if (config.language === 'typescript') {
      deps['ts-jest'] = '^29.1.1';
      deps['@types/jest'] = '^29.5.11';
    }
  }

  // Linting tools
  if (config.useLinting) {
    if (config.language === 'typescript') {
      deps['@typescript-eslint/eslint-plugin'] = '^6.19.0';
      deps['@typescript-eslint/parser'] = '^6.19.0';
    }
    deps.eslint = '^8.56.0';
    deps.prettier = '^3.2.4';
    deps['eslint-config-prettier'] = '^9.1.0';
  }

  // Changesets for automated releases
  if (config.useChangesets) {
    deps['@changesets/cli'] = '^2.27.1';
  }

  return deps;
}

/**
 * Generates tsconfig.json for TypeScript projects
 */
export function generateTsConfig(config: ProjectConfig): Record<string, any> {
  const moduleResolution = config.moduleType === 'commonjs' ? 'node' : 'bundler';
  const module = config.moduleType === 'commonjs' ? 'CommonJS' : 'ESNext';

  return {
    compilerOptions: {
      // Target modern JavaScript
      target: 'ES2020',
      module,
      lib: ['ES2020'],
      moduleResolution,

      // Output directory
      outDir: './dist',
      rootDir: './src',

      // Enable all strict checks
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,

      // Declaration files
      declaration: true,
      declarationMap: true,

      // Source maps for debugging
      sourceMap: true,

      // Additional checks
      noUnusedLocals: true,
      noUnusedParameters: true,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,

      // Module resolution
      resolveJsonModule: true,
      allowSyntheticDefaultImports: true,
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist', '**/*.test.ts', '**/*.spec.ts'],
  };
}

/**
 * Generates tsup.config.ts for building TypeScript packages
 */
export function generateTsupConfig(config: ProjectConfig): string {
  const formats: string[] = [];

  // Determine output formats based on module type
  if (config.moduleType === 'esm') {
    formats.push("'esm'");
  } else if (config.moduleType === 'commonjs') {
    formats.push("'cjs'");
  } else {
    // Dual format
    formats.push("'cjs'", "'esm'");
  }

  return `import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: [${formats.join(', ')}],
  dts: true, // Generate declaration files
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
});
`;
}

/**
 * Generates ESLint configuration
 */
export function generateEslintConfig(config: ProjectConfig): Record<string, any> {
  const eslintConfig: Record<string, any> = {
    env: {
      node: true,
      es2021: true,
    },
    extends: ['eslint:recommended'],
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {},
  };

  // TypeScript-specific config
  if (config.language === 'typescript') {
    eslintConfig.parser = '@typescript-eslint/parser';
    eslintConfig.plugins = ['@typescript-eslint'];
    eslintConfig.extends.push(
      'plugin:@typescript-eslint/recommended',
      'prettier'
    );
  } else {
    eslintConfig.extends.push('prettier');
  }

  return eslintConfig;
}

/**
 * Generates Prettier configuration
 */
export function generatePrettierConfig(): Record<string, any> {
  return {
    semi: true,
    trailingComma: 'es5',
    singleQuote: true,
    printWidth: 100,
    tabWidth: 2,
    useTabs: false,
  };
}

/**
 * Generates Vitest configuration
 */
export function generateVitestConfig(config: ProjectConfig): string {
  return `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
`;
}

/**
 * Generates Jest configuration
 */
export function generateJestConfig(config: ProjectConfig): string {
  if (config.language === 'typescript') {
    const preset = config.moduleType === 'esm' ? 'ts-jest/presets/default-esm' : 'ts-jest';
    const extensionsToTreatAsEsm = config.moduleType === 'esm' ? "  extensionsToTreatAsEsm: ['.ts'],\n" : '';

    return `import type { Config } from 'jest';

const config: Config = {
  preset: '${preset}',
${extensionsToTreatAsEsm}  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
  ],
};

export default config;
`;
  } else {
    return `export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
  ],
};
`;
  }
}

/**
 * Generates README.md
 */
export function generateReadme(config: ProjectConfig): string {
  return `# ${config.packageName}

A new npm package created with create-npm-package.

## Installation

\`\`\`bash
npm install ${config.packageName}
\`\`\`

## Usage

\`\`\`${config.language}
import { greet } from '${config.packageName}';

console.log(greet('World')); // Hello, World!
\`\`\`

## Development

### Build

\`\`\`bash
npm run build
\`\`\`

${config.testRunner !== 'none' ? `### Test

\`\`\`bash
npm test
\`\`\`
` : ''}
${config.useLinting ? `### Lint

\`\`\`bash
npm run lint
npm run format
\`\`\`
` : ''}
${config.language === 'typescript' ? `### Validate Package Exports

\`\`\`bash
npm run check:exports
\`\`\`
` : ''}
## License

MIT
`;
}

/**
 * Generates .gitignore
 */
export function generateGitignore(): string {
  return `# Dependencies
node_modules/
.pnp/
.pnp.js

# Testing
coverage/
*.lcov
.nyc_output/

# Build output
dist/
build/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Editor directories
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Temporary files
*.tmp
.cache/
.temp/

# Package manager files
.yarn/
.pnpm-store/
.npm/
package-lock.json
yarn.lock
pnpm-lock.yaml
bun.lockb
`;
}
