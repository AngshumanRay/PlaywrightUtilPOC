import { useState } from "react";

const trackerData = [
  { id: 5, section: "Language", task: "", status: "Done", actualStatus: "Done", category: "Core Setup", notes: "PRIMARY: TypeScript — static typing catches bugs early, full Playwright IntelliSense in VS Code, interfaces enforce contracts between page objects and utilities. Playwright itself is written in TS — full type definitions bundled.\nSECONDARY: Python — used selectively for Excel/data processing (pandas/openpyxl), AWS utility scripts (boto3), AI/ML data generation (LangChain), and complex JSON transforms.\nPREREQUISITES: Node.js >= 18 LTS, TypeScript >= 5.x (npm i -D typescript tsx), VS Code + Playwright Test extension.\nPython: 3.11+ via pyenv + virtualenv per project." },
  { id: 6, section: "Environment / Config Setup", task: "", status: "Inprogress", actualStatus: "Done", category: "Core Setup", notes: "✅ IMPLEMENTED: config/environment.ts (250 lines) — strongly-typed EnvironmentConfig with 10 sections, validated with getRequired/getOptional helpers. playwright.config.ts (277 lines) — full config with testDir, workers, retries, timeout, browser projects, reporters, and use block.\nBoth files are production-ready and consumed by every utility in the framework.\n.env files per environment (.env.dev / .env.staging / .env.prod) — never committed to git. Variables: BASE_URL, API_ENDPOINT, TEST_USER, TEST_PASS, LOG_LEVEL, RUN_HEADLESS, RUN_PARALLEL, RUN_WORKERS, RUN_RETRIES." },
  { id: 7, section: "Utility Setup", task: "", status: "Ongoing", actualStatus: "Done", category: "Core Setup", notes: "✅ IMPLEMENTED: utils/index.ts — barrel file re-exporting all 8 utility domains.\nAll utility folders exist with fully implemented modules:\n  • helpers/ — logger, enhanced-logger, screenshot\n  • jira-xray/ — jira-auth, xray-state, xray-test-set, xray-test-execution, xray-result-updater\n  • database/ — db-connection, test-data-manager\n  • email/ — email-verifier\n  • api/ — api-helper\n  • excel/ — excel-reader, data-pool\n  • security/ — crypto-helper\n  • reporting/ — report-generator\nNew utilities can still be added, but the infrastructure is complete." },
  { id: 8, section: "", task: "Global hooks before start and after the executions", status: "Not started", actualStatus: "Done", category: "Framework Core", notes: "✅ IMPLEMENTED:\nglobal-setup.ts (262 lines): Connects to JIRA → fetches test cases from Test Set → creates Test Execution → saves XRAY state → seeds DB data (if configured). Includes utility status dashboard, placeholder detection, graceful skip logic.\nglobal-teardown.ts (212 lines): Reads XRAY state → summarizes results → uploads to XRAY → generates HTML report → cleans DB test data.\nxray-test-fixture.ts (251 lines): Custom fixture extending base test with xrayTestKey, auto screenshot on failure, performance metrics (FCP/LCP/load), axe-core a11y scan, auto XRAY result mapping.\nAll referenced in playwright.config.ts: globalSetup + globalTeardown." },
  { id: 9, section: "", task: "Excel to JSON Conversion — Global hooks", status: "Inprogress", actualStatus: "Done", category: "Data Layer", notes: "✅ IMPLEMENTED: utils/excel/excel-reader.ts (276 lines).\nFunctions: readExcelFile(), readExcelSheet(), getSheetNames(), excelToJson().\nHandles sheet selection, empty row filtering, value normalization, file-not-found errors.\nUses the xlsx library (installed: xlsx ^0.18.5). Fully typed with ExcelRow and ExcelReadOptions interfaces.\nIntegrates with data-pool.ts for test data management." },
  { id: 10, section: "", task: "DB Secure Connection", status: "Inprogress", actualStatus: "Partial", category: "Data Layer", notes: "⚠️ PARTIALLY IMPLEMENTED:\n✅ db-connection.ts (412 lines) — FULLY DONE. DatabaseConnection class supports PostgreSQL, MySQL, SQLite. SSL/TLS encryption, connection pooling, encrypted password decryption via crypto-helper. Dependencies installed: pg ^8.19.0, mysql2 ^3.18.2.\n⚠️ test-data-manager.ts (254 lines) — Structure complete but DB operations are PLACEHOLDER stubs (comments say 'PLUG YOUR DATABASE CLIENT HERE'). seedTestData(), queryTestData(), cleanupTestData() need real SQL calls.\nTO FINISH: Plug actual DB queries into test-data-manager.ts methods." },
  { id: 11, section: "", task: "JIRA XRAY Integration", status: "Inprogress", actualStatus: "Done", category: "Integrations", notes: "✅ FULLY IMPLEMENTED — 5 files, 1,347 lines total:\njira-auth.ts (241 lines): Axios client with Base64 Basic Auth, request/response interceptors.\nxray-test-set.ts (314 lines): fetchTestSetDetails() with parallel test case detail fetching.\nxray-test-execution.ts (300 lines): createTestExecution(), linkTestCases(). Creates JIRA tickets of type 'Test Execution'.\nxray-result-updater.ts (322 lines): updateTestRunStatus(), attachEvidence(). Uploads Base64 screenshots.\nxray-state.ts (170 lines): File-based shared state for parallel-safe result collection.\nFull lifecycle: auth → fetch test set → create execution → run tests → collect results → upload results + evidence." },
  { id: 12, section: "", task: "Execution Reports", status: "Not started", actualStatus: "Done", category: "Reporting", notes: "✅ FULLY IMPLEMENTED: utils/reporting/report-generator.ts (765 lines!).\nSelf-contained HTML report with:\n  • Summary cards (total, passed, failed, aborted, pass rate, duration, UI vs API counts)\n  • Chart.js charts (bar chart for durations, pie chart for pass/fail distribution)\n  • Full test results table with XRAY links, status badges, timestamps, error messages\n  • Performance metrics per test (page load, FCP, LCP, request count, transfer bytes)\n  • Accessibility violations with severity badges\n  • Step-by-step test logs with accordion UI\n  • Screenshot thumbnails with zoom modal\n  • Dark theme, responsive layout\nALSO: Playwright's built-in HTML reporter configured in playwright.config.ts." },
  { id: 13, section: "", task: "Handling Iframe", status: "Inprogress", actualStatus: "Not started", category: "Framework Core", notes: "❌ NOT STARTED — zero iframe code exists anywhere in the project.\nNo frameLocator() calls, no switchToIframe() methods, no iframe test scenarios.\nTO IMPLEMENT:\n  • Add handleIframe() to BasePage.ts using page.frameLocator()\n  • Support nested iframes via chained frameLocator calls\n  • Add frame({ url: pattern }) for dynamic src URLs\n  • Create iframe test scenario for validation" },
  { id: 14, section: "", task: "Data Pool — Excel Based Data Driven Scenarios", status: "Not started", actualStatus: "Done", category: "Data Layer", notes: "✅ IMPLEMENTED: utils/excel/data-pool.ts (325 lines).\nTestDataPool class with: loadFromExcel(), getAll(), getByFilter(), getRandom(), getByIndex(), getNext(), getByName(), reset(), addRow(), getSummary().\nAuto-creates sample Excel file with 4 example rows. Fully typed with TestDataRow interface.\nExported through barrel file (utils/index.ts). Integrates with excel-reader for file reading." },
  { id: 15, section: "", task: "Different Types of Execution — Local, Headless, Nodes", status: "Not started", actualStatus: "Done", category: "Execution", notes: "✅ IMPLEMENTED — 19 npm scripts in package.json:\n  • test / test:all — run all tests\n  • test:login / test:api — selective suite execution\n  • test:headed / test:headless — browser visibility\n  • test:debug — Playwright Inspector step-by-step\n  • test:ui — Playwright interactive UI mode\n  • test:chromium / test:firefox / test:webkit — browser-specific\n  • test:parallel / test:single — parallel with 4 workers vs serial\n  • test:env:staging / test:env:prod / test:env:dev — environment switching\n  • test:ci — CI mode with retries\n  • run:headless / run:headed — run + auto-open report\nplaywright.config.ts reads RUN_PARALLEL, RUN_WORKERS, RUN_RETRIES, RUN_HEADLESS from env vars." },
  { id: 16, section: "", task: "Global Waits", status: "Not started", actualStatus: "Partial", category: "Framework Core", notes: "⚠️ PARTIALLY IMPLEMENTED:\n✅ Config-level timeouts: timeout: 60000ms, expect.timeout: 10000ms, actionTimeout: 10000ms, navigationTimeout: 30000ms in playwright.config.ts.\n✅ BasePage.ts implements waitForElement() (configurable timeout) and waitForPageLoad() (domcontentloaded/load/networkidle). All page object methods use explicit waits.\n⚠️ MISSING: No standalone wait utility class. No custom polling wait, no waitForUrl(), no waitForNetworkIdle() as reusable helpers.\nTO FINISH: Extract common wait patterns into utils/helpers/wait-helper.ts if needed." },
  { id: 17, section: "", task: "Loggers", status: "Not started", actualStatus: "Done", category: "Observability", notes: "✅ FULLY IMPLEMENTED — two complete logger implementations:\nlogger.ts (164 lines): Console logger with ANSI color codes, timestamps, 8 log levels (info, warn, error, debug, pass, fail, step, section).\nenhanced-logger.ts (421 lines): Advanced logger with:\n  • Winston file output with daily rotation (winston + winston-daily-rotate-file)\n  • Structured log collection for HTML report\n  • Performance data collection (logPerformance)\n  • Accessibility data collection (logAccessibility)\n  • Timer API (startTimer/endTimer)\n  • Configurable via environment (LOG_LEVEL, LOG_TO_FILE, LOG_FILE_MAX_DAYS)\n  • getCollectedData() feeds the report generator\nUsed everywhere: global-setup, teardown, fixtures, page objects, utilities, tests." },
  { id: 18, section: "", task: "Password Encrypt/Decrypt", status: "Not started", actualStatus: "Done", category: "Security", notes: "✅ FULLY IMPLEMENTED: utils/security/crypto-helper.ts (298 lines).\nFunctions: encrypt/decrypt (AES-256 via crypto-js), encryptBatch/decryptBatch, hashPassword (SHA-256), ensureEncryptionKey (guard).\nIncludes interactive CLI tool: npm run encrypt-password.\nDependencies: crypto-js ^4.2.0, @types/crypto-js ^4.2.2.\nConsumed by db-connection.ts (decrypts DB password). Checked in global-setup utility dashboard.\nConfig reads ENCRYPTION_KEY from .env." },
  { id: 19, section: "", task: "Packaging", status: "Not started", actualStatus: "Not started", category: "Deployment", notes: "❌ NOT STARTED — genuinely not implemented.\nMISSING:\n  • No Dockerfile (need FROM mcr.microsoft.com/playwright:v1.58.2-jammy)\n  • No CI/CD pipeline (.github/workflows/, Jenkinsfile, .gitlab-ci.yml)\n  • No npm publish config (no private registry setup)\n  • No Makefile or build scripts beyond tsc --noEmit\nTO IMPLEMENT:\n  • Docker: Dockerfile + docker-compose.yml for consistent local + CI runs\n  • GitHub Actions: test on push/PR, artifact upload, report hosting\n  • npm package: publish shared fixtures/utilities to CodeArtifact or GitHub Packages" },
  { id: 20, section: "Page Object Model (POM)", task: "Base page + Login page implementation", status: "Done", actualStatus: "Done", category: "Framework Core", notes: "✅ IMPLEMENTED — missing from original tracker!\nBasePage.ts (369 lines): Abstract base class with navigateTo(), waitForElement(), waitForPageLoad(), click(), fill(), getText(), isVisible(), getTitle(), getCurrentUrl(), screenshot(). All methods include auto-waiting and enhanced logging.\nLoginPage.ts (266 lines): Extends BasePage. Methods: navigateToLoginPage(), login(), clickLoginButton(), verifySuccessfulLogin(), verifyLoginErrorMessage(). Full Page Object pattern with locator encapsulation." },
  { id: 21, section: "API Testing Utility", task: "REST API helper with typed responses", status: "Done", actualStatus: "Done", category: "Framework Core", notes: "✅ IMPLEMENTED — missing from original tracker!\nutils/api/api-helper.ts (232 lines): apiGet<T>(), apiPost<T>(), apiPut<T>(), apiDelete<T>() — generic typed functions returning standardized ApiResponse<T> wrapper with status, data, success flag, durationMs.\nUsed by tests/api.test.ts (3 API tests: GET/POST/GET with nested validation). Uses axios under the hood." },
  { id: 22, section: "Email Verification", task: "Test mailbox polling and verification", status: "Done", actualStatus: "Done", category: "Framework Core", notes: "✅ IMPLEMENTED — missing from original tracker!\nutils/email/email-verifier.ts (~220 lines): EmailVerifier class with pollForEmail() (configurable polling interval + timeout), verifyEmailContent(), getLatestEmail(). Ready to plug into real IMAP/SMTP or test mailbox API." },
  { id: 23, section: "Screenshot Capture", task: "Automatic failure screenshots", status: "Done", actualStatus: "Done", category: "Observability", notes: "✅ IMPLEMENTED — missing from original tracker!\nutils/helpers/screenshot.ts (~120 lines): captureFailureScreenshot(), captureScreenshot() with timestamped filenames.\nIntegrated into xray-test-fixture.ts — auto-captures on test failure.\nScreenshots appear in HTML report with zoom modal and in XRAY as Base64 evidence attachments." },
  { id: 24, section: "Accessibility Testing", task: "axe-core WCAG scanning after each test", status: "Done", actualStatus: "Done", category: "Observability", notes: "✅ IMPLEMENTED — missing from original tracker!\nIntegrated into xray-test-fixture.ts: runs AxeBuilder with WCAG 2.0/2.1 tags after every UI test.\nViolations collected by enhanced-logger.ts (logAccessibility) with id, impact, description, helpUrl, node count.\nDisplayed in HTML report with severity badges (critical/serious/moderate/minor).\nDependency: @axe-core/playwright ^4.11.1." },
  { id: 25, section: "Performance Metrics", task: "Page load, FCP, LCP tracking per test", status: "Done", actualStatus: "Done", category: "Observability", notes: "✅ IMPLEMENTED — missing from original tracker!\nCollected in xray-test-fixture.ts via page.evaluate() — Navigation Timing API + Paint Timing API.\nMetrics: pageLoadMs, fcpMs (First Contentful Paint), lcpMs (Largest Contentful Paint), requestCount, transferBytes.\nLogged by enhanced-logger.ts (logPerformance). Displayed per-test in HTML report." },
  { id: 26, section: "Working Test Suites", task: "6 tests — 3 UI (login) + 3 API", status: "Done", actualStatus: "Done", category: "Tests", notes: "✅ IMPLEMENTED — missing from original tracker!\ntests/login.test.ts: TC01 (valid login), TC02 (wrong password), TC03 (empty credentials). Uses LoginPage POM.\ntests/api.test.ts: TC04 (GET /posts/1), TC05 (POST /posts), TC06 (GET /users/1). Uses apiGet/apiPost helpers.\nAll 6 tests mapped to XRAY IDs (PROJ-101 through PROJ-106). All passing (37.4s)." },
];

