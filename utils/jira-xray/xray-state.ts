// =============================================================================
// utils/jira-xray/xray-state.ts — SHARED STATE STORE FOR XRAY INTEGRATION
// =============================================================================
// PURPOSE:
//   This file acts as a "memory" that stores XRAY data during the test run.
//   It holds the Test Execution ID and collects test results as tests finish.
//
// WHY DO WE NEED THIS?
//   Playwright runs tests across multiple files and processes. The global setup
//   creates the Test Execution (and gets an ID). Then each test (in possibly
//   different files) needs to save its result somewhere. After all tests finish,
//   the global teardown reads all results and sends them to XRAY.
//
//   This file is that "somewhere" — a shared store that all parts of the
//   test framework read from and write to.
//
// HOW THE DATA FLOWS:
//   [Global Setup] → Creates Test Execution → Saves executionKey here
//         ↓
//   [Each Test]    → Runs test → Saves result (PASS/FAIL) here
//         ↓
//   [Global Teardown] → Reads all results from here → Sends to XRAY
//
// NOTE ON FILE-BASED STATE:
//   Because Playwright can run tests in parallel (in separate Node.js processes),
//   we use a JSON file on disk as the shared state store. All processes can
//   read and write to the same file.
//
// ROBUSTNESS — FILE LOCKING:
//   When multiple Playwright workers (e.g., RUN_WORKERS=2 or more) run in
//   parallel, they can simultaneously read → modify → write the JSON file.
//   Without protection, this creates a classic TOCTOU race condition:
//     Worker A reads file → Worker B reads same file → Worker A writes →
//     Worker B writes → Worker A's data is LOST!
//
//   To prevent this, every write operation uses a file-lock (a ".lock" file
//   created with fs.openSync O_CREAT | O_EXCL — an atomic "create only if
//   it doesn't exist" operation). If the lock is held, the caller spins
//   with exponential backoff until the lock is released or a timeout expires.
//   Each operation also validates the JSON integrity after writing.
// =============================================================================

import * as fs   from 'fs';
import * as path from 'path';
import type { TestResultPayload } from './xray-result-updater';

// =============================================================================
// CONSTANTS
// =============================================================================

// The path where the shared state JSON file will be stored.
// "process.cwd()" returns the project root directory.
// We store it in a "test-results" folder which is ignored by Git.
const STATE_FILE_PATH = path.join(process.cwd(), 'test-results', 'xray-state.json');

// Lock file for cross-process synchronization
const LOCK_FILE_PATH  = STATE_FILE_PATH + '.lock';

// Lock acquisition settings
const LOCK_MAX_WAIT_MS    = 10_000;   // Maximum time to wait for the lock (10s)
const LOCK_SPIN_INTERVAL  = 50;       // How often to retry acquiring the lock (ms)
const LOCK_STALE_MS       = 15_000;   // If a lock is older than this, consider it stale and steal it

// =============================================================================
// PRIVATE: File-Lock Helpers (cross-process safe)
// =============================================================================

/**
 * Acquire an exclusive file lock using O_CREAT | O_EXCL (atomic create-if-absent).
 * Spins with increasing intervals until the lock is acquired or timeout reached.
 * Automatically cleans up stale locks from crashed workers.
 */
function acquireLock(): void {
  const deadline = Date.now() + LOCK_MAX_WAIT_MS;
  let sleepMs    = LOCK_SPIN_INTERVAL;

  while (Date.now() < deadline) {
    try {
      // O_CREAT | O_EXCL: fails if the file already exists → atomic "test & set"
      const fd = fs.openSync(LOCK_FILE_PATH, fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_WRONLY);
      // Write our PID + timestamp so stale locks can be detected
      fs.writeSync(fd, JSON.stringify({ pid: process.pid, ts: Date.now() }));
      fs.closeSync(fd);
      return; // Lock acquired!
    } catch {
      // Lock file already exists — someone else holds the lock.
      // Check if it's stale (from a crashed worker)
      try {
        const stat = fs.statSync(LOCK_FILE_PATH);
        if (Date.now() - stat.mtimeMs > LOCK_STALE_MS) {
          // Lock is stale — the owning process likely crashed. Steal it.
          console.warn(`⚠️  [XrayState] Removing stale lock (${Math.round((Date.now() - stat.mtimeMs) / 1000)}s old)`);
          try { fs.unlinkSync(LOCK_FILE_PATH); } catch { /* another process may have already removed it */ }
          continue; // Retry immediately
        }
      } catch { /* lock file may have been removed between exists-check and stat — retry */ }

      // Spin-wait with exponential backoff (capped at 200ms)
      const jitter = Math.random() * 10;
      sleepSync(Math.min(sleepMs + jitter, 200));
      sleepMs = Math.min(sleepMs * 1.5, 200);
    }
  }

  // If we reach here, we couldn't acquire the lock in time.
  // Force-remove the lock and proceed — better to risk a rare data race than
  // to fail the entire test run.
  console.warn(`⚠️  [XrayState] Lock acquisition timed out (${LOCK_MAX_WAIT_MS}ms). Force-proceeding.`);
  try { fs.unlinkSync(LOCK_FILE_PATH); } catch { /* ignore */ }
}

