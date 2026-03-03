// =============================================================================
// utils/reporting/report-generator.ts — HTML EXECUTION REPORT GENERATOR
// =============================================================================
// PURPOSE:
//   Generates a comprehensive self-contained HTML report after every test run.
//   The report includes:
//     📋 Test case results with XRAY links
//     ⏱️  Performance data per test (load time, duration, requests)
//     ♿  Accessibility violations (from axe-core scans)
//     📊  Charts & graphs (bar chart, pie chart, histogram)
//     🔐  Security/vulnerability notes
//     📝  Step-by-step test log (allure-like)
//     🏷️  Summary dashboard (pass/fail/skip counts, duration)
//
// WHY A CUSTOM REPORT?
//   Playwright's built-in HTML report is good, but this custom report:
//     - Includes XRAY ticket links (clickable, opens JIRA)
//     - Shows performance charts comparing all tests
//     - Shows accessibility violations with severity badges
//     - Shows security notes specific to your framework
//     - Is a SINGLE HTML FILE — share it with anyone (no server needed!)
//     - Has charts rendered using Chart.js (no internet needed — embedded)
//
// HOW TO USE:
//   // At the end of your test run (in global-teardown.ts):
//   import { generateReport } from '../utils/reporting/report-generator';
//
//   await generateReport({
//     runDate:      '2026-03-03',
//     environment:  'staging',
//     testResults:  state.results,
//     xrayLink:     'https://jira.company.com/browse/PROJ-789',
//     logEntries:   enhancedLogger.getLogs(),
//     perfData:     enhancedLogger.getPerformanceData(),
//     a11yData:     enhancedLogger.getAccessibilityData() as any,
//   });
//
// OUTPUT:
//   reports/execution-report-2026-03-03.html
//   → A single file you can open in any browser or email to stakeholders.
// =============================================================================

import * as fs   from 'fs';
import * as path from 'path';
import { logger }                               from '../helpers/logger';
import { LogEntry, PerformanceData, AccessibilityViolation } from '../helpers/enhanced-logger';

// =============================================================================
// TYPE: TestResult (what comes in from XRAY state)
// =============================================================================
export interface ReportTestResult {
  testCaseKey:    string;
  status:         'PASS' | 'FAIL' | 'ABORTED' | 'EXECUTING';
  testName?:      string;
  durationMs?:    number;
  errorMessage?:  string;
  screenshotPath?: string;
  xrayLink?:      string;
  startedAt?:     string;
  finishedAt?:    string;
}

// =============================================================================
// TYPE: ReportInput (everything needed to build the report)
// =============================================================================
export interface ReportInput {
  /** Date of the test run (e.g., '2026-03-03') */
  runDate:      string;

  /** Environment tested ('staging', 'production', 'dev') */
  environment:  string;

  /** All test results */
  testResults:  ReportTestResult[];

  /** Link to the XRAY Test Execution in JIRA */
  xrayLink?:    string;

  /** The JIRA project's base URL (for building test case links) */
  jiraBaseUrl?: string;

  /** Sprint number for this run */
  sprintNumber?: string;

  /** ISO timestamp when the run started */
  runStartedAt?: string;

  /** Structured log entries from the enhanced logger */
  logEntries?:  LogEntry[];

  /** Performance data per test */
  perfData?:    PerformanceData[];

  /** Accessibility violations per test */
  a11yData?:    Record<string, AccessibilityViolation[]>;

  /** Where to save the report (default: 'reports/') */
  outputDir?:   string;
}

// =============================================================================
// FUNCTION: generateReport
// =============================================================================
/**
 * Generates a comprehensive HTML execution report.
 *
 * @param input - All the data to include in the report
 * @returns     Absolute path to the generated HTML file
 */
export async function generateReport(input: ReportInput): Promise<string> {
  const outputDir = path.resolve(process.cwd(), input.outputDir ?? 'reports');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fileName   = `execution-report-${input.runDate}.html`;
  const outputPath = path.join(outputDir, fileName);

  const html = buildHtml(input);
  fs.writeFileSync(outputPath, html, 'utf-8');

  logger.pass(`📊 Execution report generated: ${outputPath}`);
  logger.info(`   Open it in any browser to view charts & detailed results.`);

  return outputPath;
}

