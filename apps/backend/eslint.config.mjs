export const config = {
    env: {
        browser: true,
        es2021: true,
        node: true,
        bun: true
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2021, // به‌روزرسانی ورژن به es2021
        sourceType: "module"
    },
    plugins: [
        "@typescript-eslint",
        "unused-imports",
        "bun" // اضافه کردن bun به پلاگین‌ها
    ],
    rules: {
        "@typescript-eslint/consistent-type-definitions": ["error", "type"],
        quotes: ["error", "single", { allowTemplateLiterals: true }],
        semi: ["error", "always"],
        "space-infix-ops": "error",
        "object-curly-spacing": ["error", "always"],
        "no-multiple-empty-lines": ["error", { max: 1 }],
        indent: ["error", 4],
        "@typescript-eslint/naming-convention": [
            "error",
            {
                selector: "typeLike",
                format: ["PascalCase"]
            }
        ],
        "unused-imports/no-unused-imports": "error",
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": [
            "error",
            {
                varsIgnorePattern: "^_",
                argsIgnorePattern: "^_",
                destructuredArrayIgnorePattern: "^_"
            }
        ],
        "unused-imports/no-unused-vars": [
            "error",
            {
                varsIgnorePattern: "^_",
                argsIgnorePattern: "^_",
                destructuredArrayIgnorePattern: "^_",
                ignoreRestSiblings: false
            }
        ]
    }
};