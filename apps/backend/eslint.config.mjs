import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';
import boundaries from 'eslint-plugin-boundaries';
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
            "boundaries" : boundaries,
        },
        settings: {
            "boundaries/include": ["src/**/*"],
            "boundaries/elements": [
                {
                    mode: "full",
                    type: "shared",
                    pattern: [
                        "src/libs/*",
                        "src/types/*",
                        "src/database/**/**/*",
                        "src/utils/*",
                        "src/schema/*",
                        "src/public/**/*",
                    ]
                },
                {
                    mode: "full",
                    type: "feature",
                    capture: ["featureName"],
                    pattern: [
                        "src/features/**/**/**/*"
                    ]
                },
                {
                    mode: "full",
                    type: "src",
                    capture: ["_", "fileName"],
                    pattern: [
                        "src/controllers/*",
                        "src/routes/*",
                        "src/websocket/*",
                        "src/middlewares/*",
                    ]
                },
                {
                    mode: "full",
                    type: "neverImport",
                    pattern: [
                        "src/controllers/*",
                        "src/routes/*",
                        "src/websocket/*",
                        "src/middlewares/*",
                    ]
                }
            ]
        },

        rules: {
            // "boundaries/no-unknown": ["error"],
            // "boundaries/no-unknown-files": ["error"],
            "boundaries/element-types": [
                "error",
                {
                    default: "disallow",
                    rules: [
                        {
                            from: ["shared"],
                            allow: ["shared"]
                        },
                        {
                            from: ["feature"],
                            allow: [
                                "shared",
                                ["feature", { featureName: "${from.featureName}" }]
                            ]
                        },
                        {
                            from: ["src", "neverImport"],
                            allow: ["shared", "feature"]
                        },
                    ]
                }
            ],
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