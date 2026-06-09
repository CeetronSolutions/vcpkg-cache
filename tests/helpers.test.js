import { expect, test } from "vitest";
import { getBundleSaveCacheKey, getLegacyBundleRestoreKeyPrefix } from "../src/helpers";

test("getBundleSaveCacheKey should return the content-addressed key without a per-run suffix", () => {
  const key = getBundleSaveCacheKey("vcpkg/", "abc123");

  expect(key).toBe("vcpkg/abc123");
});

test("getLegacyBundleRestoreKeyPrefix should return the run-id-suffixed prefix for legacy caches", () => {
  const prefix = getLegacyBundleRestoreKeyPrefix("vcpkg/", "abc123");

  expect(prefix).toBe("vcpkg/abc123-");
});
