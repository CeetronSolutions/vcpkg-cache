import * as cache from "@actions/cache";
import * as core from "@actions/core";
import { resolvedCacheFolder } from "./helpers.js";

const vcpkgCachePath = resolvedCacheFolder();

await core.group("Saving vcpkg cache", async () => {
  try {
    const saveCacheKey = core.getState("saveCacheKey");
    const restoredKey = core.getState("restoredKey");

    if (!saveCacheKey) {
      core.warning("No save cache key found. Skipping save.");
      return;
    }

    if (restoredKey === saveCacheKey) {
      core.info(`Cache already present with key '${saveCacheKey}'. Skipping save.`);
      return;
    }

    core.info(`Saving vcpkg cache with key '${saveCacheKey}'`);
    try {
      await cache.saveCache([vcpkgCachePath], saveCacheKey);
    } catch (error) {
      // GH Actions cache rejects duplicate keys with ReserveCacheError. Treat
      // that as success -- a concurrent run on another branch won the race and
      // the bundled content is content-addressed, so the entry is valid.
      if (error?.name === "ReserveCacheError") {
        core.info(`Cache key '${saveCacheKey}' already exists (concurrent save). Skipping.`);
        return;
      }
      throw error;
    }
  } catch (error) {
    core.setFailed(error);
  }
});
