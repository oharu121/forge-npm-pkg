# Plan: Fix validatePackageName type for clack.text compatibility

**Status:** Completed
**Date:** 2026-02-18

## Goal

Fix TypeScript DTS build error (TS2322) caused by `validatePackageName` parameter type being incompatible with `@clack/prompts` `text()` validate callback signature. Also modernize the TypeScript target to align with the project's Node.js 22+ requirement.

## Summary of Changes

- Widened `validatePackageName` parameter type from `string` to `string | undefined` to match the `clack.text` validate callback signature `(value: string | undefined) => string | Error | undefined`
- The existing `if (!name)` guard already handles the `undefined` case correctly, so no logic changes were needed
- Bumped tsconfig `target` and `lib` from ES2020 to ES2024 to match the project's `engines.node >= 22` requirement
- Added `{ cause: error }` to re-thrown errors in `userConfig.ts` for proper error chaining (now possible with ES2022+ target)

## Files Modified

- [src/index.ts](src/index.ts) - Changed `validatePackageName` parameter type from `string` to `string | undefined`
- [tsconfig.json](tsconfig.json) - Bumped `target` and `lib` from `ES2020` to `ES2024`
- [src/utils/userConfig.ts](src/utils/userConfig.ts) - Added `{ cause: error }` to re-thrown errors for proper error chaining

## Breaking Changes

None

## Deprecations

None
