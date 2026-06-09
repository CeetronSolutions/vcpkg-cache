import * as github from "@actions/github";
import * as core from "@actions/core";

const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

const expectedKey = process.env.EXPECTED_CACHE_KEY;

// The Actions cache list API can lag behind a freshly uploaded entry before it
// becomes queryable. Poll until the saved bundle key shows up so the assert
// doesn't race the index (mirrors the wait in restore.arrange.mjs).
const maxAttempts = 20;
const delayMs = 500;

let found = false;
let actualCacheEntries = new Set();
for (let attempt = 1; attempt <= maxAttempts; attempt++) {
  const {
    data: { actions_caches: cacheEntries },
  } = await octokit.rest.actions.getActionsCacheList({
    ...github.context.repo,
    key: expectedKey,
  });

  actualCacheEntries = new Set(cacheEntries.map((c) => c.key));

  if (actualCacheEntries.has(expectedKey)) {
    core.info(`Confirmed bundle cache entry '${expectedKey}' exists after ${attempt} attempt(s)`);
    found = true;
    break;
  }

  if (attempt < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

// Don't call process.exit here: forcing exit while octokit's keep-alive socket
// is still tearing down trips a libuv assertion on Windows (UV_HANDLE_CLOSING).
// Let the event loop drain and signal failure via core.setFailed (exit code 1).
if (!found) {
  core.setFailed(
    `Expected bundle cache entry '${expectedKey}' was not found after ${maxAttempts} attempts. Found: [${Array.from(actualCacheEntries).join(", ")}]`
  );
}
