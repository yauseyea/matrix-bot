import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import prettierPlugin from 'eslint-plugin-prettier'; // Plugin for integrating Prettier with ESLint

export default [
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**", "src/__tests__/**"],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  {
    plugins: {
      prettier: prettierPlugin, // Enable Prettier plugin for formatting rules
    },
  },
  {
    rules: {
      // Prettier formatting rules integrated with ESLint
      'prettier/prettier': [
        'error', // Report Prettier formatting issues as errors
        {
          singleQuote: true, // Use single quotes instead of double quotes
          trailingComma: 'es5', // Add trailing commas in ES5-compatible structures (e.g., arrays, objects)
          arrowParens: 'always',
        },
      ],
      "no-use-before-define": "warn",
      "prefer-destructuring": "warn",
      'arrow-parens': ['error', 'always'],
      'no-console': 'warn', // Warn when console is used (helps avoid leaving console logs in production code)
      'prefer-const': 'error', // Enforce the use of const for variables that are never reassigned
      'no-var': 'error', // Disallow the use of var for variable declarations (use let or const instead)
      
      // Allow any type for TypeScript files but warn about it (avoid using any type where possible)
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },  
  prettier,
];

