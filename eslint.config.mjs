import js from "@eslint/js";
import tseslint from "typescript-eslint";

const sharedGlobals = {
  Buffer: "readonly",
  URL: "readonly",
  clearTimeout: "readonly",
  console: "readonly",
  crypto: "readonly",
  document: "readonly",
  fetch: "readonly",
  localStorage: "readonly",
  navigator: "readonly",
  process: "readonly",
  setTimeout: "readonly",
  window: "readonly",
};

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "target/**",
      "test-ledger/**",
      ".anchor/**",
      ".surfpool/**",
      "packages/sdk/.venv/**",
      "packages/matcher/src/generated/**",
      "packages/sdk/src/circuit_sdk/idl/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: sharedGlobals,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // ESLint core does not treat JSX component references as variable uses.
      // The Vite build and TypeScript cover unused-code detection elsewhere.
      "no-unused-vars": "off",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: sharedGlobals,
    },
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["tests/tests/**/*.ts"],
    languageOptions: {
      globals: {
        ...sharedGlobals,
        after: "readonly",
        afterEach: "readonly",
        before: "readonly",
        beforeEach: "readonly",
        describe: "readonly",
        it: "readonly",
      },
    },
  },
);