/**
 * Release the file lock by deleting the lock file.
 */
function releaseLock(): void {
  try { fs.unlinkSync(LOCK_FILE_PATH); } catch { /* already released */ }
}

/**
 * Synchronous sleep (blocks the event loop — intentional for lock spinning).
 * Uses Atomics.wait on a SharedArrayBuffer for precise, CPU-friendly sleeping.
 */
function sleepSync(ms: number): void {
  const sab = new SharedArrayBuffer(4);
  const int32 = new Int32Array(sab);
  Atomics.wait(int32, 0, 0, Math.max(1, Math.round(ms)));
}

/**
 * Execute a callback while holding the file lock.
 * Guarantees the lock is released even if the callback throws.
 */
function withLock<T>(fn: () => T): T {
  acquireLock();
  try {
    return fn();
  } finally {
    releaseLock();
  }
}

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * The shape of the shared state object stored in the JSON file.
 */
export interface XrayState {
  // The Test Execution key created by global setup (e.g., "PROJ-789")
  // Will be empty string "" until setup creates the execution.
  executionKey: string;

  // The sprint number this run belongs to
  sprintNumber: string;

  // All test results collected so far (grows as tests complete)
  results: TestResultPayload[];

  // Timestamp when the test run started
  runStartedAt: string;

  // Performance data per test (collected in worker, read in teardown)
  perfData: Array<{
    testName: string;
    durationMs?: number;
    pageLoadMs?: number;
    fcpMs?: number;
    lcpMs?: number;
    requestCount?: number;
    transferBytes?: number;
  }>;

  // Accessibility violations per test (collected in worker, read in teardown)
  a11yData: Record<string, Array<{
    id: string;
    impact: string;
    description: string;
    helpUrl: string;
    nodes: number;
  }>>;

  // Structured log entries (collected in worker, read in teardown)
  logEntries: Array<{
    timestamp: string;
    level: string;
    message: string;
    testName?: string;
  }>;
}

// =============================================================================
// FUNCTION: initializeXrayState
// =============================================================================
// PURPOSE:
//   Called by global setup to initialize the state file with execution details.
//   Clears any previous state and sets up fresh tracking for this test run.
//
// PARAMETERS:
//   - executionKey: The newly created Test Execution key
//   - sprintNumber: The sprint number for this run
// =============================================================================
export function initializeXrayState(executionKey: string, sprintNumber: string): void {
  console.log(`\n💾 [XrayState] Initializing state file for execution: ${executionKey}`);

  // Create the directory if it doesn't exist
  const stateDir = path.dirname(STATE_FILE_PATH);
  if (!fs.existsSync(stateDir)) {
    fs.mkdirSync(stateDir, { recursive: true });
  }

  // Write fresh initial state
  const initialState: XrayState = {
    executionKey,
    sprintNumber,
    results: [],
    runStartedAt: new Date().toISOString(),
    perfData: [],
    a11yData: {},
    logEntries: [],
  };

  fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(initialState, null, 2), 'utf8');
  console.log(`✅ [XrayState] State file created at: ${STATE_FILE_PATH}`);
}

// =============================================================================
// FUNCTION: readXrayState
// =============================================================================
// PURPOSE:
//   Reads the current state from the JSON file.
//   Returns null if the state file doesn't exist yet.
//
// ROBUSTNESS:
//   Retries up to 3 times on parse errors (another worker may be mid-write).
//   Each retry waits a short random interval to let the writer finish.
// =============================================================================
export function readXrayState(): XrayState | null {
  if (!fs.existsSync(STATE_FILE_PATH)) {
    console.warn(`⚠️  [XrayState] State file not found. Did global setup run?`);
    return null;
  }

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const raw = fs.readFileSync(STATE_FILE_PATH, 'utf8');
      const parsed = JSON.parse(raw) as XrayState;
      // Validate essential structure
      if (!parsed || typeof parsed.executionKey !== 'string') {
        throw new Error('Invalid state structure — missing executionKey');
      }
      // Ensure arrays/objects exist (defensive against partial writes)
      parsed.results    = parsed.results    ?? [];
      parsed.perfData   = parsed.perfData   ?? [];
      parsed.a11yData   = parsed.a11yData   ?? {};
      parsed.logEntries = parsed.logEntries  ?? [];
      return parsed;
    } catch (error) {
      if (attempt < maxRetries) {
        // Another worker may be mid-write — wait a bit and retry
        sleepSync(50 + Math.random() * 50);
        continue;
      }
      console.error(`❌ [XrayState] Failed to read state file after ${maxRetries} attempts:`, error);
      return null;
    }
  }
  return null;
}

