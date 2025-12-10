import path from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: false,
});

export default [
  ...compat.extends('airbnb-base'),
  {
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 2022,
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      'no-underscore-dangle': 'off',
      'import/extensions': 'off',
      'import/prefer-default-export': 'off',
      'consistent-return': 'off',
      'no-param-reassign': 'off',
      'object-curly-newline': 'off',
      'max-len': ['error', { code: 160, ignoreUrls: true }],
      'no-console': 'off',
      'operator-linebreak': 'off',
      'prefer-destructuring': 'off',
      'no-await-in-loop': 'off',
      'no-restricted-syntax': 'off',
      'default-param-last': 'off',
      indent: 'off',
      quotes: 'off',
      'no-empty': 'off',
      'implicit-arrow-linebreak': 'off',
      'no-nested-ternary': 'off',
    },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.mocha,
      },
    },
    rules: {
      'no-unused-expressions': 'off',
    },
  },
];
