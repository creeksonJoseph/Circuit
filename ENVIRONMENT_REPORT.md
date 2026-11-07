# CIRCUIT — Environment Report

**Stage:** 0 — Technical discovery  
**Date:** 2026-11-06  
**Host:** `Linux Creeksonjoseph 7.0.0-42-generic #42-Ubuntu SMP PREEMPT_DYNAMIC Thu Oct 15 08:06:17 UTC 2026 x86_64 GNU/Linux`  
**Distribution:** Ubuntu 26.04.1 LTS (Resolute Raccoon)  
**Working directory:** `/home/creeksonjoseph/softwarengineering/personal_projects/circuit`  
**Scope:** Stage 0 read-only inspection, followed by the Stage 1 installation and scaffold.

> **Stage 1 update (2026-11-07):** The missing toolchain items in §2.2 were
> installed after Stage 0 approval. Actual verified versions now:
>
> | Tool | Verified output |
> |---|---|
> | Rust | `rustc 1.99.1 (58cf8f9c3 2026-10-13)` |
> | Cargo | `cargo 1.99.1 (5f94df478 2026-08-27)` |
> | Solana CLI | `solana-cli 4.1.2 (src:182084b8; feat:c763ae0a, client:Agave)` |
> | Test validator | `solana-test-validator 4.1.2 (...)` |
> | Anchor CLI | `anchor-cli 1.2.2` |
> | Node.js | `v26.13.0` |
> | npm | `11.20.0` |
> | Python | `Python 3.14.4` |
> | uv | `uv 0.13.7` |
>
> Anchor CLI was installed from the official prebuilt
> `anchor-1.2.2-x86_64-unknown-linux-gnu` release asset rather than built with
> AVM. Solana CLI 4.1.2 was installed from the official release archive. The
> Linux packages listed in §3 (`pkg-config`, `libudev-dev`, `llvm`,
> `libclang-dev`, `protobuf-compiler`, `libssl-dev`) were **not** installed
> because passwordless sudo was unavailable; the Anchor program build must be
> checked against this state. See `STAGE1_REPORT.md` for the actual build
> results.
>
> The Stage 1 scaffold changed two language decisions: the SDK is **Python** and
> the frontend is **React + JavaScript**. The SDK is managed with **uv 0.13.7**
> (`uv sync --locked`, `uv run pytest`, `uv build --wheel`), not pip. See
> `BUILD_AND_TEST.md` for the authoritative commands.

---

## 1. Executive summary

The machine has a working Node.js/npm toolchain and basic C/C++ build tools, but it does **not** have Rust, Cargo, rustup, the Solana CLI, `solana-test-validator`, the Anchor CLI, or AVM. It also lacks several Linux packages that Anchor lists as prerequisites. There is no Solana wallet/keypair and no Git repository in the project directory yet.

Therefore, **the CIRCUIT program cannot be built, deployed, or tested on this machine in its current state**. The blockers are toolchain installation, not application code.

The recommended target toolchain is:

| Layer | Recommended version | Reason |
|---|---|---|
| Rust | **1.99.1** (current stable) | Anchor 1.2.2 MSRV is 1.89; 1.99.1 is current stable |
| Solana CLI / Agave | **4.1.2** | Anchor 1.2.2's explicitly recommended Solana version |
| Platform tools | **v1.57**, SBPF architecture **v3** | Anchor 1.2.2 release notes |
| Anchor CLI / crates | **1.2.2** (exact) | Latest stable Anchor release |
| Node.js | **26.13.0** (already installed) | Current LTS; satisfies Anchor's `>=20.18` engine |
| npm | **11.20.0** (already installed) | npm workspaces; pnpm/yarn/bun are absent |
| Package manager | **npm workspaces** | Installed; avoids a new global tool |

Full compatibility evidence is in `PROPOSED_DEPENDENCIES.md`.

---

## 2. Installed versions (actual, observed 2026-11-06)

### 2.1 Present components

