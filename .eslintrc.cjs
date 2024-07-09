module.exports = {
    env: {
        node: true,
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
    parserOptions: { project: './tsconfig.json' },
    plugins: ['@typescript-eslint', 'import'],
    ignorePatterns: ['node_modules', 'dist', '.eslintrc.cjs'],
    rules: {
        quotes: ['warn', 'single'],
        eqeqeq: 'error',
        camelcase: 'warn',
        'spaced-comment': ['warn', 'always', { markers: ['/'] }],
        'require-jsdoc': 'off',
        'no-unused-vars': 'off', // Replaced by @typescript-eslint rule
        'no-constant-condition': ['error', { checkLoops: false }],
        'dot-notation': 'warn',

        '@typescript-eslint/switch-exhaustiveness-check': 'error',
        '@typescript-eslint/no-use-before-define': 'error',
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/no-unnecessary-template-expression': 'warn',
        '@typescript-eslint/no-unnecessary-condition': 'error',
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }],
        '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],

        'import/no-unresolved': 'error',
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
