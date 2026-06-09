# `vcpkg` Dependency Caching using GHA

Simple Node-based GitHub action to regain per-package caching using GitHub Actions.

All vcpkg binaries are bundled into a **single cache entry** per configuration, dramatically reducing the number of GitHub Actions cache entries compared to storing one entry per binary file.

```yaml
- uses: TAServers/vcpkg-cache@v3
  with:
    cache-key: ${{ hashFiles('vcpkg.json', 'vcpkg-configuration.json') }}
```

Inputs:

- `cache-key`: A stable key identifying this cache configuration. Should change when the set of dependencies or the toolchain changes (e.g. a hash of `vcpkg.json`, triplet, and compiler version). All vcpkg binaries are bundled into a single cache entry keyed by `{prefix}{cache-key}-{run-id}`, with fallback restore using the prefix `{prefix}{cache-key}-`.
- (optional) `prefix`: Prefix added to cache keys. Defaults to `vcpkg/`. Can be used to independently cache entries for each vcpkg triplet.
- (optional) `token`: No longer required. Kept for backward compatibility.

Outputs:

- `path`: Absolute path to the restored cache (to be passed to vcpkg)

Uses the official `@actions/cache` NPM package under the hood to ensure compatibility with any breaking API changes 😉.

## Usage

Add `TAServers/vcpkg-cache` to your workflow before you run CMake configure (or whatever triggers your `vcpkg install`):

```yaml
- name: Restore vcpkg cache
  id: vcpkg-cache
  uses: TAServers/vcpkg-cache@v3
  with:
    cache-key: ${{ hashFiles('vcpkg.json', 'vcpkg-configuration.json') }}-${{ runner.os }}-${{ env.VCPKG_TRIPLET }}
```

Tell `vcpkg` to use the restored directory for binary caching:

```yaml
- name: CMake Configure
  env:
    VCPKG_FEATURE_FLAGS: "binarycaching" # Possibly redundant, but explicitly sets the binary caching feature flag
    VCPKG_BINARY_SOURCES: "clear;files,${{ steps.vcpkg-cache.outputs.path }},readwrite"
  run: # Run cmake configure (or if you install vcpkg packages earlier, add the env var there
```

## How it works

On **restore**, the action looks for the most recent bundle saved under the given `cache-key` using `@actions/cache` prefix-match restore keys. If found, the entire vcpkg binary archive is restored from that bundle.

On **save** (post step), the action saves the current state of the vcpkg binary archive as a new bundle entry keyed with `{prefix}{cache-key}-{run-id}`. Because GitHub Actions cache entries are immutable, each run writes a new entry that accumulates any newly compiled packages. Older entries are eventually evicted by the 10 GB cache limit.