| Component | Command used | Observed output | Status |
|---|---|---|---|
| OS | `uname -a` | Linux 7.0.0-42-generic, x86_64 | Present |
| Distribution | `cat /etc/os-release` | Ubuntu 26.04.1 LTS (Resolute Raccoon) | Present |
| glibc | `ldd --version` | `ldd (Ubuntu GLIBC 2.43-2ubuntu2.4) 2.43` | Present |
| Node.js | `node --version` | `v26.13.0` | Present |
| npm | `npm --version` | `11.20.0` | Present |
| npx | `command -v npx` | `/home/creeksonjoseph/.nvm/versions/node/v26.13.0/bin/npx` | Present |
| Git | `git --version` | `git version 2.53.0` | Present |
| Python | `python3 --version` | `Python 3.14.4` | Present |
| curl | `curl --version` | `curl 8.18.0` | Present |
| OpenSSL | `openssl version` | `OpenSSL 3.5.5 27 Jan 2026` | Present |
| GCC | `gcc --version` | `gcc (Ubuntu 15.2.0-16ubuntu1) 15.2.0` | Present |
| G++ | `g++ --version` | `g++ (Ubuntu 15.2.0-16ubuntu1) 15.2.0` | Present |
| GNU Make | `make --version` | `GNU Make 4.4.1` | Present |
| bzip2 | `dpkg -s bzip2` | `1.0.8-6ubuntu0.1` | Present |
| build-essential | `dpkg -s build-essential` | `12.12ubuntu2.26.04.2` | Present |

### 2.2 Missing components

These were checked with `command -v`, and their standard install directories are absent.

| Component | Command used | Result | Status |
|---|---|---|---|
| Rust compiler | `rustc --version` | `rustc: command not found` | **MISSING** |
| Cargo | `cargo --version` | `cargo: command not found` | **MISSING** |
| rustup | `rustup --version` | `rustup: command not found` | **MISSING** |
| Solana CLI | `solana --version` | `solana: command not found` | **MISSING** |
| Solana test validator | `solana-test-validator --version` | `command not found` | **MISSING** |
| Anchor CLI | `anchor --version` | `anchor: command not found` | **MISSING** |
| AVM | `avm --version` | `avm: command not found` | **MISSING** |
| pnpm | `pnpm --version` | `command not found` | **MISSING** |
| Yarn | `yarn --version` | `command not found` | **MISSING** |
| Bun | `bun --version` | `command not found` | **MISSING** |
| Corepack | `corepack --version` | `command not found` | **MISSING** |
| TypeScript compiler | `tsc --version` | `command not found` | **MISSING** (will be a dev dependency) |
| Docker | `docker --version` | `command not found` | **MISSING** (optional fallback) |

Absent toolchain directories:

```text
~/.cargo                    does not exist
~/.rustup                   does not exist
~/.avm                      does not exist
~/.local/share/solana       does not exist
~/.config/solana            does not exist  (no wallet/keypair)
```

`PATH` currently contains:

```text
/home/creeksonjoseph/.opencode/bin
/home/creeksonjoseph/.nvm/versions/node/v26.13.0/bin
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
```

`~/.cargo/bin` and `~/.local/share/solana/install/active_release/bin` will need to be added after installation.

---

## 3. Missing system packages

Anchor's Linux installation page lists the following packages:

```bash
sudo apt-get install -y \
    build-essential \
    pkg-config \
    libudev-dev llvm libclang-dev \
    protobuf-compiler libssl-dev
```

Current state on this machine:

