/** @type {import('eslint').Linter.Config} */
const config = {
    ignorePatterns: ['**/node_modules/**', '**/dist/**', '**/test/**'],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    extends: ["plugin:@typescript-eslint/recommended"],
    root: true,
};

module.exports = config;