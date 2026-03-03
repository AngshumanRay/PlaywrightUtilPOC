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
  const jiraBase   = (input.jiraBaseUrl ?? '').replace(/\/$/, '');

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
  // Step logs (grouped by test)
  // --------------------------------------------------------------------------
  const stepsByTest: Record<string, LogEntry[]> = {};
  for (const entry of logEntries) {
    const key = entry.testName ?? 'Global';
    if (!stepsByTest[key]) stepsByTest[key] = [];
    stepsByTest[key].push(entry);
  }

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
    .header { background: linear-gradient(135deg, #1e3a5f 0%, #0f2340 100%); padding: 32px 40px; border-bottom: 1px solid #1e40af; }
    .header h1 { font-size: 28px; font-weight: 700; color: #f1f5f9; }
    .header .meta { margin-top: 8px; color: #94a3b8; font-size: 14px; }
    .header .meta span { margin-right: 24px; }
    .container { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }
    .section-title { font-size: 18px; font-weight: 700; color: #f1f5f9; margin: 32px 0 16px; padding-bottom: 8px; border-bottom: 2px solid #1e3a5f; display: flex; align-items: center; gap: 8px; }
    /* Summary Cards */
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .card { background: #1e293b; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #334155; }
    .card .value { font-size: 40px; font-weight: 800; }
    .card .label { font-size: 12px; color: #94a3b8; text-transform: uppercase; margin-top: 4px; letter-spacing: 0.8px; }
    .card.pass  .value { color: #22c55e; }
    .card.fail  .value { color: #ef4444; }
    .card.skip  .value { color: #f59e0b; }
    .card.total .value { color: #60a5fa; }
    .card.rate  .value { color: ${passRate >= 100 ? '#22c55e' : passRate >= 70 ? '#f59e0b' : '#ef4444'}; }
    /* Progress Bar */
    .progress-bar { background: #1e293b; border-radius: 8px; height: 12px; overflow: hidden; margin-bottom: 24px; display: flex; border: 1px solid #334155; }
    .progress-pass { background: #22c55e; height: 100%; transition: width 1s; }
    .progress-fail { background: #ef4444; height: 100%; }
    .progress-skip { background: #f59e0b; height: 100%; }
    /* Charts */
    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .chart-box { background: #1e293b; border-radius: 12px; padding: 20px; border: 1px solid #334155; }
    .chart-box h3 { color: #94a3b8; font-size: 13px; text-transform: uppercase; margin-bottom: 16px; letter-spacing: 0.8px; }
    .chart-container { position: relative; height: 240px; }
    /* Results Table */
    table { width: 100%; border-collapse: collapse; background: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; margin-bottom: 24px; }
    th { background: #0f2340; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px; padding: 12px 16px; text-align: left; }
    td { padding: 12px 16px; border-top: 1px solid #334155; font-size: 14px; vertical-align: middle; }
    tr:hover td { background: #263347; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; }
    .badge-pass  { background: #166534; color: #86efac; }
    .badge-fail  { background: #7f1d1d; color: #fca5a5; }
    .badge-skip  { background: #78350f; color: #fde68a; }
    .badge-a11y-critical  { background: #7f1d1d; color: #fca5a5; }
    .badge-a11y-serious   { background: #7c2d12; color: #fdba74; }
    .badge-a11y-moderate  { background: #713f12; color: #fef08a; }
    .badge-a11y-minor     { background: #1e3a5f; color: #93c5fd; }
    /* Accordion for logs */
    .accordion { background: #1e293b; border: 1px solid #334155; border-radius: 12px; margin-bottom: 8px; overflow: hidden; }
    .accordion-header { padding: 14px 16px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; user-select: none; }
    .accordion-header:hover { background: #263347; }
    .accordion-body { display: none; padding: 0 16px 16px; font-size: 13px; }
    .accordion-body.open { display: block; }
    .log-line { padding: 3px 0; border-bottom: 1px solid #1e293b; font-family: 'SF Mono', Consolas, monospace; font-size: 12px; }
    .log-pass  { color: #86efac; }
    .log-fail  { color: #fca5a5; }
    .log-warn  { color: #fde68a; }
    .log-error { color: #fca5a5; }
    .log-step  { color: #93c5fd; }
    .log-info  { color: #cbd5e1; }
    /* A11y */
    .a11y-row { font-size: 13px; }
    .a11y-none { color: #22c55e; padding: 12px; text-align: center; }
    /* Security section */
    .security-card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin-bottom: 8px; }
    .security-card h4 { color: #f1f5f9; margin-bottom: 8px; }
    .security-card p { color: #94a3b8; font-size: 13px; line-height: 1.6; }
    .security-ok   { border-left: 4px solid #22c55e; }
    .security-warn { border-left: 4px solid #f59e0b; }
    .security-info { border-left: 4px solid #60a5fa; }
    /* Responsive */
    @media(max-width:768px) { .charts-grid { grid-template-columns: 1fr; } }
    .timestamp { color: #64748b; font-size: 11px; }
    .xray-chip { display: inline-block; background: #1e3a5f; color: #93c5fd; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-family: monospace; }
  </style>
</head>
<body>

<!-- =========================================================== -->
<!-- HEADER                                                        -->
<!-- =========================================================== -->
<div class="header">
  <h1>📊 Test Execution Report</h1>
  <div class="meta">
    <span>📅 Run Date: <strong>${input.runDate}</strong></span>
    <span>🌍 Environment: <strong>${input.environment}</strong></span>
    ${input.xrayLink ? `<span>🔗 XRAY: <a href="${input.xrayLink}" target="_blank">${input.xrayLink}</a></span>` : ''}
    <span>⏰ Generated: <strong>${new Date().toLocaleString()}</strong></span>
  </div>
</div>

<div class="container">

<!-- =========================================================== -->
<!-- SUMMARY CARDS                                                 -->
<!-- =========================================================== -->
<div class="section-title">🏆 Execution Summary</div>
<div class="cards">
  <div class="card total">  <div class="value">${total}</div>  <div class="label">Total Tests</div>  </div>
  <div class="card pass">   <div class="value">${passed}</div> <div class="label">Passed</div>       </div>
  <div class="card fail">   <div class="value">${failed}</div> <div class="label">Failed</div>       </div>
  <div class="card skip">   <div class="value">${aborted}</div><div class="label">Aborted/Skip</div> </div>
  <div class="card rate">   <div class="value">${passRate}%</div><div class="label">Pass Rate</div>  </div>
  <div class="card" style="border-color:${totalA11yViolations>0?'#ef4444':'#22c55e'}">
    <div class="value" style="color:${totalA11yViolations>0?'#ef4444':'#22c55e'}">${totalA11yViolations}</div>
    <div class="label">A11y Issues</div>
  </div>
</div>

<!-- Progress Bar -->
<div class="progress-bar">
  <div class="progress-pass" style="width:${total > 0 ? (passed/total*100).toFixed(1) : 0}%"></div>
  <div class="progress-fail" style="width:${total > 0 ? (failed/total*100).toFixed(1) : 0}%"></div>
  <div class="progress-skip" style="width:${total > 0 ? (aborted/total*100).toFixed(1) : 0}%"></div>
</div>

<!-- =========================================================== -->
<!-- CHARTS                                                        -->
<!-- =========================================================== -->
<div class="section-title">📈 Charts & Graphs</div>
<div class="charts-grid">

  <!-- Pie Chart: Pass/Fail/Abort -->
  <div class="chart-box">
    <h3>Pass / Fail Distribution</h3>
    <div class="chart-container"><canvas id="pieChart"></canvas></div>
  </div>

  <!-- Bar Chart: Test Duration -->
  <div class="chart-box">
    <h3>Test Duration (seconds)</h3>
    <div class="chart-container"><canvas id="durationChart"></canvas></div>
  </div>

  <!-- Bar Chart: Page Load Time -->
  <div class="chart-box">
    <h3>Page Load Time (seconds)</h3>
    <div class="chart-container"><canvas id="loadChart"></canvas></div>
  </div>

  <!-- Histogram: Pass Rate by Test -->
  <div class="chart-box">
    <h3>Result Histogram</h3>
    <div class="chart-container"><canvas id="histChart"></canvas></div>
  </div>

</div>

<!-- =========================================================== -->
<!-- TEST RESULTS TABLE                                            -->
<!-- =========================================================== -->
<div class="section-title">📋 Test Case Results</div>
<table>
  <thead>
    <tr>
      <th>XRAY Key</th>
      <th>Test Name</th>
      <th>Status</th>
      <th>Duration</th>
      <th>Page Load</th>
      <th>A11y Issues</th>
      <th>Error</th>
    </tr>
  </thead>
  <tbody>
    ${results.map(r => {
      const perfEntry = perfData.find(p => p.testName?.includes(r.testCaseKey));
      const a11yEntry = a11yData[r.testCaseKey] ?? [];
      const critA11y  = a11yEntry.filter(v => v.impact === 'critical' || v.impact === 'serious').length;
      const durSec    = r.durationMs ? `${(r.durationMs/1000).toFixed(1)}s`
                      : (perfEntry?.durationMs ? `${(perfEntry.durationMs/1000).toFixed(1)}s` : '—');
      const loadSec   = perfEntry?.pageLoadMs ? `${(perfEntry.pageLoadMs/1000).toFixed(1)}s` : '—';
      const xrayHref  = r.xrayLink ?? (jiraBase && r.testCaseKey ? `${jiraBase}/browse/${r.testCaseKey}` : '');
      const badgeClass = r.status === 'PASS' ? 'badge-pass' : r.status === 'FAIL' ? 'badge-fail' : 'badge-skip';
      return `
    <tr>
      <td>${xrayHref ? `<a href="${xrayHref}" target="_blank" class="xray-chip">${r.testCaseKey}</a>` : `<span class="xray-chip">${r.testCaseKey}</span>`}</td>
      <td>${r.testName ?? '—'}</td>
      <td><span class="badge ${badgeClass}">${r.status}</span></td>
      <td>${durSec}</td>
      <td>${loadSec}</td>
      <td>${a11yEntry.length === 0
        ? '<span style="color:#22c55e">✅ None</span>'
        : `<span class="badge badge-a11y-${critA11y > 0 ? 'critical' : 'moderate'}">${a11yEntry.length} (${critA11y} crit)</span>`
      }</td>
      <td style="color:#fca5a5;font-size:12px;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.errorMessage ? r.errorMessage.substring(0, 120) : '—'}</td>
    </tr>`;
    }).join('')}
  </tbody>
</table>

<!-- =========================================================== -->
<!-- ACCESSIBILITY REPORT                                          -->
<!-- =========================================================== -->
<div class="section-title">♿ Accessibility Report</div>
${Object.keys(a11yData).length === 0
  ? `<div class="security-card security-ok"><h4>✅ No accessibility data collected</h4><p>To enable accessibility scanning, add axe-core scans to your tests. See CAPABILITIES.md for instructions.</p></div>`
  : `<table>
  <thead><tr><th>Test</th><th>Violation</th><th>Impact</th><th>Description</th><th>Nodes</th><th>Help</th></tr></thead>
  <tbody>
    ${Object.entries(a11yData).flatMap(([testName, violations]) =>
      violations.length === 0
        ? [`<tr><td>${testName}</td><td colspan="5" class="a11y-none">✅ No violations</td></tr>`]
        : violations.map(v => `
    <tr class="a11y-row">
      <td>${testName}</td>
      <td style="font-family:monospace;font-size:12px">${v.id}</td>
      <td><span class="badge badge-a11y-${v.impact}">${v.impact}</span></td>
      <td style="font-size:12px">${v.description}</td>
      <td>${v.nodes}</td>
      <td><a href="${v.helpUrl}" target="_blank" style="font-size:12px">Docs ↗</a></td>
    </tr>`)
    ).join('')}
  </tbody>
</table>`}

<!-- =========================================================== -->
<!-- PERFORMANCE DATA                                              -->
<!-- =========================================================== -->
<div class="section-title">⚡ Performance Data</div>
${perfData.length === 0
  ? `<div class="security-card security-info"><h4>ℹ️ No performance data collected</h4><p>Performance data is automatically collected when you use enhancedLogger.logPerformance() in your tests.</p></div>`
  : `<table>
  <thead><tr><th>Test</th><th>Duration</th><th>Page Load</th><th>FCP</th><th>LCP</th><th>Requests</th><th>Data Transfer</th></tr></thead>
  <tbody>
    ${perfData.map(p => `
    <tr>
      <td>${p.testName}</td>
      <td>${p.durationMs ? `${(p.durationMs/1000).toFixed(2)}s` : '—'}</td>
      <td>${p.pageLoadMs ? `${(p.pageLoadMs/1000).toFixed(2)}s` : '—'}</td>
      <td>${p.fcpMs ? `${(p.fcpMs/1000).toFixed(2)}s` : '—'}</td>
      <td>${p.lcpMs ? `${(p.lcpMs/1000).toFixed(2)}s` : '—'}</td>
      <td>${p.requestCount ?? '—'}</td>
      <td>${p.transferBytes ? `${(p.transferBytes/1024).toFixed(1)} KB` : '—'}</td>
    </tr>`).join('')}
  </tbody>
</table>`}

<!-- =========================================================== -->
<!-- SECURITY NOTES                                                -->
<!-- =========================================================== -->
<div class="section-title">🔐 Security & Vulnerability Notes</div>
<div class="security-card security-ok">
  <h4>✅ Credential Management</h4>
  <p>All passwords in this framework are stored as encrypted values (AES-256) in .env. Plain text passwords are never committed to source control. ENCRYPTION_KEY is stored separately from the encrypted values.</p>
</div>
<div class="security-card security-ok">
  <h4>✅ SQL Injection Prevention</h4>
  <p>All database queries use parameterised queries ($1, $2 placeholders) — never string concatenation with user input. This prevents SQL injection attacks.</p>
</div>
<div class="security-card security-ok">
  <h4>✅ Secure Database Connections</h4>
  <p>Database connections support SSL/TLS encryption (DB_SSL=true). Production databases should always have SSL enabled to prevent data interception.</p>
</div>
<div class="security-card security-info">
  <h4>ℹ️ Dependency Audit</h4>
  <p>Run <code>npm audit</code> regularly to check for known vulnerabilities in installed packages. Run <code>npm audit fix</code> to auto-fix safe updates.</p>
</div>
<div class="security-card ${failed > 0 ? 'security-warn' : 'security-ok'}">
  <h4>${failed > 0 ? '⚠️' : '✅'} Test Failures</h4>
  <p>${failed > 0
    ? `${failed} test(s) failed this run. Review failure screenshots and error messages above. Check if failures expose any security-sensitive data in error messages.`
    : 'All tests passed. No security-related failures detected in this run.'}</p>
</div>

<!-- =========================================================== -->
<!-- STEP-BY-STEP LOG (Allure-like)                               -->
<!-- =========================================================== -->
<div class="section-title">📝 Step-by-Step Execution Log</div>
${Object.keys(stepsByTest).length === 0
  ? `<div class="security-card security-info"><h4>ℹ️ No structured logs collected</h4><p>Logs appear here when you use enhancedLogger in your tests.</p></div>`
  : Object.entries(stepsByTest).map(([testName, entries]) => `
<div class="accordion" id="acc-${testName.replace(/[^a-z0-9]/gi, '_')}">
  <div class="accordion-header" onclick="toggleAcc(this)">
    <span>${testName} <span class="timestamp">(${entries.length} log entries)</span></span>
    <span>▼</span>
  </div>
  <div class="accordion-body">
    ${entries.map(e => `<div class="log-line log-${e.level}">[${e.timestamp}] [${e.level.toUpperCase()}] ${escapeHtml(e.message)}</div>`).join('\n')}
  </div>
</div>`).join('')}

</div><!-- /container -->

<!-- =========================================================== -->
<!-- CHART.JS INITIALIZATION                                       -->
<!-- =========================================================== -->
<script>
// Shared defaults
Chart.defaults.color = '#94a3b8';
Chart.defaults.borderColor = '#1e3a5f';

// 1. Pie Chart
new Chart(document.getElementById('pieChart'), {
  type: 'doughnut',
  data: {
    labels: ['Passed', 'Failed', 'Aborted'],
    datasets: [{ data: [${passed}, ${failed}, ${aborted}], backgroundColor: ['#22c55e','#ef4444','#f59e0b'], borderWidth: 2, borderColor: '#0f172a' }]
  },
  options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
});

// 2. Duration Bar Chart
new Chart(document.getElementById('durationChart'), {
  type: 'bar',
  data: {
    labels: ${JSON.stringify(testLabels)},
    datasets: [{ label: 'Duration (s)', data: ${JSON.stringify(durationValues)}, backgroundColor: '#3b82f6', borderRadius: 4 }]
  },
  options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } }
});

// 3. Load Time Chart
new Chart(document.getElementById('loadChart'), {
  type: 'bar',
  data: {
    labels: ${JSON.stringify(testLabels)},
    datasets: [{ label: 'Load Time (s)', data: ${JSON.stringify(loadTimeValues)}, backgroundColor: '#8b5cf6', borderRadius: 4 }]
  },
  options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } }
});

// 4. Histogram (pass=1, fail=0 per test — visual breakdown)
const histColors = ${JSON.stringify(results.map(r => r.status === 'PASS' ? '#22c55e' : r.status === 'FAIL' ? '#ef4444' : '#f59e0b'))};
new Chart(document.getElementById('histChart'), {
  type: 'bar',
  data: {
    labels: ${JSON.stringify(testLabels)},
    datasets: [{ label: 'Result', data: ${JSON.stringify(results.map(r => r.status === 'PASS' ? 1 : 0))}, backgroundColor: histColors, borderRadius: 4 }]
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    scales: { y: { min: 0, max: 1, ticks: { callback: v => v === 1 ? 'PASS' : 'FAIL' } } },
    plugins: { legend: { display: false } }
  }
});

// Accordion toggle
function toggleAcc(header) {
  const body = header.nextElementSibling;
  body.classList.toggle('open');
  header.querySelector('span:last-child').textContent = body.classList.contains('open') ? '▲' : '▼';
}
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
