const typescript = require("@typescript-eslint/eslint-plugin")
const typescriptParser = require("@typescript-eslint/parser")
const prettier = require("eslint-config-prettier")
const react = require("eslint-plugin-react")

module.exports = [
  {
    ignores: ["./dist"]
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: typescriptParser
    },
    plugins: {
      "@typescript-eslint": typescript
    },
    rules: {
      ...typescript.configs["eslint-recommended"].rules,
      ...typescript.configs["recommended"].rules,
      "@typescript-eslint/no-unused-vars": ["error", { varsIgnorePattern: "^_" }]
    }
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    settings: {
      react: {
        version: "detect"
      }
    },
    plugins: {
      react: react
    },
    rules: {
      ...react.configs.recommended.rules,
      "react/jsx-sort-props": "error",
      "react/react-in-jsx-scope": "off", // it should be disabled when tsconfig.json/compilerOptions.jsx is "react-jsx"
      ...prettier.rules
    }
  }
]
