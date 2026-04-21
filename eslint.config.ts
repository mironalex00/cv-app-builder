import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";

export default tseslint.config([
    globalIgnores([
        'dist',
        'build',
        'node_modules',
        'coverage',
        '.rolldown',
        '*.config.{js,ts}',
        "**/*.old/**"
    ]),
    {
        files: [
            "**/*.{ts,tsx}"
        ],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
    },
]);