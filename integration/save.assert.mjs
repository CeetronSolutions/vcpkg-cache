import * as github from "@actions/github";
import * as core from "@actions/core";

const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

const expectedKey = process.env.EXPECTED_CACHE_KEY;

const {
  data: { actions_caches: cacheEntries },
} = await octokit.rest.actions.getActionsCacheList({
  ...github.context.repo,
  key: expectedKey,
});

const actualCacheEntries = new Set(cacheEntries.map((c) => c.key));

if (!actualCacheEntries.has(expectedKey)) {
  core.setFailed(
    `Expected bundle cache entry '${expectedKey}' was not found. Found: [${Array.from(actualCacheEntries).join(", ")}]`,
  );
} else {
  core.info(`Confirmed bundle cache entry '${expectedKey}' exists`);
}
