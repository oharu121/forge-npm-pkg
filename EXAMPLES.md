# Usage Examples

This document shows real-world examples of packages created with `create-npm-package`.

## Example 1: Modern ESM Library (TypeScript)

```bash
npx create-npm-package my-utils
```

**Configuration:**
- Language: TypeScript
- Module format: ESM (Modern)
- Test runner: Vitest
- Linting: Yes
- Changesets: No
- Git: Yes

**Generated package.json:**

```json
{
  "name": "my-utils",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint . --ext .ts",
    "check:exports": "attw --pack"
  }
}
```

**Usage by consumers:**

```typescript
// Works in ESM environments
import { greet } from 'my-utils';
```

## Example 2: Dual Format Library (Maximum Compatibility)

```bash
npx create-npm-package universal-lib
```

**Configuration:**
- Language: TypeScript
- Module format: Dual (ESM + CJS)
- Test runner: Jest
- Linting: Yes
- Changesets: Yes
- Git: Yes

**Generated package.json:**

```json
{
  "name": "universal-lib",
  "version": "0.1.0",
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
  },
  "scripts": {
    "build": "tsup",
    "test": "jest",
    "lint": "eslint . --ext .ts",
    "check:exports": "attw --pack",
    "release": "changeset publish"
  }
}
```

**tsup.config.ts:**

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],  // Both formats!
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
});
```

**Usage by consumers:**

```typescript
// ESM (modern bundlers, Node.js with type: module)
import { greet } from 'universal-lib';

// CommonJS (older Node.js, require())
const { greet } = require('universal-lib');
```

## Example 3: JavaScript-Only Package (No Build Step)

```bash
npx create-npm-package simple-helpers
```

**Configuration:**
- Language: JavaScript
- Module format: ESM
- Test runner: Vitest
- Linting: Yes
- Changesets: No
- Git: Yes

**Generated package.json:**

```json
{
  "name": "simple-helpers",
  "version": "0.1.0",
  "type": "module",
  "main": "./src/index.js",
  "exports": {
    ".": "./src/index.js"
  },
  "files": ["src"],
  "scripts": {
    "test": "vitest run",
    "lint": "eslint . --ext .js"
  }
}
```

**No build step needed!** The source code is published directly.

## Example 4: CommonJS-Only Library (Legacy Support)

```bash
npx create-npm-package legacy-lib
```

**Configuration:**
- Language: TypeScript
- Module format: CommonJS (Legacy)
- Test runner: Jest
- Linting: No
- Changesets: No
- Git: Yes

**Generated package.json:**

```json
{
  "name": "legacy-lib",
  "version": "0.1.0",
  "type": "commonjs",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "require": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsup",
    "test": "jest",
    "check:exports": "attw --pack"
  }
}
```

## Example 5: Published Package with Changesets

Full workflow for a published package:

```bash
# Create package
npx create-npm-package awesome-lib
# Choose: TypeScript, Dual, Vitest, Linting: Yes, Changesets: Yes, Git: Yes

cd awesome-lib

# Make changes to src/index.ts
# Add new feature...

# Create a changeset
npx changeset
# Choose: minor
# Description: "Add new awesome feature"

# Commit everything
git add .
git commit -m "feat: add awesome feature"

# Push to GitHub
git push origin main

# GitHub Actions will:
# 1. Create a PR titled "Version Packages"
# 2. Update version in package.json
# 3. Update CHANGELOG.md

# Merge the PR -> package automatically published to npm!
```

## Testing Different Scenarios

### Scenario 1: Using Your Package in an ESM Project

Consumer's package.json:
```json
{
  "type": "module"
}
```

Consumer's code:
```typescript
import { greet } from 'your-package';
console.log(greet('World'));
```

### Scenario 2: Using Your Package in a CommonJS Project

Consumer's package.json:
```json
{
  "type": "commonjs"
}
```

Consumer's code:
```javascript
const { greet } = require('your-package');
console.log(greet('World'));
```

### Scenario 3: Using Your Package in a Bundler (Webpack, Vite, etc.)

Bundlers automatically use the optimal format:
```typescript
import { greet } from 'your-package';
// Bundler uses 'module' or 'exports.import' field
```

## Validation Commands

After generating your package, validate it:

```bash
# Build the package
npm run build

# Check exports are correct
npm run check:exports

# Test the package
npm test

# Lint the code
npm run lint

# Test publishing (dry run)
npm publish --dry-run

# Inspect what will be published
npm pack
tar -xzf *.tgz
cd package
ls -la
```

## Common Patterns

### Exporting Multiple Functions

```typescript
// src/index.ts
export function greet(name: string): string {
  return `Hello, ${name}!`;
}

export function farewell(name: string): string {
  return `Goodbye, ${name}!`;
}

export { default as utils } from './utils.js';
```

### Exporting Types

```typescript
// src/index.ts
export interface User {
  name: string;
  email: string;
}

export function createUser(name: string, email: string): User {
  return { name, email };
}
```

### Multiple Entry Points

Modify package.json exports:

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./utils": {
      "types": "./dist/utils.d.ts",
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.js"
    }
  }
}
```

Modify tsup.config.ts:

```typescript
export default defineConfig({
  entry: ['src/index.ts', 'src/utils.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  // ...
});
```

Usage:

```typescript
import { greet } from 'my-package';
import { helper } from 'my-package/utils';
```

## Troubleshooting

### Issue: "Cannot find module" error

**Solution:** Run `npm run check:exports` to validate your exports configuration.

### Issue: Types not resolving

**Solution:** Ensure `"types"` field is in your exports:

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  }
}
```

### Issue: Dual package hazard

**Solution:** Use different extensions for ESM (`.mjs`) and CJS (`.js`):

```typescript
// tsup.config.ts
export default defineConfig({
  format: ['cjs', 'esm'],
  // tsup automatically handles extensions
});
```

### Issue: Jest can't find modules

**Solution:** Ensure proper jest config for ESM:

```typescript
// jest.config.ts
export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  // ...
};
```
