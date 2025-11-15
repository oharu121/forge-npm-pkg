---
"forge-npm-pkg": minor
---

Simplify CLI experience and add optional features

**Breaking Change:**
- Remove preset selection (Library/CLI/Legacy/Custom) for cleaner UX
- Interactive mode now directly asks all configuration questions
- `--yes` flag continues to work with sensible defaults

**New Features:**
- Add `useCodecov` option to make test coverage tracking opt-in (default: false)
- Add `useDependabot` option for automated dependency updates (default: false)
- Add educational notes before each prompt explaining benefits and requirements
- Make Codecov conditional in CI workflow to prevent failures when token is missing
- Generate `.github/dependabot.yml` when opted in
- Update README badges to conditionally show Codecov and CI status

**Improvements:**
- Display logo banner and version number at startup for better branding
- Educational notes now appear BEFORE all prompts (not after user selects)
- TypeScript is now the default language (first option, just press Enter)
- Added warning when JavaScript is selected to guide users toward TypeScript
- Updated language hints: "Recommended - Modern standard" vs "Simple projects only"
- Improved CD prompt with detailed benefits and workflow explanation
- Simpler mental model: either use defaults (--yes) or answer questions
- Less code to maintain, fewer potential bugs
- More consistent experience across all usage modes

**Project Setup:**
- Add Changesets support to forge-npm-pkg itself for automated releases
- Replace old publish.yml with proper Changesets release workflow
- Add Dependabot configuration to forge-npm-pkg repository
