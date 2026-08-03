import js from "@eslint/js";
import eslintReact from "@eslint-react/eslint-plugin";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import security from "eslint-plugin-security";
import globals from "globals";

export default [
  {
    ignores: [
      "dist/",
      "coverage/",
      ".astro/",
      "node_modules/",
      ".npm/",
      ".npm-cache/",
      "public/r/",
    ],
  },
  {
    files: ["src/**/*.{js,mjs,ts,tsx}"],
    ...js.configs.recommended,
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      security,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...security.configs.recommended.rules,
      "no-undef": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "security/detect-object-injection": "off",
    },
  },
  {
    files: ["src/**/*.tsx"],
    plugins: {
      "@eslint-react": eslintReact,
    },
    rules: {
      ...eslintReact.configs["recommended-typescript"].rules,
    },
  },
  {
    // These effects intentionally synchronize route, browser, or controlled-view state.
    files: [
      "src/components/auth/{AccountApp,LoginPageApp,OAuthCallback}.tsx",
      "src/components/fa-media/{media-library,media-presets}.tsx",
      "src/components/fa-prompt/prompt-template-editor.tsx",
      "src/components/m8-ui/{data-table-server-toolbar,toast-notification}.tsx",
      "src/components/media/{MediaApp,MediaPresetActionApp}.tsx",
      "src/components/prompt/PromptApp.tsx",
      "src/components/starlight/SidebarToggle.tsx",
    ],
    rules: {
      "@eslint-react/set-state-in-effect": "off",
    },
  },
  {
    // Preserve supported React context APIs used by shared registry skins.
    files: [
      "src/components/auth/AuthProvider.tsx",
      "src/components/ui/{chart,form}.tsx",
    ],
    rules: {
      "@eslint-react/no-context-provider": "off",
      "@eslint-react/no-use-context": "off",
    },
  },
  {
    // The registry chart skin requires generated CSS and order-based Recharts payload keys.
    files: ["src/components/ui/chart.tsx"],
    rules: {
      "@eslint-react/dom-no-dangerously-set-innerhtml": "off",
      "@eslint-react/no-array-index-key": "off",
    },
  },
  {
    // Optional-plugin stubs retain the public hook names of the package they replace.
    files: ["src/lib/reparto-stubs/react.tsx"],
    rules: {
      "@eslint-react/no-unnecessary-use-prefix": "off",
    },
  },
  {
    files: ["src/**/*.test.{ts,tsx}"],
    rules: {
      "security/detect-non-literal-regexp": "off",
      "security/detect-unsafe-regex": "off",
    },
  },
];
