# Quick Start Guide

Get your npm package up and running in 2 minutes.

## Installation & Usage

### Option 1: Using npx (Recommended)

```bash
npx create-npm-package my-package
```

### Option 2: Global Installation

```bash
npm install -g create-npm-package
create-npm-package my-package
```

## Interactive Setup

The CLI will ask you 6 questions:

```
🚀 Create NPM Package

? Which language?
  ❯ TypeScript
    JavaScript

? Which module format?
  ❯ ESM (Modern) [Recommended]
    CommonJS (Legacy)
    Dual (ESM + CJS) [Maximum compatibility]

? Which test runner?
  ❯ Vitest [Fast & modern]
    Jest [Battle-tested]
    None

? Initialize ESLint + Prettier?
  ❯ Yes
    No

? Set up automated releases with Changesets?
  ❯ No
    Yes

? Initialize a new git repository?
  ❯ Yes
    No

✨ All done! Your package is ready.
```

## What You Get

After answering the questions, you'll have a complete project:

```
my-package/
├── src/
│   ├── index.ts           # Example code
│   └── index.test.ts      # Example tests
├── package.json           # Configured with proper exports
├── tsconfig.json          # TypeScript config
├── tsup.config.ts         # Build config
├── vitest.config.ts       # Test config
├── .eslintrc.json         # Linting rules
├── .prettierrc            # Code formatting
├── .gitignore             # Git ignore rules
└── README.md              # Documentation
```

## Next Steps

```bash
cd my-package

# Build your package
npm run build

# Run tests
npm test

# Lint your code
npm run lint

# Validate exports
npm run check:exports
```

## Start Coding

Edit `src/index.ts`:

```typescript
export function myFunction(input: string): string {
  return `Processed: ${input}`;
}
```

Add tests in `src/index.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './index.js';

describe('myFunction', () => {
  it('should process input', () => {
    expect(myFunction('test')).toBe('Processed: test');
  });
});
```

## Build and Test

```bash
npm run build    # Compiles TypeScript to dist/
npm test         # Runs tests
```

## Publishing to npm

### First Time Setup

1. Create an npm account at [npmjs.com](https://www.npmjs.com)
2. Login in your terminal:

```bash
npm login
```

### Publish

```bash
# Make sure everything is built and tested
npm run build
npm test
npm run check:exports

# Publish to npm
npm publish
```

### Update Version

```bash
# Bump version
npm version patch  # 0.1.0 -> 0.1.1
npm version minor  # 0.1.1 -> 0.2.0
npm version major  # 0.2.0 -> 1.0.0

# Publish new version
npm publish
```

## Using Your Published Package

After publishing, anyone can install and use your package:

```bash
npm install my-package
```

```typescript
import { myFunction } from 'my-package';

console.log(myFunction('Hello'));
```

## Automated Releases (Optional)

If you enabled Changesets:

### 1. Make Changes

```bash
# Edit your code
# Add new features, fix bugs, etc.
```

### 2. Create Changeset

```bash
npx changeset
```

You'll be prompted:

```
? What kind of change is this?
  ❯ patch (bug fixes)
    minor (new features)
    major (breaking changes)

? Please enter a summary for this change
  Added new myFunction feature
```

### 3. Commit and Push

```bash
git add .
git commit -m "feat: add myFunction"
git push
```

### 4. Merge Release PR

GitHub Actions will create a "Version Packages" PR that:
- Updates version in package.json
- Updates CHANGELOG.md
- Merges and publishes automatically

## Common Commands Cheat Sheet

```bash
# Development
npm run build          # Build the package
npm run typecheck      # Check TypeScript types
npm test               # Run tests once
npm run test:watch     # Run tests in watch mode

# Code Quality
npm run lint           # Check for linting errors
npm run lint:fix       # Fix linting errors
npm run format         # Format code with Prettier
npm run format:check   # Check formatting

# Publishing
npm run check:exports  # Validate package exports
npm publish --dry-run  # Preview what will be published
npm publish            # Publish to npm

# Versioning
npm version patch      # 0.1.0 -> 0.1.1
npm version minor      # 0.1.1 -> 0.2.0
npm version major      # 0.2.0 -> 1.0.0
```

## Troubleshooting

### "Cannot find module" error

Run the validation script:

```bash
npm run check:exports
```

This will show any issues with your package configuration.

### Tests not running

Make sure you installed dependencies:

```bash
npm install
```

### Build fails

Check TypeScript errors:

```bash
npm run typecheck
```

### Publishing fails

Make sure you're logged in:

```bash
npm whoami
npm login
```

Check package name availability:

```bash
npm view my-package
# If it shows "404", the name is available
```

## Best Practices

### 1. Write Tests

Always write tests for your functions:

```typescript
describe('myFunction', () => {
  it('should handle edge cases', () => {
    expect(myFunction('')).toBe('Processed: ');
  });
});
```

### 2. Document Your Code

Add JSDoc comments:

```typescript
/**
 * Processes the input string
 * @param input - The input to process
 * @returns The processed string
 */
export function myFunction(input: string): string {
  return `Processed: ${input}`;
}
```

### 3. Validate Before Publishing

```bash
npm run build
npm test
npm run lint
npm run check:exports
```

### 4. Use Semantic Versioning

- `patch`: Bug fixes (0.1.0 -> 0.1.1)
- `minor`: New features (0.1.0 -> 0.2.0)
- `major`: Breaking changes (0.1.0 -> 1.0.0)

## Getting Help

- Check the [README.md](README.md) for detailed documentation
- See [EXAMPLES.md](EXAMPLES.md) for more usage examples
- Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand how it works
- Open an issue on GitHub if you find bugs

## What's Next?

1. Add more functions to `src/index.ts`
2. Write comprehensive tests
3. Add documentation to your README
4. Publish to npm
5. Share with the community!

Happy coding! 🚀
