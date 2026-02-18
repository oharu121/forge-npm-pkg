# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.4.4] - 2026-02-18

### Fixed

- Fixed TypeScript DTS build error (TS2322) where `validatePackageName` parameter type `string` was incompatible with `@clack/prompts` `text()` validate callback signature expecting `string | undefined`
- Added `{ cause: error }` to re-thrown errors in `userConfig.ts` for proper error chaining

### Changed

- Bumped tsconfig `target` and `lib` from ES2020 to ES2024 to align with `engines.node >= 22` requirement

## [2.4.1]

### Changed

- **Dependabot auto-merge now includes major updates** - All Dependabot PRs are auto-approved and auto-merged
  - Previously only patch and minor updates were auto-merged
  - Major updates no longer require manual review

- **updated eslint.config**

## [2.4.0]

### Added

- **Dependabot auto-merge workflow** - Automatically generates `.github/workflows/dependabot-auto-merge.yml` when Dependabot is enabled
  - Auto-approves and auto-merges patch and minor dependency updates
  - Major updates still require manual review (breaking changes need attention)
  - Uses squash merge for clean git history
  - Uses GitHub's native auto-merge feature (no third-party services needed)
- **Clear setup instructions** - After project creation, displays required GitHub settings:
  - Enable "Allow auto-merge" in repository settings
  - Enable "Allow GitHub Actions to create and approve pull requests"
- **Dynamic `dependabot/fetch-metadata` versioning** - Action version fetched dynamically like other GitHub Actions
- **GitHub repository creation** - Optional prompt to create GitHub repository using `gh` CLI
  - Only shown when git is initialized AND `gh` CLI is available and authenticated
  - Supports public or private repositories
  - Automatically uses package description
  - Detects existing repos to prevent conflicts
  - Graceful fallback with manual command on failure

### Technical

- Added `generateDependabotAutoMergeWorkflow()` function in `src/utils/generators/workflows.ts`
- Added `dependabot/fetch-metadata` to supported actions in `src/utils/actionsFetcher.ts`
- Updated dry run output to show new workflow file
- Added comprehensive test suite for new workflow generator
- Added `src/utils/ghCli.ts` with GitHub CLI helper functions
- Added `src/utils/ghCli.test.ts` with mocked test suite

## [2.3.1]

### Added

- **ESLint flat config support** - Generates modern `eslint.config.js` instead of deprecated `.eslintrc.json`
  - Uses ESLint v9 flat config format (array-based configuration)
  - Future-proof for ESLint v10+ which will remove old config support
  - Includes `@eslint/js` for official recommended configs
  - Separate implementations for TypeScript and JavaScript projects
- **Release script UX improvements**:
  - Added "Press ESC at any time to cancel" hint at the start
  - Better user guidance throughout the interactive workflow

### Changed

- **BREAKING**: Generated projects now use `eslint.config.js` (flat config) instead of `.eslintrc.json`
  - Existing projects are unaffected (this only applies to newly generated projects)
  - Lint scripts simplified: `eslint .` (no more `--ext` flag needed)
  - File patterns defined in config instead of command-line flags

- **Workflow generation refactored** - Extracted CD workflow to dedicated generator function
  - `generateCDWorkflow()` now matches pattern of `generateCIWorkflow()`
  - Better code organization and maintainability

### Technical

- Added `generateCDWorkflow()` function in `src/utils/generators/workflows.ts`
- Updated `generateEslintConfig()` in `src/utils/generators/linting.ts`:
  - Changed return type from object to string (generates JavaScript code)
  - Outputs modern flat config format
  - Separate implementations for TypeScript and JavaScript
- Generated packages now include:
  - `token` script when CD is enabled
  - `eslint.config.js` with flat config format
  - Simplified lint scripts without `--ext` flag
  - `@eslint/js` in devDependencies
- Generated packages no longer include:
  - Redundant `preversion` hook
  - Deprecated `.eslintrc.json` file
- Updated tests to validate new flat config format

## [2.3.0]

### Added

- **npm token helper script** (`scripts/get-token.mjs`) - Cross-platform utility to display npm authentication token from `.npmrc`
  - Useful for debugging and setting up CI/CD secrets
  - Works consistently on Windows, macOS, and Linux
  - Accessible via `npm run token` script

### Changed

- **Improved release workflow UX** - Removed redundant test execution during version bump
  - Removed `preversion` script that caused duplicate test runs
  - Tests now run once with clear spinner feedback instead of twice (once explicit, once during `npm version`)
  - Eliminates confusing pause during version selection in release workflow

### Technical

