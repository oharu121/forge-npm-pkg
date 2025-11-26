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
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';

export default [
  // Ignore patterns (replaces .eslintignore)
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '**/*.d.ts',
    ],
  },

  // Base config for all files
  js.configs.recommended,

  // TypeScript files
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        NodeJS: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        fetch: 'readonly',
        AbortSignal: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
    },
  },

  // Test files - allow any type for mocking
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // JavaScript/MJS files - scripts
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
    },
  },

  // Prettier config (must be last to override other configs)
  prettierConfig,
];
`;
  } else {
    // JavaScript flat config
    return `import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';

export default [
  // Ignore patterns (replaces .eslintignore)
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
    ],
  },

  // Base config for all files
  js.configs.recommended,

  // JavaScript files
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        fetch: 'readonly',
        AbortSignal: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
    },
  },

  // Test files
  {
    files: ['**/*.test.js', '**/*.spec.js'],
    rules: {
      'no-unused-vars': 'off',
    },
  },

  // Prettier config (must be last to override other configs)
  prettierConfig,
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