// =============================================================================
// FUNCTION: appendTestResult
// =============================================================================
// PURPOSE:
//   Adds a single test result to the shared state file.
//   Called after each test completes (in the test's afterEach hook).
//
// ROBUSTNESS:
//   Uses file lock to prevent race conditions when multiple workers
//   write simultaneously. Validates the write by re-reading the file.
//
// PARAMETERS:
//   - result: The test result data to save
// =============================================================================
export function appendTestResult(result: TestResultPayload): void {
  withLock(() => {
    const state = readXrayState();

    if (!state) {
      console.warn(`⚠️  [XrayState] Cannot append result — state not initialized.`);
      return;
    }

    // De-duplicate: if this test key already has a result, replace it (re-runs/retries)
    const existingIdx = state.results.findIndex(r => r.testCaseKey === result.testCaseKey);
    if (existingIdx >= 0) {
      state.results[existingIdx] = result;
    } else {
      state.results.push(result);
    }

    // Write back to disk atomically (write to temp, then rename)
    writeStateAtomic(state);

    const statusEmoji = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${statusEmoji} [XrayState] Saved result: ${result.testCaseKey} → ${result.status}`);
  });
}

// =============================================================================
// FUNCTION: clearXrayState
// =============================================================================
// PURPOSE:
//   Deletes the state file and lock file after the test run is complete.
//   Called at the very end of global teardown after all results are uploaded.
// =============================================================================
export function clearXrayState(): void {
  if (fs.existsSync(STATE_FILE_PATH)) {
    fs.unlinkSync(STATE_FILE_PATH);
    console.log(`🧹 [XrayState] State file cleared.`);
  }
  // Clean up lock file if it somehow persists
  try { fs.unlinkSync(LOCK_FILE_PATH); } catch { /* ignore */ }
}

// =============================================================================
// FUNCTION: appendPerfData
// =============================================================================
// PURPOSE:
//   Appends performance metrics for a single test to the shared state file.
//   Uses file lock to prevent race conditions with parallel workers.
// =============================================================================
export function appendPerfData(entry: XrayState['perfData'][0]): void {
  withLock(() => {
    const state = readXrayState();
    if (!state) return;
    if (!state.perfData) state.perfData = [];

    // De-duplicate: replace if already exists for this test
    const existingIdx = state.perfData.findIndex(p => p.testName === entry.testName);
    if (existingIdx >= 0) {
      state.perfData[existingIdx] = entry;
    } else {
      state.perfData.push(entry);
    }

    writeStateAtomic(state);
  });
}

// =============================================================================
// FUNCTION: appendA11yData
// =============================================================================
// PURPOSE:
//   Appends accessibility scan results for a single test to the shared state.
//   Uses file lock to prevent race conditions with parallel workers.
// =============================================================================
export function appendA11yData(testKey: string, violations: XrayState['a11yData'][string]): void {
  withLock(() => {
    const state = readXrayState();
    if (!state) return;
    if (!state.a11yData) state.a11yData = {};
    state.a11yData[testKey] = violations;
    writeStateAtomic(state);
  });
}

// =============================================================================
// FUNCTION: appendLogEntries
// =============================================================================
// PURPOSE:
//   Appends structured log entries for a test to the shared state file.
//   Uses file lock to prevent race conditions with parallel workers.
// =============================================================================
export function appendLogEntries(entries: XrayState['logEntries']): void {
  withLock(() => {
    const state = readXrayState();
    if (!state) return;
    if (!state.logEntries) state.logEntries = [];
    state.logEntries.push(...entries);
    writeStateAtomic(state);
  });
}

// =============================================================================
// PRIVATE: writeStateAtomic
// =============================================================================
// PURPOSE:
//   Writes state to disk using an atomic write-then-rename pattern.
//   This prevents partial/corrupt reads: the file is either fully the old
//   content or fully the new content — never half-written.
//
// HOW IT WORKS:
//   1. Serialize state to JSON
//   2. Write to a temporary file (STATE_FILE_PATH + '.tmp')
//   3. Rename temp → state file (atomic on POSIX systems)
//   4. Verify the write by re-reading and parsing
// =============================================================================
function writeStateAtomic(state: XrayState): void {
  const tmpPath = STATE_FILE_PATH + '.tmp';
  const json = JSON.stringify(state, null, 2);

  fs.writeFileSync(tmpPath, json, 'utf8');
  fs.renameSync(tmpPath, STATE_FILE_PATH);

  // Verify write integrity (belt and suspenders)
  try {
    const verify = fs.readFileSync(STATE_FILE_PATH, 'utf8');
    JSON.parse(verify); // throws if corrupt
  } catch (err) {
    console.error(`❌ [XrayState] Write verification failed! Retrying direct write...`, err);
    // Fallback: direct write
    fs.writeFileSync(STATE_FILE_PATH, json, 'utf8');
  }
}
