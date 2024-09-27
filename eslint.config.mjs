import { fixupPluginRules } from '@eslint/compat';
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import unicornPlugin from 'eslint-plugin-unicorn';
import globals from 'globals';
import url from 'node:url';
import tseslint from 'typescript-eslint';

// Inspiration taken from https://github.com/typescript-eslint/typescript-eslint/blob/main/eslint.config.mjs

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export default tseslint.config(
    // Register all of the plugins up-front
    {
        plugins: {
            '@typescript-eslint': tseslint.plugin,
            // https://github.com/import-js/eslint-plugin-import/issues/2948
            import: fixupPluginRules(importPlugin),
            // https://github.com/facebook/react/issues/28313
            unicorn: unicornPlugin,
        },
    },

    // Ignores
    {
        ignores: ['**/node_modules/**', '**/dist/**'],
    },

    // Extends ...
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    eslintConfigPrettier,

    // Base config
    {
        languageOptions: {
            globals: { ...globals.es2022 },
            parserOptions: {
                projectService: {
                    allowDefaultProject: ['*.mjs'],
                    defaultProject: 'tsconfig.json',
                },
                tsconfigRootDir: __dirname,
                warnOnUnsupportedTypeScriptVersion: false,
            },
        },
        linterOptions: { reportUnusedDisableDirectives: 'error' },
        rules: {
            ...importPlugin.configs.recommended.rules,
            ...importPlugin.configs.typescript.rules,
            ...unicornPlugin.configs.recommended.rules,

            camelcase: ['warn', { allow: ['kana_vocabulary'] }],
            eqeqeq: 'error',
            'no-constant-condition': ['error', { checkLoops: false }],
            'no-unused-vars': 'off', // Replaced by @typescript-eslint rule
            'require-unicode-regexp': 'error',
            'sort-imports': ['warn', { ignoreDeclarationSort: true }],
            'spaced-comment': ['warn', 'always', { markers: ['/'] }],

            '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
            '@typescript-eslint/dot-notation': 'warn',
            '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
            '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }],
            '@typescript-eslint/no-import-type-side-effects': 'error',
            '@typescript-eslint/no-shadow': 'error',
            '@typescript-eslint/no-unnecessary-condition': 'error',
            '@typescript-eslint/no-unnecessary-template-expression': 'warn',
            '@typescript-eslint/no-unnecessary-type-arguments': 'error',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-use-before-define': 'error',
            '@typescript-eslint/prefer-find': 'error',
            '@typescript-eslint/prefer-optional-chain': 'warn',
            '@typescript-eslint/promise-function-async': 'error',
            '@typescript-eslint/return-await': 'error',
            '@typescript-eslint/switch-exhaustiveness-check': 'error',

            'unicorn/filename-case': 'off',
            'unicorn/no-array-reduce': 'off',
            'unicorn/no-await-expression-member': 'off',
            'unicorn/no-negated-condition': 'off',
            'unicorn/no-nested-ternary': 'off',
            'unicorn/no-null': 'off',
            'unicorn/no-process-exit': 'off', // Turn off if CLI app
            'unicorn/prefer-module': 'off',
            'unicorn/prefer-number-properties': 'off',
            'unicorn/prefer-top-level-await': 'off', // Not supported by cjs :(
            'unicorn/prevent-abbreviations': 'off',
            'unicorn/switch-case-braces': 'off',

            'import/default': 'off', // Broken by new eslint
            'import/extensions': 'off', // Broken by new eslint
            'import/namespace': 'off',
            'import/newline-after-import': 'warn',
            'import/no-named-as-default': 'off', // Broken by new eslint
            'import/no-named-as-default-member': 'off',
            'import/no-unresolved': 'off', // Broken by new eslint
            'import/order': [
                'warn',
                {
                    // ignoreDeclarationSort: true,
                    alphabetize: { order: 'asc' },
                    distinctGroup: false,
                    groups: [
                        ['builtin', 'external'],
                        ['internal', 'parent', 'sibling', 'index'],
                    ],
                    'newlines-between': 'always',
                    // https://github.com/import-js/eslint-plugin-import/issues/2008#issuecomment-801263294
                    pathGroups: [
                        {
                            group: 'internal',
                            pattern: '@/**',
                            position: 'before',
                        },
                    ],
                    pathGroupsExcludedImportTypes: ['builtin', 'object'],
                },
            ],
            'import/prefer-default-export': 'off',
        },
    },

    // Config files
    {
        files: ['**/*.mjs'],
        languageOptions: { globals: { ...globals.node } },
        rules: {
            'sort-keys': ['warn', 'asc', { allowLineSeparatedGroups: true }],
            'unicorn/no-process-exit': 'off',

            // Turn off type checks
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
        },
    },

    // Src
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            globals: { ...globals.node },
        },
        rules: {
            '@typescript-eslint/no-non-null-assertion': 'error',
            'unicorn/filename-case': ['warn', { case: 'kebabCase' }],
        },
    },
);
