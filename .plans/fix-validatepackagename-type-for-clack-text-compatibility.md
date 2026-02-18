# Plan: Fix validatePackageName type for clack.text compatibility

**Status:** Completed
**Date:** 2026-02-18

## Goal

Fix TypeScript DTS build error (TS2322) caused by `validatePackageName` parameter type being incompatible with `@clack/prompts` `text()` validate callback signature.

## Summary of Changes

- Widened `validatePackageName` parameter type from `string` to `string | undefined` to match the `clack.text` validate callback signature `(value: string | undefined) => string | Error | undefined`
- The existing `if (!name)` guard already handles the `undefined` case correctly, so no logic changes were needed

## Files Modified

- [src/index.ts](src/index.ts) - Changed `validatePackageName` parameter type from `string` to `string | undefined`

## Breaking Changes

None

## Deprecations

None
