import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';

export default [
  eslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tseslint,
    },
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'quotes': ['warn', 'single'],
      '@typescript-eslint/no-unused-vars': ['error', { 'ignoreRestSiblings': true }],
      'space-infix-ops': 'error',
      'comma-spacing': ['error', { 'before': false, 'after': true }],
      'arrow-spacing': ['error', { 'before': true, 'after': true }],
      'object-curly-spacing': ['error', 'always'],
      'no-multi-spaces': 'error',
    },
    env: {
      browser: true,
      node: true,
      es6: true,
    },
  },
];