# Architecture Documentation

This document explains how `create-npm-package` works internally.

## Project Structure

```
create-npm-package/
├── src/
│   ├── index.ts              # Main CLI entry point
│   └── utils/
│       └── generators.ts      # Configuration file generators
├── dist/                      # Built output (generated)
├── package.json               # CLI tool's package.json
├── tsconfig.json              # TypeScript configuration
├── tsup.config.ts             # Build configuration
└── README.md
```

## How It Works

### 1. CLI Entry Point (src/index.ts)

The main file handles:
- Argument parsing with `commander`
- Interactive prompts with `@clack/prompts`
- Project scaffolding logic
- Dependency installation
- Git initialization
- Changesets setup

#### Flow:

1. Parse command line arguments
2. Ask user configuration questions
3. Create project directory
4. Generate all configuration files
5. Install dependencies
6. Initialize git (if requested)
7. Run changeset init (if requested)
8. Display success message

### 2. Generator Functions (src/utils/generators.ts)

This module contains pure functions that generate configuration files based on user choices.

#### Key Functions:

**`generatePackageJson(config)`**
- Most complex function
- Dynamically generates `package.json` with proper `exports` mapping
- Handles three module types: ESM, CommonJS, Dual
- Sets up all scripts and dependencies

**`generateEntryPoints(config)`**
- Critical for proper package resolution
- Configures `main`, `module`, `types`, and `exports` fields
- ESM: Uses `.js` with `"type": "module"`
- CJS: Uses `.js` with `"type": "commonjs"`
- Dual: Uses `.js` for CJS, `.mjs` for ESM

**Other generators:**
- `generateTsConfig()` - TypeScript compiler options
- `generateTsupConfig()` - Build tool configuration
- `generateEslintConfig()` - Linting rules
- `generateVitestConfig()` - Test configuration
- `generateReadme()` - Documentation template
- `generateGitignore()` - Ignore patterns

## Module Format Logic

This is the most critical part of the tool.

### ESM (Modern)

```json
{
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  }
}
```

**Why this works:**
- `"type": "module"` tells Node.js to treat `.js` as ESM
- `exports.import` points to the ESM build
- TypeScript can resolve types correctly

### CommonJS (Legacy)

```json
{
  "type": "commonjs",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "require": "./dist/index.js"
    }
  }
}
```

**Why this works:**
- `"type": "commonjs"` tells Node.js to treat `.js` as CJS
- `exports.require` points to the CommonJS build
- Older Node.js versions are supported

### Dual (Maximum Compatibility)

```json
{
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  }
}
```

**Why this works:**
- `.mjs` extension explicitly marks ESM code
- `.js` extension contains CommonJS code
- Bundlers use `module` field to get ESM version
- Node.js uses `exports` to resolve correctly
- Both `import` and `require()` work

**tsup configuration for dual:**

```typescript
{
  format: ['cjs', 'esm'],
  dts: true
}
```

This outputs:
- `dist/index.js` - CommonJS
- `dist/index.mjs` - ESM
- `dist/index.d.ts` - TypeScript declarations

## Build Process

The CLI tool itself:
1. Written in TypeScript
2. Built with tsup to ESM format
3. Includes shebang for CLI execution
4. Distributed with `bin` field in package.json

## Validation

The generated packages include `@arethetypeswrong/cli` which validates:
- Package exports are correct
- Types resolve properly
- No "dual package hazard"
- ESM/CJS compatibility issues

Run with: `npm run check:exports`

## Changesets Workflow

When enabled, generates `.github/workflows/release.yml`:

1. Developer creates changeset: `npx changeset`
2. Commits and pushes changes
3. GitHub Action runs on push to main
4. Creates/updates "Version Packages" PR
5. Merging PR triggers `changeset publish`
6. Package published to npm automatically

## Design Decisions

### Why tsup?

- Fast (built on esbuild)
- Simple configuration
- Handles dual format easily
- Built-in TypeScript support
- Generates declaration files

### Why @clack/prompts?

- Beautiful, modern UI
- Better UX than inquirer
- Type-safe
- Easy cancellation handling

### Why commander?

- Industry standard for CLI tools
- Simple argument parsing
- Good TypeScript support

### Why fs-extra?

- Promise-based API
- Additional utilities (copy, ensureDir, etc.)
- Drop-in replacement for fs

## Testing the Generated Packages

All generated packages include example code:

**src/index.ts:**
```typescript
export function greet(name: string): string {
  return `Hello, ${name}!`;
}
```

**src/index.test.ts:**
```typescript
import { greet } from './index.js';

describe('greet', () => {
  it('should return a greeting', () => {
    expect(greet('World')).toBe('Hello, World!');
  });
});
```

This allows immediate testing:
```bash
npm run build
npm test
```

## Future Enhancements

Potential additions:
- More test frameworks (e.g., uvu, ava)
- Bundler options (rollup, esbuild)
- Documentation generators (typedoc)
- More CI providers (GitLab, CircleCI)
- Monorepo support
- React/Vue component library mode
- CLI tool scaffolding mode
