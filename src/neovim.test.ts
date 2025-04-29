// src/__tests__/neovim.test.ts
import { test, describe, expect } from 'vitest';
import { runMacro } from './neovim';
import { readFileSync, copyFileSync, unlinkSync } from 'node:fs';
import assert from 'node:assert';
import path from 'node:path';

describe('runMacro', () => {
    test('should apply vim macro to a file', async () => {
        // Define file paths
        const targetFile = path.resolve('test_fixture/drizzle/src/index.ts');
        const macroRawFile = path.resolve('test_fixture/drizzle/macro.raw');
        const expectedResultFile = path.resolve('test_fixture/drizzle/src/index.ts.macro-applied.txt');

        // Create a temporary copy of the original file to test against
        const tempFile = path.resolve('test_fixture/drizzle/src/tmp.index.ts');
        copyFileSync(targetFile, tempFile);

        try {
            // Run the macro on the temp file
            const result = await runMacro(tempFile, macroRawFile, null);
            expect(result).toEqual({
                column: 5,
                line: 13,
            });

            // Read the expected and actual output
            const expected = readFileSync(expectedResultFile, 'utf8');
            const actual = readFileSync(tempFile, 'utf8');

            // Compare the results
            assert.strictEqual(actual.trim(), expected.trim(), 'File content after macro application should match expected result');
        } finally {
            // Cleanup the temp file
            try {
                unlinkSync(tempFile);
            } catch (error) {
                console.error('Error cleaning up temp file:', error);
            }
        }
    });

    test('should apply vim macro to a file', async () => {
        // Define file paths
        const targetFile = path.resolve('test_fixture/drizzle/src/index.ts');
        const macroRawFile = path.resolve('test_fixture/drizzle/macro.raw');
        const expectedResultFile = path.resolve('test_fixture/drizzle/src/index.ts.macro-applied.2.txt');

        // Create a temporary copy of the original file to test against
        const tempFile = path.resolve('test_fixture/drizzle/src/tmp.index.ts');
        copyFileSync(targetFile, tempFile);

        try {
            // Run the macro on the temp file
            const result = await runMacro(tempFile, macroRawFile, {
                column: 5,
                line: 13,
            });
            expect(result).toEqual({
                column: 5,
                line: 17,
            });

            // Read the expected and actual output
            const expected = readFileSync(expectedResultFile, 'utf8');
            const actual = readFileSync(tempFile, 'utf8');

            // Compare the results
            assert.strictEqual(actual.trim(), expected.trim(), 'File content after macro application should match expected result');
        } finally {
            // Cleanup the temp file
            try {
                unlinkSync(tempFile);
            } catch (error) {
                console.error('Error cleaning up temp file:', error);
            }
        }
    });
});