| Package | Installed? | Installed version / apt candidate |
|---|---|---|
| `build-essential` | Yes | `12.12ubuntu2.26.04.2` |
| `bzip2` | Yes | `1.0.8-6ubuntu0.1` |
| `pkg-config` | **No** | apt candidate `2.5.1-4` |
| `libudev-dev` | **No** | apt candidate `259.9-0ubuntu0.1` |
| `llvm` | **No** | apt candidate `1:21.1.6-71` |
| `libclang-dev` | **No** | apt candidate `1:21.1.6-71` |
| `protobuf-compiler` | **No** | apt candidate `3.21.12-15ubuntu1.1` |
| `libssl-dev` | **No** | apt candidate `3.5.5-1ubuntu3.7` |
| `libsodium-dev` | **No** | apt candidate `1.0.18-2` (not in Anchor's current list; optional) |
| `clang` | **No** | not in Anchor's current list; platform tools bundle their own |
| `cmake` | **No** | not required for this stack |

**Conclusion:** the Linux build prerequisites are incomplete. They should be installed before building Anchor from source, building AVM, or compiling crates that need OpenSSL/`libudev`.

---

## 4. Hardware and resources

| Resource | Observed |
|---|---|
| CPU | Intel Core i5-8350U @ 1.70 GHz, 4 cores / 8 threads |
| RAM | 7.6 GiB total; approximately **1.7 GiB available** at inspection time |
| Swap | 7.8 GiB total (4 GiB `/swapfile` + 3.8 GiB zram); 2.3 GiB used |
| Disk | 234 GiB total, 33 GiB used, **190 GiB free** on `/` |
| Docker | Not installed |

The disk is sufficient. The low available RAM is a practical concern: Solana/Anchor Rust builds are memory-hungry. Close memory-heavy applications during the first build, or increase swap if builds are killed. The existing 7.8 GiB of swap provides a safety margin, but compilation may be slow on this CPU.

---

## 5. Network and registry reachability

| Check | Result |
|---|---|
| npm registry | `https://registry.npmjs.org/` reachable; `npm view @anchor-lang/core version` returned `1.2.2` |
| GitHub | `https://github.com` returned HTTP 200 |
| Anchor repository | `https://github.com/otter-sec/anchor` returned HTTP 200 |
| Solana install endpoint | `https://release.anza.xyz/v4.1.2/install` returned HTTP 200 |
| Rust installer | `https://sh.rustup.rs` returned HTTP 200 |
| crates.io API | Reachable with a user agent; `anchor-lang` 1.2.2 metadata retrieved |
| Large binary download | A 180-second attempt to download the Solana 4.1.2 Linux archive received ~39 MB of ~218 MB before timing out |

The large-download timeout is an operational risk, not a blocker. Toolchain installation may take a long time. Retry with a longer timeout or a stable connection.

---

## 6. Project filesystem state

The working directory contains documentation only:

```text
AGENTS.MD
ARCHTECTURE.MD
thought process.md
.marscode/deviceInfo.json
```

There is **no** `package.json`, `Cargo.toml`, `Anchor.toml`, `programs/`, `packages/`, `app/`, `tests/`, or `.git` directory. `git rev-parse --is-inside-work-tree` returned:

```text
fatal: not a git repository (or any of the parent directories): .git
```

There is no Solana wallet at `~/.config/solana/id.json`. A local/devnet keypair must be generated later; it must never be committed.

---

## 7. Exact verification commands

### 7.1 Current-state verification (safe, read-only)

```bash
# Operating system and C library
uname -a
cat /etc/os-release
ldd --version | head -1

# Toolchain presence and versions
for b in rustc cargo rustup solana solana-test-validator anchor avm \
         node npm npx pnpm yarn bun corepack tsc docker; do
  printf '%-24s %s\n' "$b" "$(command -v "$b" || echo MISSING)"
done

rustc --version       2>&1 || true
cargo --version       2>&1 || true
rustup --version      2>&1 || true
solana --version      2>&1 || true
solana-test-validator --version 2>&1 || true
anchor --version      2>&1 || true
avm --version         2>&1 || true
node --version
npm --version

# System packages
for p in build-essential pkg-config libudev-dev llvm libclang-dev \
         protobuf-compiler libssl-dev libsodium-dev bzip2; do
  printf '%-20s ' "$p"
  dpkg -s "$p" >/dev/null 2>&1 \
    && dpkg-query -W -f='${Version}\n' "$p" \
    || echo "NOT INSTALLED"
done

# Resources
nproc
free -h
df -h .

# Project state
ls -la
git rev-parse --is-inside-work-tree 2>&1 || true
ls -la ~/.config/solana 2>&1 || true
```

### 7.2 Expected post-install verification

```bash
rustc --version
# Expected: rustc 1.99.1 (...)

cargo --version
# Expected: cargo 1.99.1 (...)

rustup show active-toolchain
# Expected: 1.99.1-... (default)

solana --version
# Expected: solana-cli 4.1.2 (...)

solana-test-validator --version
# Expected: solana-test-validator 4.1.2 (...)

anchor --version
# Expected: anchor-cli 1.2.2

avm --version
# Expected: avm <version>

node --version
# Expected: v26.13.0

npm --version
# Expected: 11.20.0

cargo build-sbf --version
# Expected: platform-tools v1.57 / SBF architecture v3
```

### 7.3 Build and test gates (after Stage 1 scaffold exists)

```bash
anchor build --arch v3 --tools-version v1.57
anchor test --validator legacy
cargo fmt --all -- --check
cargo clippy --all-targets -- -D warnings
npm run typecheck
npm run test
npm run build
```

`--validator legacy` is deliberate: Anchor 1.2.2's `anchor test` defaults to **surfpool**, which is not installed. `--validator legacy` uses the `solana-test-validator` that ships with the Solana CLI. See `TECHNICAL_PLAN.md` §3.

---

## 8. Exact installation commands (NOT EXECUTED — require approval)

The following commands are the proposed sequence. They have **not** been run. Approval is requested before any of them are executed.

### 8.1 Linux prerequisites

```bash
sudo apt-get update
sudo apt-get install -y \
  build-essential \
  pkg-config \
  libudev-dev \
  llvm \
  libclang-dev \
  protobuf-compiler \
  libssl-dev
```

Optional, only if a crate requires it:

```bash
sudo apt-get install -y libsodium-dev
```

### 8.2 Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \
  | sh -s -- -y --profile minimal --default-toolchain 1.99.1

. "$HOME/.cargo/env"

rustup component add rustfmt clippy
rustc --version
cargo --version
```

Do not install a global nightly for Anchor IDL builds. AVM selects the toolchain it needs; the host stable toolchain is for `cargo test`, `cargo fmt`, and `cargo clippy`.

### 8.3 Solana CLI 4.1.2

Install the exact Anchor-recommended version, **not** the `stable` channel:

```bash
sh -c "$(curl -sSfL https://release.anza.xyz/v4.1.2/install)"

export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
solana --version
solana-test-validator --version
```

Why not `https://release.anza.xyz/stable/install`? The stable channel resolves to a newer Agave line than 4.1.2 (the compatibility matrix lists 4.3.x, while GitHub shows 4.4.1 as the latest release), whereas Anchor 1.2.2 explicitly recommends 4.1.2. Installing `stable` would create an untested pairing.

### 8.4 AVM and Anchor CLI 1.2.2

```bash
cargo install --git https://github.com/otter-sec/anchor avm --force

export PATH="$HOME/.avm/bin:$PATH"
avm --version

avm install 1.2.2
avm use 1.2.2
anchor --version
```

Expected: `anchor-cli 1.2.2`.

If AVM installation fails, the fallback is the prebuilt Anchor 1.2.2 release binary from:

```text
https://github.com/otter-sec/anchor/releases/tag/v1.2.2
```

Do not install Anchor 2.0.0-rc.x.

### 8.5 Node.js and npm

Node.js 26.13.0 and npm 11.20.0 are already installed and satisfy the declared engine ranges. No Node installation is required.

If Node 26 causes tooling problems, the conservative fallback is Node 24 LTS (latest observed: `v24.22.2`). That is an optional change, not a current blocker.

### 8.6 Shell PATH persistence

After verifying the binaries, add the following to `~/.bashrc` (or the user's shell profile):

```bash
export PATH="$HOME/.cargo/bin:$PATH"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
export PATH="$HOME/.avm/bin:$PATH"
```

### 8.7 Wallet/keypair (later, local/devnet only)

Do **not** generate or commit a keypair during discovery. When Stage 1 begins:

```bash
solana-keygen new --outfile ~/.config/solana/id.json
solana config set --url localhost
solana airdrop 100
```

For Devnet, use a separate keypair or the same local keypair, and never commit it. Mainnet is out of scope.

---

## 9. Environment risks

| Risk | Impact | Mitigation |
|---|---|---|
| Rust, Solana CLI, Anchor, AVM absent | Cannot build or test | Install the approved versions in §8 |
| Linux build packages missing | AVM/crate builds can fail | Install the Anchor Linux prerequisites |
| Low available RAM (~1.7 GiB) | Rust builds may be killed or slow | Close memory-heavy apps; use existing swap; build once and cache |
| Node 26 is newer than Anchor's documented test baseline (Node 23.9.0 in docs) | Possible tooling edge cases | All declared engines accept Node 26; fall back to Node 24.22.2 if needed |
| `anchor test` defaults to surfpool | Default test command fails because `surfpool` is absent | Use `anchor test --validator legacy` with `solana-test-validator` |
| `release.anza.xyz/stable` is not 4.1.2 | Untested Anchor/Solana pairing | Install `/v4.1.2/install`, not `/stable/install` |
| Large Solana archive download was slow/timed out | Installation may take a long time | Retry with a longer timeout; verify with `solana --version` |
| No wallet/keypair | Cannot airdrop/deploy | Generate later; never commit |
| No Git repository | No change history | `git init` in Stage 1 |
| Devnet airdrop rate limits | Deploy funding may be difficult | Use the web faucet or multiple small airdrops; budget SOL |
| Ubuntu 26.04 is not explicitly listed in the compatibility matrix | Small unknown | glibc 2.43 exceeds the required 2.39; Anchor 1.2.2 prebuilt binaries should run |

---

## 10. Acceptance criteria evidence

| Criterion | Status | Evidence |
|---|---|---|
| All installed versions documented | ✅ | §2 tables, with the exact commands and observed output |
| Missing dependencies identified | ✅ | §2.2 and §3 |
| Exact verification commands provided | ✅ | §7 |
| Compatible stable Anchor and TypeScript client versions identified | ✅ | `PROPOSED_DEPENDENCIES.md` |
| Agreed folder structure proposed | ✅ | `PROPOSED_PROJECT_STRUCTURE.md` |
| Local testing strategy proposed | ✅ | `TECHNICAL_PLAN.md` §3 |
| No application features implemented | ✅ | Only Markdown reports were written |

---

## 11. What was not verified

To avoid overstating the evidence:

- `anchor build`, `cargo build`, `anchor test`, and all application tests were **not run** because the toolchain is absent.
- No package was installed, upgraded, or removed.
- The Solana 4.1.2 release archive contents were not fully downloaded; the install endpoint returned HTTP 200 and `solana-test-validator` inclusion is documented by the official Solana/Anchor installation docs. The archive download timed out in this session.
- Devnet RPC availability and airdrop behaviour were not tested; there is no wallet or Solana CLI.
- Frontend and TypeScript package installation/builds were not run. Version compatibility was checked from npm registry metadata, not from an installed `node_modules`.
- The Anchor 1.2.2 prebuilt binary was not executed on this exact OS; glibc 2.43 is above the documented 2.39 minimum.

---

## 12. Changes requiring approval before Stage 1

1. Install the missing Linux packages listed in §8.1.
2. Install Rust 1.99.1 with rustup.
3. Install Solana CLI/Agave 4.1.2.
4. Install AVM and Anchor CLI 1.2.2.
5. Add the three PATH entries to the shell profile.
6. Confirm Node 26.13.0 is accepted (or switch to Node 24.22.2).
7. Confirm npm workspaces instead of pnpm, or approve installing pnpm 12.18.0.
8. Initialise a Git repository in the project directory.
9. Generate a local/devnet-only Solana keypair when Stage 1 begins.

No application feature work should start until these reports and the dependency choices are approved.