const whyPlaywright = [
  { title: "Auto-Waiting", desc: "Every action waits for element to be attached, visible, stable, enabled automatically. Zero explicit waits. Eliminates #1 cause of flaky tests vs Selenium/TOSCA." },
  { title: "Cross-Browser", desc: "One TypeScript API covers Chromium (Chrome/Edge), Firefox, WebKit (Safari). Write once, run on all three. No browser-specific workarounds." },
  { title: "Network Interception", desc: "page.route() mocks any HTTP/HTTPS/WebSocket request. Test error handling without broken backends. Validate API payloads sent by the UI. Built in, no extra library." },
  { title: "Parallel + Sharding", desc: "Each test runs in its own isolated browser context. workers: 4 runs 4 tests simultaneously. Sharding splits suite across CI agents. 100 tests: 30min becomes 8min." },
  { title: "Trace Viewer", desc: "Failed tests auto-capture DOM snapshots, screenshots, network log, console at every step. npx playwright show-trace trace.zip — time-travel debugging without re-running." },
  { title: "TypeScript Native", desc: "Playwright is written in TS. Full types bundled. VS Code autocomplete for every API. Refactor a base class and TS instantly flags all broken references across 500 files." },
  { title: "vs Alternatives", desc: "vs Selenium: no WebDriver overhead, built-in auto-wait, 10x faster. vs Cypress: multi-tab, iframes, shadow DOM, file downloads supported. vs TOSCA: full code control, zero license cost, Git-versioned." },
];

