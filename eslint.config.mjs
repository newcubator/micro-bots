// @ts-check

import eslint from "@eslint/js";
import jest from "eslint-plugin-jest";
import tseslint from "typescript-eslint";
import "eslint-plugin-only-warn";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.spec.ts"],
    ...jest.configs["flat/recommended"],
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
