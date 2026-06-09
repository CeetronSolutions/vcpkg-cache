import { expect, test } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

test("save post action only runs for successful jobs", () => {
  const actionYaml = readFileSync(resolve("action.yml"), "utf8");

  expect(actionYaml).toContain('post-if: "success()"');
});
