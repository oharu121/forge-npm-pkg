# Complete Project Structure

This document shows the complete file structure of the `create-npm-package` CLI tool.

## CLI Tool Structure (What You Build)

```
create-npm-package/
├── src/
│   ├── index.ts                    # Main CLI entry point with prompts and logic
│   └── utils/
│       └── generators.ts           # Functions to generate config files
│
├── dist/                           # Built output (created by tsup)
│   ├── index.js                    # Compiled CLI
│   ├── index.d.ts                  # Type declarations
│   └── utils/
│       └── generators.js
│
├── node_modules/                   # Dependencies (from npm install)
│
├── package.json                    # CLI tool's package.json
├── tsconfig.json                   # TypeScript config for the CLI
├── tsup.config.ts                  # Build config for the CLI
├── .gitignore                      # Git ignore rules
├── .npmignore                      # npm publish ignore rules
├── LICENSE                         # MIT License
├── README.md                       # Main documentation
├── ARCHITECTURE.md                 # Internal architecture docs
├── EXAMPLES.md                     # Usage examples
└── PROJECT_STRUCTURE.md            # This file
```

## Generated Package Structure (What Users Get)

When a user runs `npx create-npm-package my-package`, they get:

### Example 1: TypeScript + ESM + Vitest + Linting

```
my-package/
├── src/
│   ├── index.ts                    # Main source file with example code
│   └── index.test.ts               # Test file with example tests
│
├── dist/                           # Built output (after npm run build)
│   ├── index.js                    # Compiled JavaScript
│   ├── index.d.ts                  # TypeScript declarations
│   └── index.js.map                # Source map
│
├── node_modules/                   # Dependencies
│
├── package.json                    # Generated package.json
│   # {
│   #   "name": "my-package",
│   #   "type": "module",
│   #   "main": "./dist/index.js",
│   #   "types": "./dist/index.d.ts",
│   #   "exports": {
│   #     ".": {
│   #       "types": "./dist/index.d.ts",
│   #       "import": "./dist/index.js"
│   #     }
│   #   },
│   #   "scripts": {
│   #     "build": "tsup",
│   #     "test": "vitest run",
│   #     "lint": "eslint . --ext .ts",
│   #     "check:exports": "attw --pack"
│   #   }
│   # }
│
├── tsconfig.json                   # TypeScript compiler options
│   # {
│   #   "compilerOptions": {
│   #     "target": "ES2020",
│   #     "module": "ESNext",
│   #     "strict": true,
│   #     ...
│   #   }
│   # }
│
├── tsup.config.ts                  # Build configuration
│   # import { defineConfig } from 'tsup';
│   # export default defineConfig({
│   #   entry: ['src/index.ts'],
│   #   format: ['esm'],
│   #   dts: true,
│   #   ...
│   # });
│
├── vitest.config.ts                # Test configuration
│   # import { defineConfig } from 'vitest/config';
│   # export default defineConfig({
│   #   test: {
│   #     globals: true,
│   #     ...
│   #   }
│   # });
│
├── .eslintrc.json                  # ESLint configuration
│   # {
│   #   "parser": "@typescript-eslint/parser",
│   #   "extends": [
│   #     "eslint:recommended",
│   #     "plugin:@typescript-eslint/recommended",
│   #     "prettier"
│   #   ]
│   # }
│
├── .prettierrc                     # Prettier configuration
│   # {
│   #   "semi": true,
│   #   "singleQuote": true,
│   #   ...
│   # }
│
├── .gitignore                      # Git ignore patterns
├── README.md                       # Package documentation
└── LICENSE                         # MIT License (if added)
```

### Example 2: TypeScript + Dual + Jest + Changesets

```
my-dual-package/
├── src/
│   ├── index.ts
│   └── index.test.ts
│
├── dist/
│   ├── index.js                    # CommonJS build
│   ├── index.mjs                   # ESM build
│   ├── index.d.ts                  # TypeScript declarations
│   └── *.map                       # Source maps
│
├── .changeset/
│   ├── config.json                 # Changesets configuration
│   └── README.md                   # Changesets usage guide
│
├── .github/
│   └── workflows/
│       └── release.yml             # Automated release workflow
│           # name: Release
│           # on:
│           #   push:
│           #     branches: [main]
│           # jobs:
│           #   release:
│           #     runs-on: ubuntu-latest
│           #     steps:
│           #       - uses: actions/checkout@v4
│           #       - uses: actions/setup-node@v4
│           #       - run: npm install
│           #       - run: npm run build
│           #       - uses: changesets/action@v1
│
├── node_modules/
│
├── package.json
│   # {
│   #   "name": "my-dual-package",
│   #   "type": "module",
│   #   "main": "./dist/index.js",
│   #   "module": "./dist/index.mjs",
│   #   "types": "./dist/index.d.ts",
│   #   "exports": {
│   #     ".": {
│   #       "types": "./dist/index.d.ts",
│   #       "import": "./dist/index.mjs",
│   #       "require": "./dist/index.js"
│   #     }
│   #   },
│   #   "scripts": {
│   #     "build": "tsup",
│   #     "test": "jest",
│   #     "check:exports": "attw --pack",
│   #     "release": "changeset publish"
│   #   }
│   # }
│
├── tsconfig.json
├── tsup.config.ts
│   # import { defineConfig } from 'tsup';
│   # export default defineConfig({
│   #   entry: ['src/index.ts'],
│   #   format: ['cjs', 'esm'],      # DUAL FORMAT!
│   #   dts: true,
│   #   ...
│   # });
│
├── jest.config.ts
├── .gitignore
├── README.md
└── .git/                          # Git repository
```

