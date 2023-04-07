/**
 * @type {import('eslint').Linter.Config}
 */
export default {
  parser: '@typescript-eslint/parser',
  plugins: ['solid'],
  extends: ['eslint:recommended', 'plugin:solid/typescript'],
  ignorePatterns: ['public/**/*.js']
}
