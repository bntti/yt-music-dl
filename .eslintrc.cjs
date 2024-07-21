module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        'plugin:import/recommended',
        'plugin:import/typescript',
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended-type-checked',
        'google',
        'prettier',
        'plugin:prettier/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: { project: ['./tsconfig.json', './web/tsconfig.json'] },
    plugins: ['@typescript-eslint', 'import'],
    ignorePatterns: ['node_modules', 'dist', '.eslintrc.cjs', 'vite.config.ts', 'displayWorker.js'],
    rules: {
        'dot-notation': 'warn',
        'no-constant-condition': ['error', { checkLoops: false }],
        'no-unused-vars': 'off', // Replaced by @typescript-eslint rule
        'require-jsdoc': 'off',
        'spaced-comment': ['warn', 'always', { markers: ['/'] }],
        'valid-jsdoc': 'off',
        camelcase: 'warn',
        eqeqeq: 'error',

        '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
        '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }],
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/no-unnecessary-condition': 'error',
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/no-use-before-define': 'error',
        '@typescript-eslint/no-useless-template-literals': 'warn',
        '@typescript-eslint/switch-exhaustiveness-check': 'error',

        'import/extensions': ['error', 'ignorePackages', { ts: 'never', tsx: 'never' }],
        'import/no-unresolved': 'error',
        'import/prefer-default-export': 'off',
        'import/order': [
            'warn',
            {
                groups: [
                    ['builtin', 'external'],
                    ['internal', 'parent', 'sibling', 'index'],
                ],
                'newlines-between': 'always',
                alphabetize: { order: 'asc' },
            },
        ],
    },
};
