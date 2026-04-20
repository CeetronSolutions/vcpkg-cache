import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as cache from "@actions/cache";
import * as core from "@actions/core";

const archivePath = path.resolve(process.env.ARCHIVE_PATH);
const cacheKey = `${process.env.EXPECTED_CACHE_KEY_PREFIX}${process.env.RESTORE_RUN_ID_SEED}`;

const folder = path.join(archivePath, "00");
const file = path.join(folder, `${process.env.EXPECTED_RESTORED_ABI}.zip`);

await fs.mkdir(folder, { recursive: true });
await fs.writeFile(file, "");

core.info(`Saving bundle cache entry '${cacheKey}' using path '${archivePath}'`);

await cache.saveCache([archivePath], cacheKey);

await fs.rm(archivePath, { recursive: true });

// The Actions cache service can take a moment after upload before a saved entry
// becomes queryable. Poll until the restore lookup sees it so the action-under-test
// doesn't race the index.
const maxAttempts = 20;
const delayMs = 500;
for (let attempt = 1; ; attempt++) {
  const found = await cache.restoreCache([archivePath], cacheKey, [], { lookupOnly: true });
  if (found) {
    core.info(`Cache entry '${cacheKey}' is queryable after ${attempt} attempt(s)`);
    break;
  }
  if (attempt >= maxAttempts) {
    core.setFailed(`Cache entry '${cacheKey}' was not queryable after ${maxAttempts} attempts`);
    process.exit(1);
  }
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}
