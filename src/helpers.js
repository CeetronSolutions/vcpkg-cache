import * as core from "@actions/core";
import * as path from "path";

export const CACHE_FOLDER = ".vcpkg-cache";

export const getCacheKeyPrefix = () => core.getInput("prefix") || "vcpkg/";

export const getCacheKeyInput = () => core.getInput("cache-key", { required: true });

export const resolvedCacheFolder = () => path.resolve(CACHE_FOLDER);

export const getBundleSaveCacheKey = (prefix, cacheKey) => `${prefix}${cacheKey}`;

// Restore-key prefix matching caches written by versions <= 3.4.2, which embedded
// GITHUB_RUN_ID in the save key. Lets the action keep restoring those entries
// during the migration window; can be removed once they have aged out.
export const getLegacyBundleRestoreKeyPrefix = (prefix, cacheKey) => `${prefix}${cacheKey}-`;