const prerequisites = [
  { title: "Node.js >= 18 LTS", desc: "Install via nodejs.org or nvm. Verify: node -v, npm -v. Use nvm to switch versions per project." },
  { title: "TypeScript >= 5.x", desc: "npm install -D typescript tsx @types/node. tsconfig.json: strict:true, path aliases (@pages/*, @utils/*), target: ES2022." },
  { title: "Playwright Install", desc: "npm init playwright@latest (wizard) or: npm i -D @playwright/test and npx playwright install --with-deps (installs all browsers + OS deps)." },
  { title: "VS Code Setup", desc: "Extensions: Playwright Test for VSCode (official), ESLint, Prettier. Adds run/debug buttons per test and test explorer sidebar." },
  { title: "Git Strategy", desc: "Committed: playwright.config.ts, tsconfig.json, package.json, .env.example, all tests, page objects, fixtures. Never commit: .env, auth.json, test-results/, node_modules/." },
  { title: "AWS IAM Role", desc: "Dedicated test runner role. Permissions: secretsmanager:GetSecretValue, s3:PutObject (artifacts), cloudwatch:PutMetricData, logs:PutLogEvents. Least privilege — no Admin access." },
  { title: "Test Environment", desc: "Dedicated env (not dev/staging/prod). Stable baseline data, known feature flag state, SSO service accounts with MFA disabled for test accounts, VPC access for DB connections." },
];