- Added `scripts/get-token.mjs` - Cross-platform npm token reader
- Added `generateGetTokenScript()` function in `src/utils/generators/files.ts`
- Updated `package.json` scripts:
  - Added `token` script: `node scripts/get-token.mjs`
  - Removed `preversion` script (redundant with release script's explicit test run)

## [2.2.0]

### Added

- **Interactive release automation script** (`scripts/release.mjs`) - Beautiful UX for the complete release workflow:
  - Branch validation check (warns if not on main/master)
  - Smart remote detection (catches Dependabot commits before release)
  - Automated pull with conflict detection
  - Full test suite execution
  - Interactive commit message prompt
  - Version bump selection (patch/minor/major)
  - Automated push to remote with CD trigger
  - Comprehensive error handling with recovery steps
  - Abort support at any step (ESC key)

### Technical

- Added `scripts/release.mjs` - Interactive release automation tool with comprehensive error handling
- Added `scripts/README.md` - Complete documentation for the release script including example scenarios
- Updated `package.json` scripts:
  - Changed `prerelease` → `preversion` (npm hook that runs before version bump)
  - Changed `release` → `node scripts/release.mjs` (interactive release tool)

## [2.0.0]

### Added

- **Dynamic npm package version fetching** - Tool now fetches the latest versions of all packages from npm registry at scaffold time
- **Dynamic Node.js LTS version fetching** - Automatically detects and uses current LTS Node.js versions
- **Dynamic GitHub Actions version fetching** - Automatically fetches latest major version tags for GitHub Actions:
  - `actions/checkout` - Uses latest major version (currently v5)
  - `actions/setup-node` - Uses latest major version (currently v6)
  - `codecov/codecov-action` - Uses latest major version (currently v5)
  - Fetched in parallel with npm packages for performance
  - Conservative fallbacks if GitHub API is unavailable
- **`engines` field in generated package.json** - Specifies minimum Node.js version requirement based on current LTS
- **Smart version warnings** - Warns users when fetched packages are brand new and potentially unstable:
  - New major versions (x.0.x) released within 30 days
  - Early minor versions (x.1.x) released within 14 days
- **Automatic fallback system** for version fetching:
  - Primary: Fetch latest from npm registry
  - Fallback 1: Find stable version (30+ days old)
  - Fallback 2: Use "latest" string (resolved by npm during install)

### Changed

- **BREAKING**: Removed hardcoded package versions - all versions now fetched dynamically
- **BREAKING**: Removed hardcoded GitHub Actions versions - all action versions now fetched dynamically
- CI workflow matrix now uses dynamic Node.js LTS versions (currently [20, 22])
- CI workflow now uses dynamically fetched GitHub Actions versions
- Publish workflow now uses latest Node.js LTS version (currently 22.x) and dynamic action versions
- Codecov upload in CI now targets latest LTS instead of hardcoded Node 20
- Generated projects now include `engines` field requiring current LTS Node version
- Spinner message during project creation now indicates "Fetching latest package versions from npm..."

### Improved

- **Zero-maintenance version management** - No more manual updates needed when new package or action versions release
- **Future-proof Node.js versioning** - Automatically adopts new LTS versions (Node 24 in October 2025, etc.)
- **Future-proof GitHub Actions** - New projects automatically use latest action versions without tool updates
- **Better user education** - Clear warnings about potentially risky new versions
- **Graceful degradation** - Multiple fallback levels ensure tool never completely fails
- **Security best practices** - Generated workflows automatically benefit from latest action security patches

### Technical

- Added `src/utils/versionFetcher.ts` - npm package version fetcher with smart fallbacks
- Added `src/utils/nodeFetcher.ts` - Node.js LTS version fetcher with EOL checking
- Added `src/utils/actionsFetcher.ts` - GitHub Actions version fetcher with fallback support
- Added `tests/actionsFetcher.test.ts` - Comprehensive test suite for actions version fetching
- Made `generatePackageJson()` async to support dynamic fetching
- Made `generateDevDependencies()` async to fetch package versions in parallel
- Updated `generateCIWorkflow()` to accept Node version configuration and GitHub Actions versions
- Updated `src/index.ts` to fetch and apply dynamic action versions to both CI and publish workflows
- Updated `src/utils/generators/workflows.test.ts` to test dynamic action version usage
- All version fetching operations (npm, Node.js, GitHub Actions) execute in parallel for performance

## [1.6.0]

### Changed

- **BREAKING**: Module format is now always dual (ESM + CommonJS) for maximum compatibility
- Removed module format selection prompt - all packages now support both ESM and CommonJS by default
- Removed `--esm`, `--cjs`, and `--dual` CLI flags (no longer needed)
- Updated `--yes` flag description to reflect dual format default

### Rationale

The dual format provides maximum compatibility with minimal overhead. Modern bundlers and Node.js handle both formats seamlessly, and the build complexity is negligible with modern tools like tsup. This change:
- Eliminates decision fatigue for users
- Ensures packages work everywhere (old and new Node.js versions, all bundlers)
- Simplifies the CLI interface
- Follows the principle that good defaults are better than choices

## [1.5.0]

### Added

- Automatic update notifications when a newer version is available (checked once per day, non-blocking)
- `.npmignore` generation for TypeScript projects to exclude source files from published npm packages
- `sync` and `sync:quick` npm scripts for streamlined Dependabot workflow (pull + install + test)
- Dependabot grouping configuration: dev dependencies and GitHub Actions grouped into single weekly PRs
- Dependency management workflow documentation in README

### Changed

- Dependabot config now groups development dependencies to reduce PR noise (production deps remain separate)
- Dependabot now monitors GitHub Actions updates in addition to npm dependencies
- Updated README with simple npm script-based workflow for handling Dependabot updates (solo developer)

### Fixed

- TypeScript projects now properly exclude source files (`src/`, `*.ts`) from npm packages via `.npmignore`

## [1.4.1]

### Added

- `test:coverage` script automatically added to generated projects when CI is enabled
- `@vitest/coverage-v8` package automatically installed when using Vitest with CI enabled
- Test coverage collection in CI workflows - runs `npm run test:coverage` instead of `npm test`

### Changed

- CI workflows now collect test coverage by default when tests are configured
- Coverage reports are generated on every CI run for better visibility into test quality

## [1.2.0] - 2025-11-16

### Added

- Logo banner and version number display at startup for better branding and visual identity
- `useCodecov` option to make test coverage tracking opt-in (default: false)
- `useDependabot` option for automated dependency updates (default: false)
- Educational notes before each prompt explaining benefits and requirements
- Conditional Codecov integration in CI workflow (only when opted-in, prevents failures when token is missing)
- `.github/dependabot.yml` generation when Dependabot is opted-in
- Conditional README badges (Codecov and CI status only shown when relevant)
- Simple tag-based CD workflow (`publish.yml`) that triggers on git tags
- Dependabot configuration for forge-npm-pkg repository maintenance

### Changed

- **BREAKING**: Removed preset selection (Library/CLI/Legacy/Custom) for cleaner, more intuitive UX
- **BREAKING**: Removed Changesets from both forge-npm-pkg and generated projects - now uses simple tag-based workflow
- Interactive mode now directly asks all configuration questions instead of choosing presets
- TypeScript is now the default language (first option, just press Enter)
- Educational notes now appear BEFORE all prompts (not after user makes selection)
- Updated language hints: "Recommended - Modern standard" for TypeScript vs "Simple projects only" for JavaScript
- CD workflow now uses git tags (`v*`) instead of Changesets for automated publishing
- Simplified CD setup: `npm version` + `git push --tags` instead of Changesets workflow
- `--yes` flag continues to work with sensible defaults (no breaking change for this usage)

### Improved

- Added warning when JavaScript is selected to guide users toward TypeScript best practices
- More consistent experience across all usage modes
- Less code to maintain, fewer potential bugs
- Better user education through contextual prompts
- Simpler release workflow without Changesets complexity
- CD prompt now explains tag-based workflow with clear step-by-step instructions

### Fixed

- CD (Automated Publishing) benefits note now appears BEFORE the prompt, not after selection
- All optional features (Codecov, Dependabot, CD) now follow consistent "inform then ask" pattern

### Removed

- Changesets dependency and all related scripts
- Changesets configuration files (`.changeset/`)
- `release.yml` workflow (replaced with simpler `publish.yml`)

## [1.1.0] - 2025-11-14

### Added

- Explicit user confirmation prompt before installing npm packages - asks "Install dependencies now?" instead of installing automatically
- Live npm progress output during dependency installation - users can now see real-time installation progress instead of a frozen screen
- Clear messaging before and after installation with timing expectations ("This may take a minute. Please wait...")

### Changed

- Installation process now requires explicit user consent in interactive mode (still auto-installs with `--yes` flag)
- Changed from hidden installation output (`stdio: "pipe"`) to visible output (`stdio: "inherit"`) for transparency
- Improved "Next steps" instructions to accurately show install command only when dependencies weren't installed

### Fixed

- Fixed misleading UX where screen appeared frozen during npm install with no feedback
- Fixed post-install tasks (git init, build verification) to check actual installation status instead of just the `--skip-install` flag
- Fixed logic to properly track whether installation actually happened vs just checking the CLI flag

### Security

- Follows npm/npx security best practice of prompting before installing packages (prevents unexpected network operations)

## [1.0.1] - 2025-11-13

### Added

- Initial release with comprehensive npm package scaffolding
- Interactive CLI with beautiful prompts using @clack/prompts
- Support for TypeScript and JavaScript
- Support for ESM, CommonJS, and Dual module formats
- Testing framework integration (Vitest, Jest)
- Linting and formatting setup (ESLint, Prettier, EditorConfig)
- CI/CD workflow generation (GitHub Actions)
- User configuration storage with git integration
- Package name availability check
- Preset modes (Library, CLI Tool, Legacy)
- Comprehensive documentation and examples

### Features

- `-y, --yes` flag for quick setup with defaults
- `--skip-install` flag to skip dependency installation
- `--dry-run` flag to preview generated files
- `--config` flag to show stored user configuration
- `--reset-config` flag to clear stored configuration
- `--no-save` flag to prevent saving user info
- Custom configuration mode with full control
- Automatic package manager detection (npm, pnpm, yarn, bun)
- Post-install verification (runs build to ensure setup works)
- Parallel post-install tasks (git init, changesets setup)

[Unreleased]: https://github.com/oharu121/forge-npm-pkg/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/oharu121/forge-npm-pkg/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/oharu121/forge-npm-pkg/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/oharu121/forge-npm-pkg/releases/tag/v1.0.1
