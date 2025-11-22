/**
 * Linting and formatting configuration generators
 * Handles ESLint, Prettier, and EditorConfig
 */

import type { ProjectConfig } from './types.js';

interface PrettierConfig {
  semi: boolean;
  trailingComma: string;
  singleQuote: boolean;
  printWidth: number;
  tabWidth: number;
  useTabs: boolean;
}

/**
 * Generates ESLint flat config (eslint.config.js)
 * Uses the modern flat config format introduced in ESLint v9
 */
export function generateEslintConfig(config: ProjectConfig): string {
  if (config.language === 'typescript') {
    // TypeScript flat config
    return `import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...prettierConfig.rules,
    },
  },
];
`;
  } else {
    // JavaScript flat config
    return `import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      ...prettierConfig.rules,
    },
  },
];
`;
  }
}

/**
 * Generates Prettier configuration
 */
export function generatePrettierConfig(): PrettierConfig {
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
 * Generates .editorconfig for consistent editor settings
 */
export function generateEditorConfig(): string {
  return `# EditorConfig is awesome: https://EditorConfig.org

# top-most EditorConfig file
root = true

# Unix-style newlines with a newline ending every file
[*]
end_of_line = lf
insert_final_newline = true
charset = utf-8
trim_trailing_whitespace = true

# TypeScript/JavaScript
[*.{ts,tsx,js,jsx,mjs,cjs}]
indent_style = space
indent_size = 2

# JSON
[*.json]
indent_style = space
indent_size = 2

# YAML
[*.{yml,yaml}]
indent_style = space
indent_size = 2

# Markdown
[*.md]
trim_trailing_whitespace = false
`;
}
