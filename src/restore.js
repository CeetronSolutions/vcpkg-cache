import * as cache from "@actions/cache";
import * as core from "@actions/core";
import {
  getCacheKeyPrefix,
  getCacheKeyInput,
  getBundleSaveCacheKey,
  getLegacyBundleRestoreKeyPrefix,
  resolvedCacheFolder,
} from "./helpers.js";

const prefix = getCacheKeyPrefix();
const cacheKey = getCacheKeyInput();
const vcpkgCachePath = resolvedCacheFolder();

core.setOutput("path", vcpkgCachePath);

await core.group("Restoring vcpkg cache", async () => {
  try {
    const saveCacheKey = getBundleSaveCacheKey(prefix, cacheKey);
    const legacyRestoreKeyPrefix = getLegacyBundleRestoreKeyPrefix(prefix, cacheKey);

    core.info(`Restoring cache with key '${saveCacheKey}' (legacy fallback prefix '${legacyRestoreKeyPrefix}')`);
    const restoredKey = await cache.restoreCache([vcpkgCachePath], saveCacheKey, [legacyRestoreKeyPrefix]);

    if (restoredKey) {
      core.info(`Cache restored from '${restoredKey}'`);
    } else {
      core.info(`No cache found for '${saveCacheKey}' or prefix '${legacyRestoreKeyPrefix}'`);
    }

    core.saveState("saveCacheKey", saveCacheKey);
    core.saveState("restoredKey", restoredKey || "");
  } catch (error) {
    core.setFailed(error);
  }
});
