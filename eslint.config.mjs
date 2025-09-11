import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';

import { includeIgnoreFile } from '@eslint/compat';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);
const gitignorePath = path.resolve(dirName, '.gitignore');

export default [
    { files: ['**/*.{js,mjs,cjs,ts}'] },
    includeIgnoreFile(gitignorePath),
    {
        languageOptions: {
            globals: {
                ...globals.node,
            },
            ecmaVersion: 2022,
            sourceType: 'module'
        }
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.strict,
    stylistic.configs['disable-legacy'],
    {
        ignores: ['build/', 'dist/', 'node_modules/', '_old/**', 'test/**']
    },
    {
        plugins: { '@stylistic/js': stylistic },
        rules: {
            // indent: ['warn', 4],
            'import/no-unresolved': 'off',
            'no-process-env': 'off',
            'no-tabs': ['off'],
            'semi': ['error', 'always'],
            'no-unused-vars': 0,
            'no-case-declarations': 0,
            '@typescript-eslint/no-extraneous-class': 0,
            '@typescript-eslint/no-inferrable-types': 0,
            '@typescript-eslint/no-explicit-any': 0,
            '@typescript-eslint/no-duplicate-enum-values': 0,
            '@typescript-eslint/no-unused-vars': 0,
            '@typescript-eslint/no-unnecessary-type-constraint': 0,
            '@typescript-eslint/no-invalid-void-type': 0,
            "@typescript-eslint/no-non-null-assertion": 0,
            '@typescript-eslint/naming-convention': [
                'warn',
                {
                    selector: 'enumMember',
                    format: ['PascalCase'],
                    leadingUnderscore: 'allow',
                    trailingUnderscore: 'allow',
                },
                {
                    selector: 'variable',
                    format: ['camelCase', 'UPPER_CASE', 'snake_case', 'PascalCase'],
                },
                {
                    selector: 'class',
                    format: ['PascalCase'],
                },
                {
                    selector: 'parameter',
                    format: ['camelCase'],
                },
                {
                    selector: 'classMethod',
                    format: ['camelCase'],
                },
                {
                    selector: 'function',
                    format: ['camelCase', 'PascalCase'],
                },
                {
                    selector: 'interface',
                    format: ['PascalCase'],
                },
            ],
        },
    },
];