import * as github from "@actions/github";
import * as core from "@actions/core";

const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

const expectedKey = process.env.EXPECTED_CACHE_KEY;

// The Actions cache list API can lag behind a freshly uploaded entry before it
// becomes queryable. Poll until the saved bundle key shows up so the assert
// doesn't race the index (mirrors the wait in restore.arrange.mjs).
const maxAttempts = 20;
const delayMs = 500;

let actualCacheEntries = new Set();
for (let attempt = 1; ; attempt++) {
  const {
    data: { actions_caches: cacheEntries },
  } = await octokit.rest.actions.getActionsCacheList({
    ...github.context.repo,
    key: expectedKey,
  });

  actualCacheEntries = new Set(cacheEntries.map((c) => c.key));

  if (actualCacheEntries.has(expectedKey)) {
    core.info(`Confirmed bundle cache entry '${expectedKey}' exists after ${attempt} attempt(s)`);
    process.exit(0);
  }

  if (attempt >= maxAttempts) {
    break;
  }

  await new Promise((resolve) => setTimeout(resolve, delayMs));
}

core.setFailed(
  `Expected bundle cache entry '${expectedKey}' was not found after ${maxAttempts} attempts. Found: [${Array.from(actualCacheEntries).join(", ")}]`
);
