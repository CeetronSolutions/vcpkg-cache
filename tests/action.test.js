import { expect, test } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

test("save post action only runs for successful jobs", () => {
  const actionYaml = readFileSync(resolve("action.yml"), "utf8");
  const lines = actionYaml.split(/\r?\n/);
  const runsLineIndex = lines.findIndex((line) => line.trim() === "runs:");
  const postIfLineIndex = lines.findIndex((line) => line.trim() === 'post-if: "success() && !cancelled()"');
  const nextTopLevelLineIndex = lines.findIndex((line, index) => index > runsLineIndex && /^[^\s].+:/.test(line));

  expect(runsLineIndex).toBeGreaterThan(-1);
  expect(postIfLineIndex).toBeGreaterThan(runsLineIndex);
  expect(nextTopLevelLineIndex === -1 || postIfLineIndex < nextTopLevelLineIndex).toBe(true);
});