### Example 3: JavaScript + ESM (No Build)

```
simple-package/
├── src/
│   ├── index.js                    # Source code (published directly)
│   └── index.test.js               # Tests
│
├── node_modules/
│
├── package.json
│   # {
│   #   "name": "simple-package",
│   #   "type": "module",
│   #   "main": "./src/index.js",   # Points to source, not dist!
│   #   "exports": {
│   #     ".": "./src/index.js"
│   #   },
│   #   "files": ["src"],           # Publish src directory
│   #   "scripts": {
│   #     "test": "vitest run",
│   #     "lint": "eslint . --ext .js"
│   #   }
│   # }
│
├── vitest.config.ts
├── .eslintrc.json
├── .prettierrc
├── .gitignore
└── README.md
```

## Key Files Explained

### package.json (Generated)

The most important file. Contains:
- Package metadata (name, version, description)
- Module type (`"type": "module"` or `"commonjs"`)
- Entry points (`main`, `module`, `types`)
- **Exports map** (critical for proper resolution)
- Scripts (build, test, lint, etc.)
- Dependencies

### tsconfig.json (Generated if TypeScript)

TypeScript compiler configuration:
- Target: ES2020
- Module: ESNext (for ESM) or CommonJS
- Strict mode enabled
- Declaration files enabled
- Source maps enabled

### tsup.config.ts (Generated if TypeScript)

Build tool configuration:
- Entry point: `src/index.ts`
- Output formats: `['esm']`, `['cjs']`, or `['cjs', 'esm']`
- Declaration files: `dts: true`
- Source maps: `sourcemap: true`
- Tree shaking: `treeshake: true`

### vitest.config.ts or jest.config.ts (Generated if testing enabled)

Test framework configuration:
- Test environment: Node.js
- Coverage settings
- Globals (for Vitest)
- TypeScript support

### .github/workflows/release.yml (Generated if Changesets enabled)

GitHub Actions workflow:
- Triggers on push to main
- Installs dependencies
- Builds the package
- Runs changesets action
- Publishes to npm (if changesets exist)

## How Files Are Generated

All configuration files are generated by functions in `src/utils/generators.ts`:

```typescript
// Main generator function
export function generatePackageJson(config: ProjectConfig): object {
  // Dynamic generation based on user choices
  // Handles ESM, CommonJS, Dual formats
  // Adds appropriate scripts and dependencies
}

// Entry points generator (most complex)
function generateEntryPoints(config: ProjectConfig): object {
  // Returns: main, module, types, exports
  // Different structure for each module type
}

// Other generators
export function generateTsConfig(config: ProjectConfig): object;
export function generateTsupConfig(config: ProjectConfig): string;
export function generateEslintConfig(config: ProjectConfig): object;
export function generateVitestConfig(config: ProjectConfig): string;
export function generateJestConfig(config: ProjectConfig): string;
export function generateReadme(config: ProjectConfig): string;
export function generateGitignore(): string;
```

## Build Process

### Building the CLI Tool

```bash
npm run build
# Runs: tsup
# Input: src/index.ts, src/utils/generators.ts
# Output: dist/index.js, dist/utils/generators.js
```

### Building a Generated Package

```bash
cd my-package
npm run build
# Runs: tsup (with generated tsup.config.ts)
# Input: src/index.ts
# Output: dist/index.js (and .mjs for dual format)
```

## Publishing

### Publishing the CLI Tool

```bash
npm publish
# Publishes:
# - dist/ (compiled code)
# - package.json
# - README.md
# - LICENSE
```

### Publishing a Generated Package

```bash
cd my-package
npm run build
npm publish
# Publishes:
# - dist/ (for TypeScript)
# - src/ (for JavaScript)
# - package.json
# - README.md
```

## File Size Comparison

### CLI Tool (create-npm-package)

- Source: ~500 lines of TypeScript
- Built: ~300KB (including dependencies)
- Published: dist/ + package.json

### Generated Package (Minimal TypeScript)

- Source: ~50 lines
- Built: ~5KB
- Published: dist/ + package.json + README

### Generated Package (Full Featured)

- Source: ~100 lines
- Built: ~10KB
- Config files: 10+ files
- Published: dist/ + all configs
