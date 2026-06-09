import { expect, test } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

test("save post action only runs for successful jobs", () => {
  const actionYaml = readFileSync(resolve("action.yml"), "utf8");
  const runsSection = actionYaml.match(/runs:\n((?:\s{2}.+\n?)+)/)?.[1];

  expect(runsSection).toContain('post-if: "success() && !cancelled()"');
});
