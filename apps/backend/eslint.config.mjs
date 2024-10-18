import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                project: './tsconfig.json',
                tsconfigRootDir: __dirname,
            },
        },
        plugins: {
            '@typescript-eslint': tseslint.plugin,
            'unused-imports': unusedImports,
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "no-unused-expressions": "off",
            "@typescript-eslint/no-unused-expressions": "off",
            '@typescript-eslint/consistent-type-definitions': ['off'],
            'quotes': ['warn', 'single', { 'allowTemplateLiterals': true }],
            'space-infix-ops': 'warn',
            'no-multiple-empty-lines': ['warn', { 'max': 1 }],
            '@typescript-eslint/naming-convention': [
                'warn',
                {
                    'selector': 'typeLike',
                    'format': ['PascalCase']
                }
            ],
            'unused-imports/no-unused-imports': 'warn',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    'vars': 'all',
                    'args': 'after-used',
                    'ignoreRestSiblings': true,
                    'argsIgnorePattern': '^_',
                    'varsIgnorePattern': '^_',
                    'caughtErrorsIgnorePattern': '^_'
                }
            ]
        },
    },
    {
        ignores: ['.eslintrc.js'],
    },
);