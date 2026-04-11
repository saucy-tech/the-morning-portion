import nextConfig from 'eslint-config-next/core-web-vitals';
import globals from 'globals';

const eslintConfig = [
  ...nextConfig,
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'no-console': 'off',
    },
  },
];

export default eslintConfig;
