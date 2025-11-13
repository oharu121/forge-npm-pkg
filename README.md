# create-npm-package

A powerful CLI tool to scaffold production-ready npm packages with modern best practices.

## Features

- Interactive CLI with beautiful prompts
- TypeScript or JavaScript support
- Multiple module formats: ESM, CommonJS, or Dual (both)
- Built-in testing with Vitest or Jest
- ESLint + Prettier for code quality
- Automated releases with Changesets
- GitHub Actions workflow included
- Package export validation with `@arethetypeswrong/cli`
- Proper `package.json` exports configuration
- Git repository initialization

## Usage

### Create a new package

```bash
npx create-npm-package my-awesome-package
```

Or without specifying a name (you'll be prompted):

```bash
npx create-npm-package
```

## What Gets Generated?

The CLI will ask you several questions and generate a complete project structure:

### Questions

1. **Language**: TypeScript or JavaScript
2. **Module Format**: ESM (Modern), CommonJS (Legacy), or Dual (ESM + CJS)
3. **Test Runner**: Vitest, Jest, or None
4. **Linting**: Initialize ESLint + Prettier?
5. **Automation**: Set up automated releases with Changesets?
6. **Git**: Initialize a new git repository?

### Generated Structure

```
my-awesome-package/
├── src/
│   ├── index.ts (or .js)
│   └── index.test.ts (if testing enabled)
├── .github/
│   └── workflows/
│       └── release.yml (if Changesets enabled)
├── package.json
├── tsconfig.json (if TypeScript)
├── tsup.config.ts (if TypeScript)
├── vitest.config.ts (if Vitest selected)
├── jest.config.ts (if Jest selected)
├── .eslintrc.json (if linting enabled)
├── .prettierrc (if linting enabled)
├── .gitignore
└── README.md
```

## The Generated Package

Your generated package will have:

### Scripts

- `npm run build` - Build the package with tsup
- `npm test` - Run tests
- `npm run lint` - Lint your code
- `npm run format` - Format code with Prettier
- `npm run check:exports` - Validate package exports
- `npm run typecheck` - Type-check TypeScript (if applicable)

### Best Practices

1. **Proper Package Exports**: The `package.json` includes correctly configured `exports` field for maximum compatibility
2. **Type Safety**: TypeScript with strict mode enabled
3. **Testing**: Pre-configured testing framework with example tests
4. **Code Quality**: ESLint and Prettier with sensible defaults
5. **CI/CD**: GitHub Actions workflow for automated releases
6. **Module Formats**: Support for ESM, CommonJS, or both (dual)

## Module Format Details

### ESM (Recommended)

Modern ECMAScript modules with `import`/`export` syntax.

```json
{
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  }
}
```

### CommonJS

Legacy Node.js module format with `require()`.

```json
{
  "type": "commonjs",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "require": "./dist/index.js"
    }
  }
}
```

### Dual (Maximum Compatibility)

Exports both ESM and CommonJS for maximum compatibility.

```json
{
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  }
}
```

## Publishing Your Package

### Manual Publishing

```bash
cd my-awesome-package
npm run build
npm publish
```

### Automated Publishing with Changesets

If you enabled Changesets, use this workflow:

1. Make your changes
2. Run `npx changeset` to create a changeset
3. Commit and push to GitHub
4. The CI will create a release PR
5. Merge the PR to publish automatically

## Requirements

- Node.js >= 18.0.0
- npm, pnpm, yarn, or bun

## Development

### Build this CLI tool

```bash
git clone https://github.com/yourusername/create-npm-package
cd create-npm-package
npm install
npm run build
```

### Test locally

```bash
npm link
create-npm-package test-package
```

## Why This Tool?

Creating a properly configured npm package is complex:

- Module format confusion (ESM vs CJS)
- Incorrect `package.json` exports
- TypeScript configuration
- Build tool setup
- Testing configuration
- CI/CD pipelines

This tool eliminates the guesswork and gives you a production-ready setup in seconds.

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or PR.
