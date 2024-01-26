module.exports = {
  root: true,
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: { project: ['./tsconfig.json'] },
  rules: {
    '@typescript-eslint/strict-boolean-expressions': [
      'error',
      {
        allowString: false,
        allowNumber: false,
      },
    ],
    curly: ['error'],
  },
  ignorePatterns: [
    'node_modules',
    'dist',
    'coverage',
    'jest.config.js',
    '.eslintrc.js',
  ],
}