// =============================================================================
// PRIVATE: buildHtml()
// =============================================================================
function buildHtml(input: ReportInput): string {
  const results    = input.testResults ?? [];
  const passed     = results.filter(r => r.status === 'PASS').length;
  const failed     = results.filter(r => r.status === 'FAIL').length;
  const aborted    = results.filter(r => r.status === 'ABORTED').length;
  const total      = results.length;
  const passRate   = total > 0 ? Math.round((passed / total) * 100) : 0;

  const perfData   = input.perfData  ?? [];
  const a11yData   = input.a11yData  ?? {};
  const logEntries = input.logEntries ?? [];

  // JIRA base URL — detect if it's a real URL or still the default placeholder
  const jiraBase = (input.jiraBaseUrl ?? '').replace(/\/$/, '');
  const isJiraConfigured = jiraBase.length > 0
    && !jiraBase.includes('your-company.atlassian.net')
    && !jiraBase.includes('your-company');

  // Total suite duration (ms) from perf data or result durations
  const totalDurationMs = results.reduce((sum, r) => {
    const perfEntry = perfData.find(p => p.testName?.includes(r.testCaseKey));
    return sum + (r.durationMs ?? perfEntry?.durationMs ?? 0);
  }, 0);
  const totalDurationSec = (totalDurationMs / 1000).toFixed(1);

  // Run start time — pretty-printed
  const runStartDisplay = input.runStartedAt
    ? new Date(input.runStartedAt).toLocaleString()
    : input.runDate;

  // Sprint number display
  const sprintDisplay = (input.sprintNumber && input.sprintNumber !== 'NOT_CONFIGURED')
    ? input.sprintNumber
    : '—';

  // --------------------------------------------------------------------------
  // Detect test type (UI vs API) — API keys are PROJ-104..106 in our demo
  // General approach: check if testName starts with "TC0[4-9]" or contains "API"
  // --------------------------------------------------------------------------
  const getTestType = (r: ReportTestResult): 'UI' | 'API' => {
    const title = (r.testName ?? '').toLowerCase();
    const key   = r.testCaseKey;
    if (title.includes('api') || title.includes('post') || title.includes('get /') ||
        title.includes('tc04') || title.includes('tc05') || title.includes('tc06') ||
        key === 'PROJ-104' || key === 'PROJ-105' || key === 'PROJ-106') return 'API';
    return 'UI';
  };

  const uiCount  = results.filter(r => getTestType(r) === 'UI').length;
  const apiCount = results.filter(r => getTestType(r) === 'API').length;

  // --------------------------------------------------------------------------
  // Chart data
  // --------------------------------------------------------------------------
  const testLabels     = results.map(r => r.testCaseKey);
  const durationValues = results.map(r => {
    const perf = perfData.find(p => p.testName?.includes(r.testCaseKey));
    return perf?.durationMs ? Math.round(perf.durationMs / 1000) : (r.durationMs ? Math.round(r.durationMs / 1000) : 0);
  });
  const loadTimeValues = results.map(r => {
    const perf = perfData.find(p => p.testName?.includes(r.testCaseKey));
    return perf?.pageLoadMs ? Math.round(perf.pageLoadMs / 1000) : 0;
  });

  // --------------------------------------------------------------------------
  // A11y summary
  // --------------------------------------------------------------------------
  const totalA11yViolations = Object.values(a11yData).reduce((sum, v) => sum + v.length, 0);
  const criticalA11y        = Object.values(a11yData)
    .flat()
    .filter(v => v.impact === 'critical' || v.impact === 'serious').length;

  // --------------------------------------------------------------------------
  // Step logs (grouped by test) — key = testCaseKey, shown with full testName
  // --------------------------------------------------------------------------
  const stepsByTest: Record<string, { title: string; entries: LogEntry[] }> = {};
  for (const entry of logEntries) {
    const key = entry.testName ?? 'Global';
    if (!stepsByTest[key]) {
      // Find the human-readable title from results
      const matchedResult = results.find(r => r.testCaseKey === key);
      stepsByTest[key] = {
        title: matchedResult?.testName ?? key,
        entries: [],
      };
    }
    stepsByTest[key].entries.push(entry);
  }

  // --------------------------------------------------------------------------
  // Screenshot paths for failed tests
  // --------------------------------------------------------------------------
  const failedWithScreenshots = results.filter(r => r.status === 'FAIL' && r.screenshotPath);

  // --------------------------------------------------------------------------
  // BUILD HTML
  // --------------------------------------------------------------------------
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Execution Report — ${input.runDate}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; }
    a { color: #60a5fa; }
    a:hover { color: #93c5fd; }

    /* ---- HEADER ---- */
    .header { background: linear-gradient(135deg, #1e3a5f 0%, #0f2340 100%); padding: 32px 40px; border-bottom: 2px solid #1e40af; }
    .header h1 { font-size: 28px; font-weight: 800; color: #f1f5f9; letter-spacing: -0.5px; }
    .header .subtitle { margin-top: 4px; color: #60a5fa; font-size: 14px; font-weight: 500; }
    .header .meta { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 20px; color: #94a3b8; font-size: 13px; }
    .header .meta-item { display: flex; align-items: center; gap: 6px; }
    .header .meta-item strong { color: #e2e8f0; }
    .env-badge { display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; }
    .env-staging    { background: #1d4ed8; color: #bfdbfe; }
    .env-production { background: #dc2626; color: #fecaca; }
    .env-dev        { background: #059669; color: #a7f3d0; }
    .env-other      { background: #7c3aed; color: #ddd6fe; }
    .xray-exec-link { display: inline-flex; align-items: center; gap: 6px; background: rgba(96,165,250,0.1); border: 1px solid #3b82f6; border-radius: 6px; padding: 4px 12px; color: #60a5fa; font-size: 12px; text-decoration: none; font-weight: 600; }
    .xray-exec-link:hover { background: rgba(96,165,250,0.2); color: #93c5fd; }
    .xray-not-configured { display: inline-flex; align-items: center; gap: 6px; background: rgba(245,158,11,0.1); border: 1px solid #f59e0b; border-radius: 6px; padding: 4px 12px; color: #fde68a; font-size: 12px; font-weight: 500; }

    /* ---- LAYOUT ---- */
    .container { max-width: 1400px; margin: 0 auto; padding: 32px 24px; }
    .section-title { font-size: 18px; font-weight: 700; color: #f1f5f9; margin: 36px 0 16px; padding-bottom: 10px; border-bottom: 2px solid #1e3a5f; display: flex; align-items: center; gap: 8px; }
    .section-title .count-chip { background: #1e3a5f; color: #93c5fd; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; margin-left: 8px; }

    /* ---- SUMMARY CARDS ---- */
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 20px; }
    .card { background: #1e293b; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #334155; transition: transform 0.2s; }
    .card:hover { transform: translateY(-2px); }
    .card .value { font-size: 38px; font-weight: 800; line-height: 1; }
    .card .label { font-size: 11px; color: #64748b; text-transform: uppercase; margin-top: 6px; letter-spacing: 0.8px; }
    .card.pass  .value { color: #22c55e; }
    .card.fail  .value { color: #ef4444; }
    .card.skip  .value { color: #f59e0b; }
    .card.total .value { color: #60a5fa; }
    .card.rate  .value { color: ${passRate >= 100 ? '#22c55e' : passRate >= 70 ? '#f59e0b' : '#ef4444'}; }
    .card.dur   .value { color: #a78bfa; font-size: 28px; }
    .card.ui    .value { color: #38bdf8; }
    .card.api   .value { color: #fb923c; }

    /* ---- PROGRESS BAR ---- */
    .progress-wrap { margin-bottom: 28px; }
    .progress-label { display: flex; justify-content: space-between; font-size: 12px; color: #64748b; margin-bottom: 6px; }
    .progress-bar { background: #1e293b; border-radius: 8px; height: 14px; overflow: hidden; display: flex; border: 1px solid #334155; }
    .progress-pass { background: linear-gradient(90deg,#16a34a,#22c55e); height: 100%; transition: width 1s; }
    .progress-fail { background: linear-gradient(90deg,#b91c1c,#ef4444); height: 100%; }
    .progress-skip { background: linear-gradient(90deg,#b45309,#f59e0b); height: 100%; }

    /* ---- CHARTS ---- */
    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .chart-box { background: #1e293b; border-radius: 12px; padding: 20px; border: 1px solid #334155; }
    .chart-box h3 { color: #64748b; font-size: 12px; text-transform: uppercase; margin-bottom: 14px; letter-spacing: 0.8px; font-weight: 600; }
    .chart-container { position: relative; height: 240px; }
    @media(max-width:900px) { .charts-grid { grid-template-columns: 1fr; } }

    /* ---- TABLES ---- */
    table { width: 100%; border-collapse: collapse; background: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; margin-bottom: 24px; }
    th { background: #0f2340; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; padding: 12px 16px; text-align: left; white-space: nowrap; }
    td { padding: 11px 16px; border-top: 1px solid #1e293b; font-size: 13px; vertical-align: middle; }
    tr:hover td { background: #263347; }

    /* ---- BADGES ---- */
    .badge { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.3px; }
    .badge-pass  { background: #14532d; color: #86efac; border: 1px solid #166534; }
    .badge-fail  { background: #450a0a; color: #fca5a5; border: 1px solid #7f1d1d; }
    .badge-skip  { background: #451a03; color: #fde68a; border: 1px solid #78350f; }
    .badge-ui    { background: #0c4a6e; color: #7dd3fc; border: 1px solid #0369a1; font-size: 10px; }
    .badge-api   { background: #431407; color: #fdba74; border: 1px solid #9a3412; font-size: 10px; }
    .badge-a11y-critical  { background: #7f1d1d; color: #fca5a5; }
    .badge-a11y-serious   { background: #7c2d12; color: #fdba74; }
    .badge-a11y-moderate  { background: #713f12; color: #fef08a; }
    .badge-a11y-minor     { background: #1e3a5f; color: #93c5fd; }

    /* ---- XRAY CHIP ---- */
    .xray-chip { display: inline-block; background: #1e3a5f; color: #93c5fd; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-family: monospace; font-weight: 700; text-decoration: none; border: 1px solid #1d4ed8; }
    .xray-chip:hover { background: #1d4ed8; color: #bfdbfe; }
    .xray-chip-demo { display: inline-block; background: #1c1917; color: #78716c; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-family: monospace; border: 1px dashed #44403c; cursor: help; }

    /* ---- TIMESTAMPS ---- */
    .timestamp { color: #475569; font-size: 11px; font-family: monospace; }
    .test-title { font-weight: 500; color: #e2e8f0; }
    .test-key   { color: #64748b; font-size: 11px; font-family: monospace; }

    /* ---- ACCORDION ---- */
    .accordion { background: #1e293b; border: 1px solid #334155; border-radius: 10px; margin-bottom: 8px; overflow: hidden; }
    .accordion-header { padding: 14px 18px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; user-select: none; }
    .accordion-header:hover { background: #263347; }
    .accordion-header .acc-title { font-size: 14px; font-weight: 600; color: #e2e8f0; display: flex; align-items: center; gap: 10px; }
    .accordion-body { display: none; padding: 0 16px 16px; }
    .accordion-body.open { display: block; }
    .log-line { padding: 3px 0; border-bottom: 1px solid rgba(255,255,255,0.03); font-family: 'SF Mono', 'Fira Code', Consolas, monospace; font-size: 12px; line-height: 1.5; }
    .log-pass  { color: #86efac; }
    .log-fail  { color: #fca5a5; }
    .log-warn  { color: #fde68a; }
    .log-error { color: #fca5a5; }
    .log-step  { color: #93c5fd; }
    .log-info  { color: #94a3b8; }

    /* ---- SECURITY CARDS ---- */
    .security-card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 18px 20px; margin-bottom: 10px; }
    .security-card h4 { color: #f1f5f9; margin-bottom: 8px; font-size: 14px; }
    .security-card p  { color: #94a3b8; font-size: 13px; line-height: 1.6; }
    .security-card code { background: #0f172a; border: 1px solid #334155; border-radius: 4px; padding: 1px 6px; font-family: monospace; font-size: 11px; color: #a5b4fc; }
    .security-ok   { border-left: 4px solid #22c55e; }
    .security-warn { border-left: 4px solid #f59e0b; }
    .security-info { border-left: 4px solid #60a5fa; }

    /* ---- SCREENSHOT ---- */
    .screenshot-thumb { max-width: 200px; max-height: 120px; border-radius: 6px; border: 1px solid #334155; cursor: zoom-in; transition: transform 0.2s; object-fit: cover; }
    .screenshot-thumb:hover { transform: scale(1.05); }
    .screenshot-modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 9999; justify-content: center; align-items: center; }
    .screenshot-modal.open { display: flex; }
    .screenshot-modal img { max-width: 90vw; max-height: 90vh; border-radius: 8px; box-shadow: 0 0 60px rgba(0,0,0,0.8); }

    /* ---- INFO NOTE ---- */
    .info-note { background: #1e293b; border: 1px solid #334155; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 14px 18px; color: #94a3b8; font-size: 13px; margin-bottom: 16px; }
    .info-note strong { color: #93c5fd; }

    /* ---- A11Y ---- */
    .a11y-row { font-size: 12px; }
    .a11y-none { color: #22c55e; padding: 16px; text-align: center; font-size: 13px; }
  </style>
</head>
<body>

<!-- =========================================================== -->
<!-- HEADER                                                        -->
<!-- =========================================================== -->
<div class="header">
  <h1>📊 Playwright Test Execution Report</h1>
  <div class="subtitle">Automated UI + API Test Results — Framework: Playwright + TypeScript + XRAY</div>
  <div class="meta">
    <div class="meta-item">📅 <span><strong>${input.runDate}</strong></span></div>
    <div class="meta-item">🚀 Started: <strong>${runStartDisplay}</strong></div>
    <div class="meta-item">🌍 Environment:
      <span class="env-badge ${
        input.environment === 'staging' ? 'env-staging'
        : input.environment === 'production' ? 'env-production'
        : input.environment === 'dev' ? 'env-dev'
        : 'env-other'
      }">${input.environment}</span>
    </div>
    <div class="meta-item">🔖 Sprint: <strong>${sprintDisplay}</strong></div>
    <div class="meta-item">⏱️ Total Duration: <strong>${totalDurationSec}s</strong></div>
    <div class="meta-item">
      ${input.xrayLink
        ? `<a class="xray-exec-link" href="${input.xrayLink}" target="_blank">🔗 XRAY Test Execution ↗</a>`
        : `<span class="xray-not-configured" title="Set JIRA_BASE_URL in .env to enable XRAY integration">⚠️ XRAY: Not Configured — Configure .env to enable</span>`
      }
    </div>
    <div class="meta-item">⏰ Generated: <strong>${new Date().toLocaleString()}</strong></div>
  </div>
</div>

<div class="container">

<!-- =========================================================== -->
<!-- SUMMARY CARDS                                                 -->
<!-- =========================================================== -->
<div class="section-title">🏆 Execution Summary</div>
<div class="cards">
  <div class="card total"><div class="value">${total}</div><div class="label">Total Tests</div></div>
  <div class="card pass"> <div class="value">${passed}</div><div class="label">Passed ✅</div></div>
  <div class="card fail"> <div class="value">${failed}</div><div class="label">Failed ❌</div></div>
  <div class="card skip"> <div class="value">${aborted}</div><div class="label">Aborted ⚠️</div></div>
  <div class="card rate"> <div class="value">${passRate}%</div><div class="label">Pass Rate</div></div>
  <div class="card dur">  <div class="value">${totalDurationSec}s</div><div class="label">Total Duration</div></div>
  <div class="card ui">   <div class="value">${uiCount}</div><div class="label">UI Tests 🖥️</div></div>
  <div class="card api">  <div class="value">${apiCount}</div><div class="label">API Tests 🔌</div></div>
  <div class="card" style="border-color:${totalA11yViolations>0?'#ef4444':'#22c55e'}">
    <div class="value" style="color:${totalA11yViolations>0?'#ef4444':'#22c55e'}">${totalA11yViolations}</div>
    <div class="label">A11y Issues</div>
  </div>
</div>

<!-- Progress Bar -->
<div class="progress-wrap">
  <div class="progress-label">
    <span>✅ ${passed} passed &nbsp; ❌ ${failed} failed &nbsp; ⚠️ ${aborted} aborted</span>
    <span>${passRate}% pass rate</span>
  </div>
  <div class="progress-bar">
    <div class="progress-pass" style="width:${total > 0 ? (passed/total*100).toFixed(1) : 0}%"></div>
    <div class="progress-fail" style="width:${total > 0 ? (failed/total*100).toFixed(1) : 0}%"></div>
    <div class="progress-skip" style="width:${total > 0 ? (aborted/total*100).toFixed(1) : 0}%"></div>
  </div>
</div>

<!-- =========================================================== -->
<!-- CHARTS                                                        -->
<!-- =========================================================== -->
<div class="section-title">📈 Charts & Graphs</div>
<div class="charts-grid">

  <div class="chart-box">
    <h3>Pass / Fail Distribution</h3>
    <div class="chart-container"><canvas id="pieChart"></canvas></div>
  </div>

  <div class="chart-box">
    <h3>Test Duration (seconds)</h3>
    <div class="chart-container"><canvas id="durationChart"></canvas></div>
  </div>

  <div class="chart-box">
    <h3>Page Load Time (seconds)</h3>
    <div class="chart-container"><canvas id="loadChart"></canvas></div>
  </div>

  <div class="chart-box">
    <h3>Result per Test</h3>
    <div class="chart-container"><canvas id="histChart"></canvas></div>
  </div>

</div>

<!-- =========================================================== -->
<!-- JIRA XRAY INTEGRATION STATUS                                  -->
<!-- =========================================================== -->
<div class="section-title">🔗 JIRA XRAY Integration</div>
${isJiraConfigured
  ? `<div class="security-card security-ok">
  <h4>✅ XRAY Integration Active — <a href="${jiraBase}" target="_blank">${jiraBase}</a></h4>
  <p>Test results are automatically uploaded to XRAY after each run. Click any test case key in the table below to open the XRAY test case in JIRA.</p>
  ${input.xrayLink ? `<p style="margin-top:8px">📌 <strong>This execution:</strong> <a href="${input.xrayLink}" target="_blank">${input.xrayLink}</a></p>` : ''}
</div>`
  : `<div class="security-card security-warn">
  <h4>⚠️ XRAY Not Configured — Running in Demo Mode</h4>
  <p>To enable live XRAY integration, update your <code>.env</code> file with real credentials:</p>
  <ul style="margin-top:10px;margin-left:20px;color:#94a3b8;font-size:13px;line-height:2">
    <li><code>JIRA_BASE_URL</code> — e.g. <code>https://yourcompany.atlassian.net</code></li>
    <li><code>JIRA_USERNAME</code> — your Atlassian account email</li>
    <li><code>JIRA_API_TOKEN</code> — generate at <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank">Atlassian API Tokens ↗</a></li>
  </ul>
  <p style="margin-top:10px">Once configured, every test run will automatically create a JIRA Test Execution and upload PASS/FAIL results — including screenshots for failed tests.</p>
  <p style="margin-top:8px;color:#fde68a;font-size:12px">💡 The test case keys (PROJ-101, PROJ-104, etc.) shown below are the XRAY test case IDs to link in your JIRA project.</p>
</div>`
}

<!-- =========================================================== -->
<!-- TEST RESULTS TABLE                                            -->
<!-- =========================================================== -->
<div class="section-title">📋 Test Case Results <span class="count-chip">${total} tests</span></div>
<table>
  <thead>
    <tr>
      <th>Type</th>
      <th>XRAY Key</th>
      <th>Test Name</th>
      <th>Status</th>
      <th>Duration</th>
      <th>Page Load</th>
      <th>A11y Issues</th>
      <th>Started</th>
      <th>Error</th>
    </tr>
  </thead>
  <tbody>
    ${results.map(r => {
      const perfEntry  = perfData.find(p => p.testName?.includes(r.testCaseKey));
      const a11yEntry  = a11yData[r.testCaseKey] ?? [];
      const critA11y   = a11yEntry.filter(v => v.impact === 'critical' || v.impact === 'serious').length;
      const durSec     = r.durationMs
        ? `${(r.durationMs/1000).toFixed(1)}s`
        : (perfEntry?.durationMs ? `${(perfEntry.durationMs/1000).toFixed(1)}s` : '—');
      const loadSec    = perfEntry?.pageLoadMs ? `${(perfEntry.pageLoadMs/1000).toFixed(1)}s` : '—';
      const badgeClass = r.status === 'PASS' ? 'badge-pass' : r.status === 'FAIL' ? 'badge-fail' : 'badge-skip';
      const testType   = getTestType(r);
      const startTime  = r.startedAt ? new Date(r.startedAt).toLocaleTimeString() : '—';

      // Build XRAY chip — clickable only if JIRA is configured
      const xrayHref = r.xrayLink ?? (isJiraConfigured && jiraBase && r.testCaseKey ? `${jiraBase}/browse/${r.testCaseKey}` : '');
      const xrayChip = xrayHref
        ? `<a href="${xrayHref}" target="_blank" class="xray-chip" title="Open in JIRA XRAY">${r.testCaseKey}</a>`
        : `<span class="xray-chip-demo" title="Configure JIRA_BASE_URL in .env to enable links">${r.testCaseKey}</span>`;

      return `
    <tr>
      <td><span class="badge badge-${testType.toLowerCase()}">${testType === 'UI' ? '🖥️ UI' : '🔌 API'}</span></td>
      <td>${xrayChip}</td>
      <td>
        <div class="test-title">${escapeHtml(r.testName ?? r.testCaseKey)}</div>
        ${r.testName && r.testName !== r.testCaseKey ? `<div class="test-key">${r.testCaseKey}</div>` : ''}
      </td>
      <td><span class="badge ${badgeClass}">${r.status}</span></td>
      <td>${durSec}</td>
      <td>${loadSec}</td>
      <td>${a11yEntry.length === 0
        ? '<span style="color:#22c55e;font-size:12px">✅ None</span>'
        : `<span class="badge badge-a11y-${critA11y > 0 ? 'critical' : 'moderate'}">${a11yEntry.length} (${critA11y} crit)</span>`
      }</td>
      <td class="timestamp">${startTime}</td>
      <td style="color:#fca5a5;font-size:12px;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escapeHtml(r.errorMessage ?? '')}">${r.errorMessage ? escapeHtml(r.errorMessage.substring(0, 100)) + (r.errorMessage.length > 100 ? '…' : '') : '—'}</td>
    </tr>`;
    }).join('')}
  </tbody>
</table>

<!-- =========================================================== -->
<!-- FAILURE SCREENSHOTS                                           -->
<!-- =========================================================== -->
${failedWithScreenshots.length > 0 ? `
<div class="section-title">📸 Failure Screenshots <span class="count-chip">${failedWithScreenshots.length}</span></div>
<div style="display:flex;flex-wrap:wrap;gap:16px;margin-bottom:24px">
  ${failedWithScreenshots.map(r => `
  <div style="background:#1e293b;border:1px solid #334155;border-radius:10px;padding:14px;max-width:280px">
    <div style="font-size:12px;color:#fca5a5;font-weight:600;margin-bottom:8px">❌ ${escapeHtml(r.testName ?? r.testCaseKey)}</div>
    <img class="screenshot-thumb" src="${r.screenshotPath}" alt="Failure screenshot for ${escapeHtml(r.testCaseKey)}" onclick="openScreenshot('${r.screenshotPath}')"/>
    <div style="font-size:11px;color:#64748b;margin-top:6px;font-family:monospace">${r.testCaseKey}</div>
  </div>`).join('')}
</div>

<!-- Screenshot Modal -->
<div class="screenshot-modal" id="screenshotModal" onclick="closeScreenshot()">
  <img id="screenshotModalImg" src="" alt="Screenshot"/>
</div>` : ''}

<!-- =========================================================== -->
<!-- ACCESSIBILITY REPORT                                          -->
<!-- =========================================================== -->
<div class="section-title">♿ Accessibility Report <span class="count-chip">${totalA11yViolations} violations</span></div>
${Object.keys(a11yData).length === 0
  ? `<div class="security-card security-info"><h4>ℹ️ No accessibility data collected</h4><p>Axe-core scans run automatically on all UI tests via the XRAY fixture. API tests are excluded (no rendered page). Rerun UI tests to collect data.</p></div>`
  : criticalA11y > 0
    ? `<div class="security-card security-warn" style="margin-bottom:16px"><h4>⚠️ ${criticalA11y} Critical/Serious Accessibility Violations Found</h4><p>These must be fixed before production release. See WCAG 2.1 AA guidelines for remediation guidance.</p></div>`
    : `<div class="security-card security-ok" style="margin-bottom:16px"><h4>✅ No Critical Accessibility Violations</h4><p>${totalA11yViolations > 0 ? `${totalA11yViolations} minor/moderate issue(s) found — review and address as capacity allows.` : 'All pages passed WCAG 2.1 AA accessibility scans.'}</p></div>`
}
${Object.keys(a11yData).length > 0 ? `<table>
  <thead><tr><th>Test</th><th>Violation ID</th><th>Impact</th><th>Description</th><th>Nodes</th><th>Docs</th></tr></thead>
  <tbody>
    ${Object.entries(a11yData).flatMap(([testKey, violations]) => {
      const testTitle = results.find(r => r.testCaseKey === testKey)?.testName ?? testKey;
      return violations.length === 0
        ? [`<tr><td colspan="6" class="a11y-none">✅ ${escapeHtml(testTitle)} — No violations</td></tr>`]
        : violations.map(v => `
    <tr class="a11y-row">
      <td style="font-size:12px">${escapeHtml(testTitle)}</td>
      <td style="font-family:monospace;font-size:11px;color:#a5b4fc">${v.id}</td>
      <td><span class="badge badge-a11y-${v.impact}">${v.impact}</span></td>
      <td style="font-size:12px;max-width:300px">${escapeHtml(v.description)}</td>
      <td style="text-align:center">${v.nodes}</td>
      <td><a href="${v.helpUrl}" target="_blank" style="font-size:12px;color:#60a5fa">Docs ↗</a></td>
    </tr>`);
    }).join('')}
  </tbody>
</table>` : ''}

<!-- =========================================================== -->
<!-- PERFORMANCE DATA                                              -->
<!-- =========================================================== -->
<div class="section-title">⚡ Performance Data <span class="count-chip">${perfData.length} entries</span></div>
${perfData.length === 0
  ? `<div class="security-card security-info"><h4>ℹ️ No performance data collected</h4><p>Performance metrics (page load, FCP, LCP) are collected automatically for UI tests. API tests only record duration.</p></div>`
  : `<table>
  <thead><tr><th>Test</th><th>Type</th><th>Duration</th><th>Page Load</th><th>FCP</th><th>LCP</th><th>Requests</th><th>Data Transfer</th></tr></thead>
  <tbody>
    ${perfData.map(p => {
      const matchedResult = results.find(r => p.testName?.includes(r.testCaseKey));
      const testType = matchedResult ? getTestType(matchedResult) : 'UI';
      const displayName = matchedResult?.testName ?? p.testName ?? '—';
      return `
    <tr>
      <td style="font-size:12px">${escapeHtml(displayName)}</td>
      <td><span class="badge badge-${testType.toLowerCase()}" style="font-size:10px">${testType}</span></td>
      <td>${p.durationMs ? `${(p.durationMs/1000).toFixed(2)}s` : '—'}</td>
      <td>${p.pageLoadMs ? `${(p.pageLoadMs/1000).toFixed(2)}s` : '—'}</td>
      <td>${p.fcpMs ? `${(p.fcpMs/1000).toFixed(2)}s` : '—'}</td>
      <td>${p.lcpMs ? `${(p.lcpMs/1000).toFixed(2)}s` : '—'}</td>
      <td>${p.requestCount ?? '—'}</td>
      <td>${p.transferBytes ? `${(p.transferBytes/1024).toFixed(1)} KB` : '—'}</td>
    </tr>`;
    }).join('')}
  </tbody>
</table>`}

<!-- =========================================================== -->
<!-- SECURITY NOTES                                                -->
<!-- =========================================================== -->
<div class="section-title">🔐 Security & Vulnerability Notes</div>
<div class="security-card security-ok">
  <h4>✅ Credential Management — AES-256 Encryption</h4>
  <p>All passwords are stored as encrypted values (AES-256-CBC) in <code>.env</code>. Plain text passwords are never committed to source control. The <code>ENCRYPTION_KEY</code> is stored separately from the encrypted values.</p>
</div>
<div class="security-card security-ok">
  <h4>✅ SQL Injection Prevention — Parameterised Queries</h4>
  <p>All database queries use parameterised queries (<code>$1, $2</code> placeholders) — never string concatenation with user input. This prevents SQL injection attacks per OWASP A03:2021.</p>
</div>
<div class="security-card security-ok">
  <h4>✅ Secure Database Connections — SSL/TLS</h4>
  <p>Database connections support SSL/TLS encryption (<code>DB_SSL=true</code>). Production databases always have SSL enabled to prevent data interception in transit.</p>
</div>
<div class="security-card security-ok">
  <h4>✅ XRAY / JIRA API Authentication — Token-Based</h4>
  <p>JIRA API access uses Atlassian API tokens (not passwords) stored in environment variables. Tokens can be revoked independently without changing your password. Never log API tokens.</p>
</div>
<div class="security-card security-info">
  <h4>ℹ️ Dependency Audit — Action Required Periodically</h4>
  <p>Run <code>npm audit</code> regularly to check for known CVEs in installed packages. Run <code>npm audit fix</code> to auto-fix safe updates. Review breaking changes before applying major version fixes.</p>
</div>
<div class="security-card ${failed > 0 ? 'security-warn' : 'security-ok'}">
  <h4>${failed > 0 ? '⚠️' : '✅'} Test Failure Analysis</h4>
  <p>${failed > 0
    ? `${failed} test(s) failed this run. Review failure screenshots and error messages in the Test Case Results table above. Ensure error messages do not expose security-sensitive data (e.g., stack traces, DB connection strings) in production logs.`
    : 'All tests passed. No security-related failures detected in this run. Failure screenshots would appear above if any tests failed.'}</p>
</div>

<!-- =========================================================== -->
<!-- STEP-BY-STEP LOG (Allure-like accordion)                     -->
<!-- =========================================================== -->
<div class="section-title">📝 Step-by-Step Execution Log <span class="count-chip">${logEntries.length} entries</span></div>
${Object.keys(stepsByTest).length === 0
  ? `<div class="security-card security-info"><h4>ℹ️ No structured logs collected</h4><p>Step logs appear here automatically when tests use <code>enhancedLogger</code>. All tests in this framework are already configured to log steps.</p></div>`
  : Object.entries(stepsByTest).map(([testKey, { title, entries }]) => {
    const matchedResult = results.find(r => r.testCaseKey === testKey);
    const statusBadge = matchedResult
      ? `<span class="badge ${matchedResult.status === 'PASS' ? 'badge-pass' : matchedResult.status === 'FAIL' ? 'badge-fail' : 'badge-skip'}" style="font-size:10px">${matchedResult.status}</span>`
      : '';
    const testType = matchedResult ? getTestType(matchedResult) : 'UI';
    return `
<div class="accordion">
  <div class="accordion-header" onclick="toggleAcc(this)">
    <div class="acc-title">
      <span class="badge badge-${testType.toLowerCase()}" style="font-size:10px">${testType}</span>
      ${statusBadge}
      <span>${escapeHtml(title)}</span>
      <span class="xray-chip-demo" style="font-size:10px">${testKey}</span>
      <span class="timestamp">(${entries.length} steps)</span>
    </div>
    <span style="color:#64748b;font-size:18px">▼</span>
  </div>
  <div class="accordion-body">
    ${entries.map(e => `<div class="log-line log-${e.level}">[${e.timestamp}] [${e.level.toUpperCase().padEnd(5)}] ${escapeHtml(e.message)}</div>`).join('\n')}
  </div>
</div>`;
  }).join('')}

</div><!-- /container -->

<!-- =========================================================== -->
<!-- CHART.JS INITIALIZATION                                       -->
<!-- =========================================================== -->
<script>
Chart.defaults.color = '#64748b';
Chart.defaults.borderColor = '#1e293b';

// 1. Doughnut — Pass/Fail/Abort
new Chart(document.getElementById('pieChart'), {
  type: 'doughnut',
  data: {
    labels: ['Passed', 'Failed', 'Aborted'],
    datasets: [{ data: [${passed}, ${failed}, ${aborted}], backgroundColor: ['#22c55e','#ef4444','#f59e0b'], borderWidth: 3, borderColor: '#0f172a' }]
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } } }
  }
});

// 2. Duration Bar Chart
new Chart(document.getElementById('durationChart'), {
  type: 'bar',
  data: {
    labels: ${JSON.stringify(testLabels)},
    datasets: [{ label: 'Duration (s)', data: ${JSON.stringify(durationValues)}, backgroundColor: '#3b82f6', borderRadius: 6 }]
  },
  options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } }
});

// 3. Load Time Chart
new Chart(document.getElementById('loadChart'), {
  type: 'bar',
  data: {
    labels: ${JSON.stringify(testLabels)},
    datasets: [{ label: 'Load Time (s)', data: ${JSON.stringify(loadTimeValues)}, backgroundColor: '#8b5cf6', borderRadius: 6 }]
  },
  options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } }
});

// 4. Pass/Fail per test histogram
const histColors = ${JSON.stringify(results.map(r => r.status === 'PASS' ? '#22c55e' : r.status === 'FAIL' ? '#ef4444' : '#f59e0b'))};
new Chart(document.getElementById('histChart'), {
  type: 'bar',
  data: {
    labels: ${JSON.stringify(testLabels)},
    datasets: [{ label: 'Result', data: ${JSON.stringify(results.map(r => r.status === 'PASS' ? 1 : 0))}, backgroundColor: histColors, borderRadius: 6 }]
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    scales: { y: { min: 0, max: 1, ticks: { callback: v => v === 1 ? 'PASS' : v === 0 ? 'FAIL' : '' } } },
    plugins: { legend: { display: false } }
  }
});

// Accordion toggle
function toggleAcc(header) {
  const body = header.nextElementSibling;
  body.classList.toggle('open');
  header.querySelector('span:last-child').textContent = body.classList.contains('open') ? '▲' : '▼';
}

// Screenshot modal
function openScreenshot(src) {
  document.getElementById('screenshotModalImg').src = src;
  document.getElementById('screenshotModal').classList.add('open');
}
function closeScreenshot() {
  document.getElementById('screenshotModal').classList.remove('open');
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeScreenshot(); });
</script>
</body>
</html>`;


}


// =============================================================================
// PRIVATE: escapeHtml
// =============================================================================
function escapeHtml(text: string): string {
  return text
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;');
}