const statusConfig = {
  "Done":        { bg: "#D1FAE5", text: "#065F46", dot: "#10B981" },
  "Inprogress":  { bg: "#DBEAFE", text: "#1E40AF", dot: "#3B82F6" },
  "Not started": { bg: "#F3F4F6", text: "#6B7280", dot: "#9CA3AF" },
  "Ongoing":     { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  "Partial":     { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
};

const FILTERS = ["All", "Inprogress", "Not started", "Done", "Ongoing"];

export default function PlaywrightFrameworkTracker() {
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [activeTab, setActiveTab] = useState("tracker");

  const filtered = filter === "All" ? trackerData : trackerData.filter(r => r.status === filter);

  const counts = {
    total:      trackerData.length,
    inprogress: trackerData.filter(r => r.status === "Inprogress").length,
    notStarted: trackerData.filter(r => r.status === "Not started").length,
    done:       trackerData.filter(r => r.status === "Done").length,
    ongoing:    trackerData.filter(r => r.status === "Ongoing").length,
  };
  const actualCounts = {
    done:       trackerData.filter(r => r.actualStatus === "Done").length,
    partial:    trackerData.filter(r => r.actualStatus === "Partial").length,
    notStarted: trackerData.filter(r => r.actualStatus === "Not started").length,
  };
  const pct = Math.round((actualCounts.done / counts.total) * 100) || 0;

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', 'Courier New', monospace", background: "#0F172A", minHeight: "100vh", color: "#E2E8F0" }}>
      <div style={{ background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)", borderBottom: "1px solid #334155", padding: "20px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444", boxShadow: "0 0 6px #EF4444" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B", boxShadow: "0 0 6px #F59E0B" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 6px #22C55E" }} />
        </div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.3px" }}>PLAYWRIGHT AUTOMATION FRAMEWORK</h1>
        <p style={{ margin: "4px 0 0", fontSize: 10, color: "#64748B", letterSpacing: "2px", textTransform: "uppercase" }}>Primary: TypeScript  ·  Secondary: Python  ·  Structure Tracker</p>
      </div>

      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #1E293B", background: "#0F172A", padding: "0 28px" }}>
        {[["tracker","📋 Tracker"], ["why","⚡ Why Playwright"], ["prereqs","🔧 Prerequisites"]].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{
            background: "none", border: "none", padding: "12px 18px", cursor: "pointer", fontSize: 11,
            color: activeTab === key ? "#38BDF8" : "#64748B",
            borderBottom: activeTab === key ? "2px solid #38BDF8" : "2px solid transparent",
            fontFamily: "inherit", fontWeight: activeTab === key ? 600 : 400, transition: "all 0.15s"
          }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: "20px 28px" }}>
        {activeTab === "tracker" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 12 }}>
              {[
                { label: "TOTAL ITEMS", value: counts.total, color: "#94A3B8", bg: "#1E293B" },
                { label: "ACTUALLY DONE", value: actualCounts.done, color: "#34D399", bg: "#064E3B" },
                { label: "PARTIAL", value: actualCounts.partial, color: "#FBBF24", bg: "#451A03" },
                { label: "NOT STARTED", value: actualCounts.notStarted, color: "#F87171", bg: "#450A0A" },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}44`, borderRadius: 8, padding: "12px 14px" }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: "#64748B", letterSpacing: "1.5px", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
              {[
                { label: "TRACKER: DONE", value: counts.done, color: "#34D399", bg: "#064E3B" },
                { label: "TRACKER: IN PROGRESS", value: counts.inprogress, color: "#60A5FA", bg: "#1E3A5F" },
                { label: "TRACKER: NOT STARTED", value: counts.notStarted, color: "#94A3B8", bg: "#1E293B" },
                { label: "TRACKER: ONGOING", value: counts.ongoing, color: "#FBBF24", bg: "#451A03" },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 8, padding: "8px 14px" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 8, color: "#475569", letterSpacing: "1.5px", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 9, color: "#64748B", letterSpacing: "1px" }}>ACTUAL COMPLETION (verified against codebase)</span>
                <span style={{ fontSize: 9, color: "#34D399", fontWeight: 600 }}>{pct}%</span>
              </div>
              <div style={{ height: 3, background: "#1E293B", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: pct + "%", background: "linear-gradient(90deg, #3B82F6, #34D399)", borderRadius: 2 }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {FILTERS.map(f => {
                const cfg = statusConfig[f] || {};
                return (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding: "4px 12px", borderRadius: 20, fontSize: 10, cursor: "pointer", fontFamily: "inherit",
                    border: filter === f ? "1px solid " + (cfg.dot || "#38BDF8") : "1px solid #334155",
                    background: filter === f ? (cfg.bg || "#1E3A5F") : "transparent",
                    color: filter === f ? (cfg.text || "#38BDF8") : "#64748B", transition: "all 0.15s"
                  }}>{f}</button>
                );
              })}
            </div>

            <div style={{ border: "1px solid #1E293B", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "32px 160px 1fr 100px 100px 100px 28px", background: "#1E293B", padding: "9px 14px", borderBottom: "1px solid #334155" }}>
                {["#","SECTION","TASK / FEATURE","TRACKER STATUS","ACTUAL STATUS","CATEGORY",""].map((h,i) => (
                  <div key={i} style={{ fontSize: 9, color: "#64748B", letterSpacing: "1.5px", fontWeight: 600 }}>{h}</div>
                ))}
              </div>

              {filtered.map((row, idx) => {
                const cfg = statusConfig[row.status] || statusConfig["Not started"];
                const actualCfg = statusConfig[row.actualStatus] || statusConfig["Not started"];
                const isExpanded = expanded === row.id;
                const isSection = !!row.section;
                const statusMatch = row.status === "Done" && row.actualStatus === "Done" ? true : row.status === "Not started" && row.actualStatus === "Not started" ? true : false;
                const rowBg = isSection ? "#1A2332" : idx % 2 === 0 ? "#0F172A" : "#111827";
                return (
                  <div key={row.id} style={{ borderBottom: "1px solid #1E293B" }}>
                    <div
                      onClick={() => row.notes && setExpanded(isExpanded ? null : row.id)}
                      style={{ display: "grid", gridTemplateColumns: "32px 160px 1fr 100px 100px 100px 28px", padding: "9px 14px", background: rowBg, cursor: row.notes ? "pointer" : "default" }}
                    >
                      <div style={{ fontSize: 10, color: "#475569", alignSelf: "center" }}>{row.id}</div>
                      <div style={{ fontSize: 11, color: isSection ? "#94A3B8" : "#64748B", fontWeight: isSection ? 600 : 400, alignSelf: "center" }}>{row.section}</div>
                      <div style={{ fontSize: 11, color: "#CBD5E1", alignSelf: "center", paddingRight: 12 }}>{row.task}</div>
                      <div style={{ alignSelf: "center" }}>
                        {row.status && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 10, background: cfg.bg, fontSize: 9, color: cfg.text, fontFamily: "inherit", textDecoration: !statusMatch ? "line-through" : "none", opacity: !statusMatch ? 0.6 : 1 }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
                            {row.status}
                          </span>
                        )}
                      </div>
                      <div style={{ alignSelf: "center" }}>
                        {row.actualStatus && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 10, background: actualCfg.bg, fontSize: 9, color: actualCfg.text, fontFamily: "inherit", fontWeight: 700, boxShadow: !statusMatch ? "0 0 6px " + actualCfg.dot + "66" : "none" }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: actualCfg.dot, display: "inline-block" }} />
                            {row.actualStatus}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 9, color: "#64748B", alignSelf: "center", fontStyle: "italic" }}>{row.category}</div>
                      <div style={{ fontSize: 12, color: "#475569", alignSelf: "center", textAlign: "center" }}>
                        {row.notes ? (isExpanded ? "▲" : "▼") : ""}
                      </div>
                    </div>
                    {isExpanded && row.notes && (
                      <div style={{ background: "#0D1525", borderTop: "1px solid #1E3A5F", padding: "12px 14px 12px 46px" }}>
                        {row.notes.split("\n").map((line, li) => {
                          const colonIdx = line.indexOf(":");
                          const isHeading = colonIdx > 0 && colonIdx < 30 && /^[A-Z]/.test(line);
                          return (
                            <div key={li} style={{ marginBottom: li < row.notes.split("\n").length - 1 ? 5 : 0 }}>
                              {isHeading ? (
                                <span>
                                  <span style={{ color: "#38BDF8", fontSize: 10, fontWeight: 700 }}>{line.slice(0, colonIdx + 1)}</span>
                                  <span style={{ color: "#94A3B8", fontSize: 10 }}>{line.slice(colonIdx + 1)}</span>
                                </span>
                              ) : (
                                <span style={{ color: "#94A3B8", fontSize: 10, lineHeight: 1.7 }}>{line}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === "why" && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 15, color: "#F1F5F9", fontWeight: 700 }}>Why Playwright Is The Best Choice</h2>
              <p style={{ margin: "4px 0 0", fontSize: 10, color: "#64748B" }}>8 reasons this framework is built on Playwright</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {whyPlaywright.map((item, i) => (
                <div key={i} style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 10, padding: "14px 16px", borderLeft: "3px solid #3B82F6" }}>
                  <div style={{ fontSize: 9, color: "#60A5FA", fontWeight: 700, letterSpacing: "1px", marginBottom: 6 }}>
                    {String(i + 1).padStart(2, "0")} · {item.title.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.7 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "prereqs" && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 15, color: "#F1F5F9", fontWeight: 700 }}>Prerequisites</h2>
              <p style={{ margin: "4px 0 0", fontSize: 10, color: "#64748B" }}>Everything you need before writing the first test</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {prerequisites.map((item, i) => (
                <div key={i} style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 10, padding: "12px 16px", display: "grid", gridTemplateColumns: "160px 1fr", gap: 14, alignItems: "start" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 5, background: "#064E3B", border: "1px solid #065F46", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 8, color: "#34D399", fontWeight: 700 }}>{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <span style={{ fontSize: 10, color: "#34D399", fontWeight: 600, lineHeight: 1.5 }}>{item.title}</span>
                  </div>
                  <div style={{ fontSize: 10, color: "#94A3B8", lineHeight: 1.7 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ borderTop: "1px solid #1E293B", padding: "12px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 9, color: "#334155", letterSpacing: "1px" }}>PLAYWRIGHT FRAMEWORK TRACKER · TYPESCRIPT FIRST</span>
        <span style={{ fontSize: 9, color: "#334155" }}>Click any row to expand notes ▼</span>
      </div>
    </div>
  );
}
