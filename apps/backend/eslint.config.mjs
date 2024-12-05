import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import boundaries from "eslint-plugin-boundaries";

export default [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    plugins: {
      boundaries,
      "@typescript-eslint": tsPlugin,
    },
    settings: {
      "boundaries/include": ["src/modules/**/*"],
      "boundaries/elements": [
        {
          type: "shared",
          pattern: ["src/modules/shared/**/*"],
        },
        {
          type: "module",
          capture: ["moduleName"],
          pattern: ["src/modules/:moduleName/**/*"],
        },
      ],
    },
    rules: {
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            {
              from: ["module"],
              allow: ["shared"],
            },
            {
              from: ["shared"],
              allow: ["shared"],
            },
          ],
        },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
];