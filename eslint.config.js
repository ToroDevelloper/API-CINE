const js = require("@eslint/js");
const globals = require("globals");
const jestPlugin = require("eslint-plugin-jest");

module.exports = [
    js.configs.recommended,
    {
        files: ["src/**/*.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "commonjs",
            globals: {
                ...globals.node,
            }
        },
        rules: {
            "no-unused-vars": "error",
            "no-console": "off"
        }
    },
    {
        files: ["tests/**/*.js", "jest.config.js", "seed.js"],
        plugins: {
            jest: jestPlugin
        },
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "commonjs",
            globals: {
                ...globals.node,
                ...jestPlugin.environments.globals.globals
            }
        },
        rules: {
            ...jestPlugin.configs.recommended.rules
        }
    }
];
