// src/__tests__/neovim.test.ts
import { describe, test, afterAll } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { resolve } from "jsr:@std/path";
import { assertEquals } from "jsr:@std/assert";

import { runMacro } from "./neovim.ts";
import { Logger } from "./logger.ts";

describe('runMacro', () => {
  // Close the logger after all tests are complete
  afterAll(() => {
    Logger.getInstance().close();
  });

  test('should apply vim macro to a file', async () => {
    // Define file paths
    const targetFile = resolve('test_fixture/drizzle/src/index.ts');
    const macroRawFile = resolve('test_fixture/drizzle/macro.raw');
    const expectedResultFile = resolve('test_fixture/drizzle/src/index.ts.macro-applied.txt');

    // Create a temporary copy of the original file to test against
    const tempFile = resolve('test_fixture/drizzle/src/tmp.index.ts');
    await Deno.copyFile(targetFile, tempFile);

    try {
      // Run the macro on the temp file
      const result = await runMacro(tempFile, macroRawFile, null);
      expect(result).toEqual({
        column: 5,
        line: 13,
      });

      // Read the expected and actual output
      const expected = await Deno.readTextFile(expectedResultFile);
      const actual = await Deno.readTextFile(tempFile);

      // Compare the results
      assertEquals(actual.trim(), expected.trim(), 'File content after macro application should match expected result');
    } finally {
      // Cleanup the temp file
      try {
        await Deno.remove(tempFile);
      } catch (error) {
        console.error('Error cleaning up temp file:', error);
      }
    }
  });

  test('should apply vim macro to a file', async () => {
    // Define file paths
    const targetFile = resolve('test_fixture/drizzle/src/index.ts');
    const macroRawFile = resolve('test_fixture/drizzle/macro.raw');
    const expectedResultFile = resolve('test_fixture/drizzle/src/index.ts.macro-applied.2.txt');

    // Create a temporary copy of the original file to test against
    const tempFile = resolve('test_fixture/drizzle/src/tmp2.index.ts');
    await Deno.copyFile(targetFile, tempFile);

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
      const expected = await Deno.readTextFile(expectedResultFile);
      const actual = await Deno.readTextFile(tempFile);

      // Compare the results
      assertEquals(actual.trim(), expected.trim(), 'File content after macro application should match expected result');
    } finally {
      // Cleanup the temp file
      try {
        await Deno.remove(tempFile);
      } catch (error) {
        console.error('Error cleaning up temp file:', error);
      }
    }
  });
});
