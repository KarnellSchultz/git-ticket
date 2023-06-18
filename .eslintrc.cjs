module.exports = {
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "prettier",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        tsConfigRootDir: __dirname,
        project: ["./tsconfig.json"],
    },
    plugins: ["@typescript-eslint"],
    root: true,
}
