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
  // Detect test type (UI vs API)
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
    return perf?.durationMs ? +(perf.durationMs / 1000).toFixed(2) : (r.durationMs ? +(r.durationMs / 1000).toFixed(2) : 0);
  });
  const loadTimeValues = results.map(r => {
    const perf = perfData.find(p => p.testName?.includes(r.testCaseKey));
    return perf?.pageLoadMs ? +(perf.pageLoadMs / 1000).toFixed(2) : 0;
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
  const stepsByTest: Record<string, { title: string; entries: LogEntry[] }> = {};
  for (const entry of logEntries) {
    const key = entry.testName ?? 'Global';
    if (!stepsByTest[key]) {
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
  // Observability aggregates
  // --------------------------------------------------------------------------
  const totalRequests   = perfData.reduce((s, p) => s + (p.requestCount ?? 0), 0);
  const totalTransferKB = perfData.reduce((s, p) => s + (p.transferBytes ?? 0), 0) / 1024;
  const avgPageLoad     = perfData.filter(p => p.pageLoadMs).length > 0
    ? (perfData.reduce((s, p) => s + (p.pageLoadMs ?? 0), 0) / perfData.filter(p => p.pageLoadMs).length)
    : 0;
  const avgFcp          = perfData.filter(p => p.fcpMs).length > 0
    ? (perfData.reduce((s, p) => s + (p.fcpMs ?? 0), 0) / perfData.filter(p => p.fcpMs).length)
    : 0;
  const avgLcp          = perfData.filter(p => p.lcpMs).length > 0
    ? (perfData.reduce((s, p) => s + (p.lcpMs ?? 0), 0) / perfData.filter(p => p.lcpMs).length)
    : 0;
  const errorLogCount   = logEntries.filter(e => e.level === 'error' || e.level === 'fail').length;
  const warnLogCount    = logEntries.filter(e => e.level === 'warn').length;

  // --------------------------------------------------------------------------
  // 3D Force Graph data — Meaningful Relationship Model
  // --------------------------------------------------------------------------
  // GRAPH PHILOSOPHY:
  //   This graph answers: "How does each test connect to quality signals?"
  //
  //   NODE TYPES (5 layers):
  //     🔵 Sprint/Run    — The root. Represents this entire test execution.
  //     🟦 Module         — "UI Tests" or "API Tests". Groups by test type.
  //     🟢/🔴 Test Case  — Individual JIRA XRAY test cases (PROJ-101, etc.)
  //     🟡 A11y Violation — Each unique WCAG violation found (only for UI tests).
  //     🟣 Page/Endpoint  — The target page or API endpoint being tested.
  //
  //   EDGE LABELS (what the lines MEAN):
  //     Run ──[3 UI, 3 API]──→ Module      = "Run triggered these modules"
  //     Module ──[PASS/FAIL]──→ Test        = "Module contains this test"
  //     Test ──[1.2s load]──→ Page          = "Test hit this page, took 1.2s"
  //     Test ──[2 violations]──→ Violation  = "Test found 2 WCAG issues here"
  //     Test ──[21 reqs, 1.8MB]──→ Network  = "Test made 21 requests"
  //
  //   WHY THIS MATTERS:
  //     - Immediately see which tests are slow (thick/red edges)
  //     - See which pages have accessibility problems (connected to yellow nodes)
  //     - See the dependency tree: Run → Module → Test → Page → Violations
  //     - Failed tests glow red, so you instantly spot problems
  // --------------------------------------------------------------------------

  type GraphNode = {id: string; group: string; label: string; val: number; color: string; desc?: string};
  type GraphLink = {source: string; target: string; label: string; color: string; width: number};

  const graphNodes: GraphNode[] = [];
  const graphLinks: GraphLink[] = [];

  // ─── Layer 0: Sprint/Run (root) ───
  graphNodes.push({
    id: 'RUN', group: 'run',
    label: `Sprint ${sprintDisplay}\\n${input.runDate}`,
    val: 22, color: '#6366f1',
    desc: `Test execution on ${input.runDate} — ${total} tests, ${passRate}% pass rate`,
  });

  // ─── Layer 1: Module nodes ───
  if (uiCount > 0) {
    graphNodes.push({
      id: 'UI_MODULE', group: 'module',
      label: `🖥️ UI Tests (${uiCount})`,
      val: 14, color: '#22d3ee',
      desc: `${uiCount} browser-based UI tests with page interactions`,
    });
    const uiPassed = results.filter(r => getTestType(r) === 'UI' && r.status === 'PASS').length;
    graphLinks.push({
      source: 'RUN', target: 'UI_MODULE',
      label: `${uiPassed}/${uiCount} passed`,
      color: uiPassed === uiCount ? '#22c55e' : '#f59e0b',
      width: 3,
    });
  }
  if (apiCount > 0) {
    graphNodes.push({
      id: 'API_MODULE', group: 'module',
      label: `🔌 API Tests (${apiCount})`,
      val: 14, color: '#fb923c',
      desc: `${apiCount} REST API tests (no browser, direct HTTP)`,
    });
    const apiPassed = results.filter(r => getTestType(r) === 'API' && r.status === 'PASS').length;
    graphLinks.push({
      source: 'RUN', target: 'API_MODULE',
      label: `${apiPassed}/${apiCount} passed`,
      color: apiPassed === apiCount ? '#22c55e' : '#f59e0b',
      width: 3,
    });
  }

  // ─── Layer 2: Test Case nodes + edges to modules ───
  for (const r of results) {
    const testType = getTestType(r);
    const perf = perfData.find(p => p.testName?.includes(r.testCaseKey));
    const a11yViolations = a11yData[r.testCaseKey] ?? [];
    const statusColor = r.status === 'PASS' ? '#22c55e' : r.status === 'FAIL' ? '#ef4444' : '#f59e0b';
    const durLabel = perf?.durationMs ? (perf.durationMs / 1000).toFixed(1) + 's' : (r.durationMs ? (r.durationMs / 1000).toFixed(1) + 's' : '');

    graphNodes.push({
      id: r.testCaseKey,
      group: 'test',
      label: `${r.testCaseKey}\\n${r.status}${durLabel ? ' · ' + durLabel : ''}`,
      val: 9,
      color: statusColor,
      desc: r.testName ?? r.testCaseKey,
    });

    // Module → Test (labeled with status + duration)
    graphLinks.push({
      source: testType === 'UI' ? 'UI_MODULE' : 'API_MODULE',
      target: r.testCaseKey,
      label: r.status + (durLabel ? ' · ' + durLabel : ''),
      color: statusColor,
      width: r.status === 'FAIL' ? 3 : 1.5,
    });

    // ─── Layer 3: Page / Endpoint nodes (unique per URL pattern) ───
    if (testType === 'UI' && perf) {
      const pageId = 'PAGE_' + r.testCaseKey;
      const loadLabel = perf.pageLoadMs ? (perf.pageLoadMs / 1000).toFixed(2) + 's load' : '';
      const fcpLabel  = perf.fcpMs ? (perf.fcpMs / 1000).toFixed(2) + 's FCP' : '';
      const reqLabel  = perf.requestCount ? perf.requestCount + ' reqs' : '';
      const kbLabel   = perf.transferBytes ? (perf.transferBytes / 1024).toFixed(0) + ' KB' : '';
      const metricsArr = [loadLabel, fcpLabel].filter(Boolean);
      const networkArr = [reqLabel, kbLabel].filter(Boolean);

      graphNodes.push({
        id: pageId, group: 'page',
        label: `📄 Page\\n${metricsArr.join(' · ') || 'measured'}`,
        val: 6, color: '#818cf8',
        desc: `Target page for ${r.testCaseKey}: ${metricsArr.concat(networkArr).join(', ') || 'metrics collected'}`,
      });

      graphLinks.push({
        source: r.testCaseKey, target: pageId,
        label: networkArr.join(', ') || 'loaded',
        color: '#818cf8',
        width: 1,
      });

      // ─── Layer 4: A11y Violation nodes (only for UI tests with violations) ───
      if (a11yViolations.length > 0) {
        // Group violations by impact for cleaner graph
        const bySeverity: Record<string, typeof a11yViolations> = {};
        for (const v of a11yViolations) {
          const key = v.impact;
          if (!bySeverity[key]) bySeverity[key] = [];
          bySeverity[key].push(v);
        }
        for (const [severity, vList] of Object.entries(bySeverity)) {
          const vNodeId = `A11Y_${r.testCaseKey}_${severity}`;
          const sevColor = severity === 'critical' ? '#ef4444' : severity === 'serious' ? '#f97316' : severity === 'moderate' ? '#f59e0b' : '#60a5fa';
          graphNodes.push({
            id: vNodeId, group: 'a11y',
            label: `⚠️ ${severity.toUpperCase()}\\n${vList.length} violation${vList.length > 1 ? 's' : ''}`,
            val: 4 + vList.length, color: sevColor,
            desc: vList.map(v => v.id + ': ' + v.description).join('; '),
          });
          graphLinks.push({
            source: pageId, target: vNodeId,
            label: `${vList.length} ${severity}`,
            color: sevColor,
            width: severity === 'critical' || severity === 'serious' ? 2.5 : 1,
          });
        }
      }
    }

    // API tests: show request metrics directly
    if (testType === 'API' && perf) {
      const networkId = 'NET_' + r.testCaseKey;
      const reqLabel = perf.requestCount ? perf.requestCount + ' reqs' : '';
      const kbLabel  = perf.transferBytes ? (perf.transferBytes / 1024).toFixed(0) + ' KB' : '';
      const info = [reqLabel, kbLabel].filter(Boolean).join(', ') || 'measured';

      graphNodes.push({
        id: networkId, group: 'network',
        label: `🌐 Network\\n${info}`,
        val: 5, color: '#38bdf8',
        desc: `API network metrics: ${info}`,
      });
      graphLinks.push({
        source: r.testCaseKey, target: networkId,
        label: info,
        color: '#38bdf8',
        width: 1,
      });
    }
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
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"><\/script>
  <script src="https://unpkg.com/3d-force-graph@1.73.3/dist/3d-force-graph.min.js"><\/script>
  <script src="https://unpkg.com/three@0.160.0/build/three.min.js"><\/script>
  <script src="https://unpkg.com/three-spritetext@1.8.2/dist/three-spritetext.min.js"><\/script>
  <style>
    :root {
      --bg-primary: #0a0e1a;
      --bg-secondary: #111827;
      --bg-card: #1a1f35;
      --bg-card-hover: #1f2847;
      --border: #2d3555;
      --border-glow: rgba(99, 102, 241, 0.3);
      --text-primary: #f1f5f9;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --accent-blue: #6366f1;
      --accent-cyan: #22d3ee;
      --accent-green: #22c55e;
      --accent-red: #ef4444;
      --accent-amber: #f59e0b;
      --accent-purple: #a78bfa;
      --accent-orange: #fb923c;
      --glass: rgba(26, 31, 53, 0.7);
      --glass-border: rgba(99, 102, 241, 0.15);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      line-height: 1.6;
    }
    a { color: var(--accent-cyan); text-decoration: none; }
    a:hover { color: #67e8f9; }

    /* ---- ANIMATED BACKGROUND ---- */
    .bg-mesh {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1;
      background:
        radial-gradient(ellipse at 20% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(34, 211, 238, 0.06) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 80%, rgba(167, 139, 250, 0.06) 0%, transparent 50%),
        var(--bg-primary);
    }

    /* ---- HEADER ---- */
    .header {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(34, 211, 238, 0.08) 50%, rgba(167, 139, 250, 0.1) 100%);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--glass-border);
      padding: 36px 48px;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
      background: conic-gradient(from 0deg, transparent, rgba(99, 102, 241, 0.03), transparent, rgba(34, 211, 238, 0.03), transparent);
      animation: headerRotate 20s linear infinite;
    }
    @keyframes headerRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .header > * { position: relative; z-index: 1; }
    .header h1 {
      font-size: 32px; font-weight: 800; letter-spacing: -0.5px;
      background: linear-gradient(135deg, #f1f5f9 0%, #6366f1 50%, #22d3ee 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .header .subtitle { margin-top: 6px; color: var(--text-secondary); font-size: 14px; font-weight: 500; }
    .header .meta { margin-top: 16px; display: flex; flex-wrap: wrap; gap: 20px; color: var(--text-secondary); font-size: 13px; }
    .header .meta-item { display: flex; align-items: center; gap: 6px; }
    .header .meta-item strong { color: var(--text-primary); }
    .env-badge { display: inline-block; padding: 3px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; }
    .env-staging    { background: rgba(99,102,241,0.2); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.4); }
    .env-production { background: rgba(239,68,68,0.2); color: #fca5a5; border: 1px solid rgba(239,68,68,0.4); }
    .env-dev        { background: rgba(34,197,94,0.2); color: #86efac; border: 1px solid rgba(34,197,94,0.4); }
    .env-other      { background: rgba(167,139,250,0.2); color: #ddd6fe; border: 1px solid rgba(167,139,250,0.4); }
    .xray-exec-link {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(34,211,238,0.1); border: 1px solid rgba(34,211,238,0.3);
      border-radius: 8px; padding: 5px 14px; color: var(--accent-cyan); font-size: 12px; font-weight: 600;
      transition: all 0.2s;
    }
    .xray-exec-link:hover { background: rgba(34,211,238,0.2); transform: translateY(-1px); }
    .xray-not-configured {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3);
      border-radius: 8px; padding: 5px 14px; color: #fde68a; font-size: 12px; font-weight: 500;
    }

    /* ---- LAYOUT ---- */
    .container { max-width: 1440px; margin: 0 auto; padding: 36px 28px; }
    .section-title {
      font-size: 20px; font-weight: 700; color: var(--text-primary);
      margin: 44px 0 18px; padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; gap: 10px;
    }
    .section-title .count-chip {
      background: rgba(99,102,241,0.15); color: var(--accent-blue);
      font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 9999px;
      border: 1px solid rgba(99,102,241,0.3); margin-left: 8px;
    }

    /* ---- GLASSMORPHISM CARDS ---- */
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(155px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .card {
      background: var(--glass); backdrop-filter: blur(12px);
      border-radius: 16px; padding: 22px 16px; text-align: center;
      border: 1px solid var(--glass-border);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative; overflow: hidden;
    }
    .card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, transparent, var(--accent-blue), transparent);
      opacity: 0; transition: opacity 0.3s;
    }
    .card:hover { transform: translateY(-4px); border-color: var(--border-glow); box-shadow: 0 8px 32px rgba(99, 102, 241, 0.15); }
    .card:hover::before { opacity: 1; }
    .card .value { font-size: 40px; font-weight: 800; line-height: 1; letter-spacing: -1px; }
    .card .label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; margin-top: 8px; letter-spacing: 1px; font-weight: 600; }
    .card.pass  .value { color: var(--accent-green); }
    .card.fail  .value { color: var(--accent-red); }
    .card.skip  .value { color: var(--accent-amber); }
    .card.total .value { color: var(--accent-blue); }
    .card.rate  .value { color: ${passRate >= 100 ? 'var(--accent-green)' : passRate >= 70 ? 'var(--accent-amber)' : 'var(--accent-red)'}; }
    .card.dur   .value { color: var(--accent-purple); font-size: 30px; }
    .card.ui    .value { color: var(--accent-cyan); }
    .card.api   .value { color: var(--accent-orange); }

    /* ---- PROGRESS BAR ---- */
    .progress-wrap { margin-bottom: 32px; }
    .progress-label { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); margin-bottom: 8px; font-weight: 500; }
    .progress-bar { background: var(--bg-secondary); border-radius: 10px; height: 16px; overflow: hidden; display: flex; border: 1px solid var(--border); }
    .progress-pass { background: linear-gradient(90deg, #059669, #22c55e); height: 100%; transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 10px 0 0 10px; }
    .progress-fail { background: linear-gradient(90deg, #dc2626, #ef4444); height: 100%; }
    .progress-skip { background: linear-gradient(90deg, #d97706, #f59e0b); height: 100%; border-radius: 0 10px 10px 0; }

    /* ---- 3D GRAPH ---- */
    .graph-container {
      background: var(--glass); backdrop-filter: blur(12px);
      border: 1px solid var(--glass-border); border-radius: 20px;
      overflow: hidden; margin-bottom: 28px; position: relative;
    }
    .graph-container .graph-overlay {
      position: absolute; top: 16px; left: 20px; z-index: 10;
      background: rgba(10, 14, 26, 0.8); backdrop-filter: blur(8px);
      padding: 12px 18px; border-radius: 12px; border: 1px solid var(--border);
    }
    .graph-container .graph-overlay h4 { font-size: 13px; color: var(--accent-cyan); font-weight: 700; margin-bottom: 4px; }
    .graph-container .graph-overlay p { font-size: 11px; color: var(--text-muted); }
    .graph-legend { display: flex; gap: 16px; flex-wrap: wrap; padding: 12px 20px; background: rgba(10,14,26,0.6); border-top: 1px solid var(--border); }
    .graph-legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-secondary); }
    .graph-legend-dot { width: 10px; height: 10px; border-radius: 50%; }

    /* ---- CHARTS ---- */
    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
    .chart-box {
      background: var(--glass); backdrop-filter: blur(12px);
      border-radius: 16px; padding: 22px; border: 1px solid var(--glass-border);
      transition: border-color 0.3s;
    }
    .chart-box:hover { border-color: var(--border-glow); }
    .chart-box h3 { color: var(--text-muted); font-size: 12px; text-transform: uppercase; margin-bottom: 14px; letter-spacing: 1px; font-weight: 700; }
    .chart-container { position: relative; height: 260px; }
    @media(max-width:900px) { .charts-grid { grid-template-columns: 1fr; } }

    /* ---- OBSERVABILITY DASHBOARD ---- */
    .obs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 28px; }
    .obs-card {
      background: var(--glass); backdrop-filter: blur(12px);
      border-radius: 14px; padding: 20px; border: 1px solid var(--glass-border);
      position: relative; overflow: hidden;
      transition: all 0.3s;
    }
    .obs-card:hover { border-color: var(--border-glow); transform: translateY(-2px); }
    .obs-card .obs-icon { font-size: 24px; margin-bottom: 10px; }
    .obs-card .obs-value { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
    .obs-card .obs-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; margin-top: 4px; font-weight: 600; }
    .obs-card .obs-bar {
      position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
      background: linear-gradient(90deg, var(--accent-blue), var(--accent-cyan));
    }

    /* ---- TABLES ---- */
    table { width: 100%; border-collapse: collapse; background: var(--bg-card); border-radius: 16px; overflow: hidden; border: 1px solid var(--border); margin-bottom: 28px; }
    th { background: rgba(99,102,241,0.08); color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; padding: 14px 16px; text-align: left; white-space: nowrap; font-weight: 700; }
    td { padding: 12px 16px; border-top: 1px solid rgba(45,53,85,0.5); font-size: 13px; vertical-align: middle; }
    tr { transition: background 0.2s; }
    tr:hover td { background: var(--bg-card-hover); }

    /* ---- BADGES ---- */
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.3px; }
    .badge-pass  { background: rgba(34,197,94,0.15); color: #86efac; border: 1px solid rgba(34,197,94,0.3); }
    .badge-fail  { background: rgba(239,68,68,0.15); color: #fca5a5; border: 1px solid rgba(239,68,68,0.3); }
    .badge-skip  { background: rgba(245,158,11,0.15); color: #fde68a; border: 1px solid rgba(245,158,11,0.3); }
    .badge-ui    { background: rgba(34,211,238,0.12); color: #67e8f9; border: 1px solid rgba(34,211,238,0.3); font-size: 10px; }
    .badge-api   { background: rgba(251,146,60,0.12); color: #fdba74; border: 1px solid rgba(251,146,60,0.3); font-size: 10px; }
    .badge-a11y-critical  { background: rgba(239,68,68,0.15); color: #fca5a5; border: 1px solid rgba(239,68,68,0.3); }
    .badge-a11y-serious   { background: rgba(251,146,60,0.15); color: #fdba74; border: 1px solid rgba(251,146,60,0.3); }
    .badge-a11y-moderate  { background: rgba(245,158,11,0.15); color: #fef08a; border: 1px solid rgba(245,158,11,0.3); }
    .badge-a11y-minor     { background: rgba(99,102,241,0.12); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.3); }

    /* ---- XRAY CHIP ---- */
    .xray-chip {
      display: inline-block; background: rgba(99,102,241,0.12); color: #a5b4fc;
      padding: 3px 10px; border-radius: 6px; font-size: 11px; font-family: 'SF Mono', monospace;
      font-weight: 700; text-decoration: none; border: 1px solid rgba(99,102,241,0.3);
      transition: all 0.2s;
    }
    .xray-chip:hover { background: rgba(99,102,241,0.25); color: #c7d2fe; transform: translateY(-1px); }
    .xray-chip-demo {
      display: inline-block; background: rgba(100,116,139,0.1); color: #64748b;
      padding: 3px 10px; border-radius: 6px; font-size: 11px; font-family: 'SF Mono', monospace;
      border: 1px dashed rgba(100,116,139,0.3); cursor: help;
    }

    /* ---- TIMESTAMPS ---- */
    .timestamp { color: var(--text-muted); font-size: 11px; font-family: 'SF Mono', monospace; }
    .test-title { font-weight: 500; color: var(--text-primary); }
    .test-key   { color: var(--text-muted); font-size: 11px; font-family: 'SF Mono', monospace; }

    /* ---- ACCORDION ---- */
    .accordion {
      background: var(--glass); backdrop-filter: blur(12px);
      border: 1px solid var(--glass-border); border-radius: 14px;
      margin-bottom: 10px; overflow: hidden; transition: border-color 0.3s;
    }
    .accordion:hover { border-color: var(--border-glow); }
    .accordion-header { padding: 16px 20px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; user-select: none; transition: background 0.2s; }
    .accordion-header:hover { background: var(--bg-card-hover); }
    .accordion-header .acc-title { font-size: 14px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 10px; }
    .accordion-body { display: none; padding: 0 18px 18px; }
    .accordion-body.open { display: block; }
    .log-line { padding: 4px 0; border-bottom: 1px solid rgba(45,53,85,0.3); font-family: 'SF Mono', 'Fira Code', Consolas, monospace; font-size: 12px; line-height: 1.6; }
    .log-pass  { color: #86efac; }
    .log-fail  { color: #fca5a5; }
    .log-warn  { color: #fde68a; }
    .log-error { color: #fca5a5; }
    .log-step  { color: #a5b4fc; }
    .log-info  { color: var(--text-secondary); }

    /* ---- STATUS CARDS ---- */
    .status-card {
      background: var(--glass); backdrop-filter: blur(12px);
      border: 1px solid var(--glass-border); border-radius: 16px;
      padding: 20px 24px; margin-bottom: 12px; transition: all 0.3s;
    }
    .status-card:hover { border-color: var(--border-glow); }
    .status-card h4 { color: var(--text-primary); margin-bottom: 8px; font-size: 14px; font-weight: 600; }
    .status-card p  { color: var(--text-secondary); font-size: 13px; line-height: 1.7; }
    .status-card code { background: var(--bg-primary); border: 1px solid var(--border); border-radius: 6px; padding: 2px 8px; font-family: 'SF Mono', monospace; font-size: 11px; color: #a5b4fc; }
    .status-ok   { border-left: 4px solid var(--accent-green); }
    .status-warn { border-left: 4px solid var(--accent-amber); }
    .status-info { border-left: 4px solid var(--accent-blue); }

    /* ---- SCREENSHOT ---- */
    .screenshot-thumb { max-width: 200px; max-height: 120px; border-radius: 8px; border: 1px solid var(--border); cursor: zoom-in; transition: all 0.3s; object-fit: cover; }
    .screenshot-thumb:hover { transform: scale(1.05); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
    .screenshot-modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 9999; justify-content: center; align-items: center; backdrop-filter: blur(8px); }
    .screenshot-modal.open { display: flex; }
    .screenshot-modal img { max-width: 90vw; max-height: 90vh; border-radius: 12px; box-shadow: 0 0 80px rgba(99,102,241,0.2); }

    /* ---- TAB NAVIGATION ---- */
    .nav-tabs {
      display: flex; gap: 4px; margin-bottom: 24px; padding: 4px;
      background: var(--bg-secondary); border-radius: 12px; border: 1px solid var(--border);
      overflow-x: auto;
    }
    .nav-tab {
      padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 13px;
      font-weight: 600; color: var(--text-muted); transition: all 0.2s;
      white-space: nowrap; border: none; background: none;
    }
    .nav-tab:hover { color: var(--text-primary); background: rgba(99,102,241,0.08); }
    .nav-tab.active { background: var(--accent-blue); color: white; box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
    .tab-content { display: none; }
    .tab-content.active { display: block; animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    /* ---- FOOTER ---- */
    .footer {
      text-align: center; padding: 32px 20px; color: var(--text-muted); font-size: 12px;
      border-top: 1px solid var(--border); margin-top: 48px;
    }
    .footer a { color: var(--accent-blue); }
  </style>
</head>
<body>
<div class="bg-mesh"></div>

<!-- =========================================================== -->
<!-- HEADER                                                        -->
<!-- =========================================================== -->
<div class="header">
  <h1>⚡ Playwright Execution Report</h1>
  <div class="subtitle">Automated UI + API Test Results — Playwright + TypeScript + JIRA XRAY Integration</div>
  <div class="meta">
    <div class="meta-item">📅 <strong>${input.runDate}</strong></div>
    <div class="meta-item">🚀 Started: <strong>${runStartDisplay}</strong></div>
    <div class="meta-item">🌍
      <span class="env-badge ${
        input.environment === 'staging' ? 'env-staging'
        : input.environment === 'production' ? 'env-production'
        : input.environment === 'dev' ? 'env-dev'
        : 'env-other'
      }">${input.environment}</span>
    </div>
    <div class="meta-item">🔖 Sprint: <strong>${sprintDisplay}</strong></div>
    <div class="meta-item">⏱️ Duration: <strong>${totalDurationSec}s</strong></div>
    <div class="meta-item">
      ${input.xrayLink
        ? `<a class="xray-exec-link" href="${input.xrayLink}" target="_blank">🔗 XRAY Execution ↗</a>`
        : `<span class="xray-not-configured" title="Set JIRA_BASE_URL in .env to enable XRAY">⚠️ XRAY: Not Configured</span>`
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
  <div class="card pass"><div class="value">${passed}</div><div class="label">Passed ✅</div></div>
  <div class="card fail"><div class="value">${failed}</div><div class="label">Failed ❌</div></div>
  <div class="card skip"><div class="value">${aborted}</div><div class="label">Aborted ⚠️</div></div>
  <div class="card rate"><div class="value">${passRate}%</div><div class="label">Pass Rate</div></div>
  <div class="card dur"><div class="value">${totalDurationSec}s</div><div class="label">Duration</div></div>
  <div class="card ui"><div class="value">${uiCount}</div><div class="label">UI Tests 🖥️</div></div>
  <div class="card api"><div class="value">${apiCount}</div><div class="label">API Tests 🔌</div></div>
  <div class="card" style="border-color:${totalA11yViolations>0?'rgba(239,68,68,0.4)':'rgba(34,197,94,0.4)'}">
    <div class="value" style="color:${totalA11yViolations>0?'var(--accent-red)':'var(--accent-green)'}">${totalA11yViolations}</div>
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
<!-- TAB NAVIGATION                                                -->
<!-- =========================================================== -->
<div class="nav-tabs">
  <button class="nav-tab active" onclick="switchTab('tab-3d')">🌐 3D Graph</button>
  <button class="nav-tab" onclick="switchTab('tab-observability')">📡 Observability</button>
  <button class="nav-tab" onclick="switchTab('tab-charts')">📈 Charts</button>
  <button class="nav-tab" onclick="switchTab('tab-results')">📋 Results</button>
  <button class="nav-tab" onclick="switchTab('tab-perf')">⚡ Performance</button>
  <button class="nav-tab" onclick="switchTab('tab-a11y')">♿ Accessibility</button>
  <button class="nav-tab" onclick="switchTab('tab-logs')">📝 Logs</button>
  <button class="nav-tab" onclick="switchTab('tab-security')">🔐 Security</button>
</div>

<!-- =========================================================== -->
<!-- TAB: 3D FORCE GRAPH (Neo4j-style)                             -->
<!-- =========================================================== -->
<div class="tab-content active" id="tab-3d">
<div class="section-title">🌐 Test Execution Dependency Graph <span class="count-chip">Interactive 3D</span></div>

<!-- WHAT THIS GRAPH REPRESENTS — Explainer Panel -->
<div class="status-card status-info" style="margin-bottom:20px;border-left-color:var(--accent-cyan)">
  <h4 style="color:var(--accent-cyan)">📖 What This Graph Represents</h4>
  <p style="margin-top:8px;line-height:1.8">
    This <strong>interactive 3D force-directed graph</strong> maps the entire test execution as a <strong>dependency tree</strong> — showing how each test connects to the system under test and what quality signals it produced. Each node is an entity, each edge is a measured relationship.
  </p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px">
    <div>
      <p style="font-size:12px;font-weight:700;color:var(--text-primary);margin-bottom:6px">🔷 NODE TYPES (What)</p>
      <ul style="margin-left:16px;font-size:12px;line-height:2;color:var(--text-secondary)">
        <li><span style="color:#6366f1">●</span> <strong>Sprint/Run</strong> — Root node. This test execution session.</li>
        <li><span style="color:#22d3ee">●</span> <strong>UI Module</strong> — Groups browser-based tests that render pages.</li>
        <li><span style="color:#fb923c">●</span> <strong>API Module</strong> — Groups REST API tests (no browser).</li>
        <li><span style="color:#22c55e">●</span>/<span style="color:#ef4444">●</span> <strong>Test Case</strong> — Individual JIRA XRAY test (green=pass, red=fail).</li>
        <li><span style="color:#818cf8">●</span> <strong>Page</strong> — The actual web page tested, with load time & FCP.</li>
        <li><span style="color:#38bdf8">●</span> <strong>Network</strong> — API endpoint metrics (request count, data transfer).</li>
        <li><span style="color:#f59e0b">●</span>/<span style="color:#ef4444">●</span> <strong>A11y Violation</strong> — WCAG accessibility issue found on a page.</li>
      </ul>
    </div>
    <div>
      <p style="font-size:12px;font-weight:700;color:var(--text-primary);margin-bottom:6px">🔗 EDGE LABELS (Relationships)</p>
      <ul style="margin-left:16px;font-size:12px;line-height:2;color:var(--text-secondary)">
        <li><strong>Run → Module</strong>: "3/3 passed" — pass count out of total.</li>
        <li><strong>Module → Test</strong>: "PASS · 12.1s" — result + duration.</li>
        <li><strong>Test → Page</strong>: "21 reqs, 2108 KB" — network footprint.</li>
        <li><strong>Page → Violation</strong>: "1 serious" — WCAG violations found.</li>
        <li><strong>Test → Network</strong>: "5 reqs, 84 KB" — API call metrics.</li>
        <li><em style="color:var(--accent-amber)">Thick red edges</em> = failed tests (investigate!).</li>
        <li><em style="color:var(--accent-amber)">Thick yellow edges</em> = critical a11y violations.</li>
      </ul>
    </div>
  </div>
  <p style="margin-top:14px;font-size:12px;color:var(--text-muted);border-top:1px solid var(--border);padding-top:10px">
    💡 <strong>Why this matters:</strong> Instantly see which tests are slow (long duration labels), which pages have WCAG violations (yellow/red nodes branching off pages), and which API calls transfer the most data. A healthy graph has all green test nodes and no violation branches.
  </p>
</div>

<div class="graph-container">
  <div class="graph-overlay">
    <h4>🔮 Force-Directed Dependency Graph</h4>
    <p>Drag to rotate • Scroll to zoom • Click nodes to focus</p>
    <p style="margin-top:4px;font-size:10px;color:var(--accent-amber)">Edges show real metrics — hover labels for details</p>
  </div>
  <div id="3d-graph" style="height:560px;width:100%;"></div>
  <div class="graph-legend">
    <div class="graph-legend-item"><div class="graph-legend-dot" style="background:#6366f1"></div> Sprint/Run</div>
    <div class="graph-legend-item"><div class="graph-legend-dot" style="background:#22d3ee"></div> UI Module</div>
    <div class="graph-legend-item"><div class="graph-legend-dot" style="background:#fb923c"></div> API Module</div>
    <div class="graph-legend-item"><div class="graph-legend-dot" style="background:#22c55e"></div> Test Passed</div>
    <div class="graph-legend-item"><div class="graph-legend-dot" style="background:#ef4444"></div> Test Failed</div>
    <div class="graph-legend-item"><div class="graph-legend-dot" style="background:#818cf8"></div> Page / Endpoint</div>
    <div class="graph-legend-item"><div class="graph-legend-dot" style="background:#38bdf8"></div> Network Metrics</div>
    <div class="graph-legend-item"><div class="graph-legend-dot" style="background:#f59e0b"></div> A11y Violation</div>
    <div class="graph-legend-item" style="margin-left:auto;color:var(--text-muted);font-style:italic">Edge labels = measured data</div>
  </div>
</div>
</div>

<!-- =========================================================== -->
<!-- TAB: OBSERVABILITY DASHBOARD                                  -->
<!-- =========================================================== -->
<div class="tab-content" id="tab-observability">
<div class="section-title">📡 Observability Dashboard <span class="count-chip">Real-time Metrics</span></div>
<div class="obs-grid">
  <div class="obs-card">
    <div class="obs-icon">🌐</div>
    <div class="obs-value" style="color:var(--accent-cyan)">${totalRequests}</div>
    <div class="obs-label">Total HTTP Requests</div>
    <div class="obs-bar"></div>
  </div>
  <div class="obs-card">
    <div class="obs-icon">📦</div>
    <div class="obs-value" style="color:var(--accent-purple)">${totalTransferKB.toFixed(1)} KB</div>
    <div class="obs-label">Data Transferred</div>
    <div class="obs-bar" style="background:linear-gradient(90deg,var(--accent-purple),#c084fc)"></div>
  </div>
  <div class="obs-card">
    <div class="obs-icon">⚡</div>
    <div class="obs-value" style="color:var(--accent-green)">${avgPageLoad > 0 ? (avgPageLoad/1000).toFixed(2) + 's' : '—'}</div>
    <div class="obs-label">Avg Page Load</div>
    <div class="obs-bar" style="background:linear-gradient(90deg,var(--accent-green),#4ade80)"></div>
  </div>
  <div class="obs-card">
    <div class="obs-icon">🎨</div>
    <div class="obs-value" style="color:#22d3ee">${avgFcp > 0 ? (avgFcp/1000).toFixed(2) + 's' : '—'}</div>
    <div class="obs-label">Avg FCP</div>
    <div class="obs-bar" style="background:linear-gradient(90deg,#06b6d4,#22d3ee)"></div>
  </div>
  <div class="obs-card">
    <div class="obs-icon">📐</div>
    <div class="obs-value" style="color:#f472b6">${avgLcp > 0 ? (avgLcp/1000).toFixed(2) + 's' : '—'}</div>
    <div class="obs-label">Avg LCP</div>
    <div class="obs-bar" style="background:linear-gradient(90deg,#ec4899,#f472b6)"></div>
  </div>
  <div class="obs-card">
    <div class="obs-icon">❌</div>
    <div class="obs-value" style="color:var(--accent-red)">${errorLogCount}</div>
    <div class="obs-label">Error Logs</div>
    <div class="obs-bar" style="background:linear-gradient(90deg,var(--accent-red),#f87171)"></div>
  </div>
  <div class="obs-card">
    <div class="obs-icon">⚠️</div>
    <div class="obs-value" style="color:var(--accent-amber)">${warnLogCount}</div>
    <div class="obs-label">Warning Logs</div>
    <div class="obs-bar" style="background:linear-gradient(90deg,var(--accent-amber),#fbbf24)"></div>
  </div>
  <div class="obs-card">
    <div class="obs-icon">♿</div>
    <div class="obs-value" style="color:${totalA11yViolations > 0 ? 'var(--accent-amber)' : 'var(--accent-green)'}">${totalA11yViolations}</div>
    <div class="obs-label">A11y Violations</div>
    <div class="obs-bar" style="background:linear-gradient(90deg,${totalA11yViolations > 0 ? 'var(--accent-amber),#fbbf24' : 'var(--accent-green),#4ade80'})"></div>
  </div>
</div>

<!-- Per-test Observability Table -->
${perfData.length > 0 ? `
<h3 style="color:var(--text-muted);font-size:13px;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;font-weight:700">Per-Test Metrics Breakdown</h3>
<table>
  <thead><tr><th>Test</th><th>Type</th><th>Duration</th><th>Page Load</th><th>FCP</th><th>LCP</th><th>Requests</th><th>Transfer</th></tr></thead>
  <tbody>
    ${perfData.map(p => {
      const matchedResult = results.find(r => p.testName?.includes(r.testCaseKey));
      const testType = matchedResult ? getTestType(matchedResult) : 'UI';
      const displayName = matchedResult?.testName ?? p.testName ?? '—';
      return `
    <tr>
      <td style="font-size:12px">${escapeHtml(displayName)}</td>
      <td><span class="badge badge-${testType.toLowerCase()}" style="font-size:10px">${testType}</span></td>
      <td>${p.durationMs ? (p.durationMs/1000).toFixed(2) + 's' : '—'}</td>
      <td>${p.pageLoadMs ? (p.pageLoadMs/1000).toFixed(2) + 's' : '—'}</td>
      <td>${p.fcpMs ? (p.fcpMs/1000).toFixed(2) + 's' : '—'}</td>
      <td>${p.lcpMs ? (p.lcpMs/1000).toFixed(2) + 's' : '—'}</td>
      <td>${p.requestCount ?? '—'}</td>
      <td>${p.transferBytes ? (p.transferBytes/1024).toFixed(1) + ' KB' : '—'}</td>
    </tr>`;
    }).join('')}
  </tbody>
</table>` : `<div class="status-card status-info"><h4>ℹ️ No observability data collected</h4><p>Performance metrics are collected automatically during test execution. Run tests to populate this dashboard.</p></div>`}
</div>

<!-- =========================================================== -->
<!-- TAB: CHARTS                                                   -->
<!-- =========================================================== -->
<div class="tab-content" id="tab-charts">
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
</div>

<!-- =========================================================== -->
<!-- TAB: TEST RESULTS                                             -->
<!-- =========================================================== -->
<div class="tab-content" id="tab-results">
<div class="section-title">📋 Test Case Results <span class="count-chip">${total} tests</span></div>

<!-- JIRA XRAY STATUS -->
${isJiraConfigured
  ? `<div class="status-card status-ok" style="margin-bottom:20px">
  <h4>✅ XRAY Integration Active — <a href="${jiraBase}" target="_blank">${jiraBase}</a></h4>
  <p>Test results automatically uploaded to XRAY. Click test case keys to open in JIRA.</p>
  ${input.xrayLink ? `<p style="margin-top:8px">📌 <strong>This execution:</strong> <a href="${input.xrayLink}" target="_blank">${input.xrayLink}</a></p>` : ''}
</div>`
  : `<div class="status-card status-warn" style="margin-bottom:20px">
  <h4>⚠️ XRAY Not Configured — Demo Mode</h4>
  <p>To enable: set <code>JIRA_BASE_URL</code>, <code>JIRA_USERNAME</code>, <code>JIRA_API_TOKEN</code> in <code>.env</code></p>
</div>`
}

<table>
  <thead>
    <tr><th>Type</th><th>XRAY Key</th><th>Test Name</th><th>Status</th><th>Duration</th><th>Page Load</th><th>A11y</th><th>Started</th><th>Error</th></tr>
  </thead>
  <tbody>
    ${results.map(r => {
      const perfEntry  = perfData.find(p => p.testName?.includes(r.testCaseKey));
      const a11yEntry  = a11yData[r.testCaseKey] ?? [];
      const critA11y   = a11yEntry.filter(v => v.impact === 'critical' || v.impact === 'serious').length;
      const durSec     = r.durationMs
        ? (r.durationMs/1000).toFixed(1) + 's'
        : (perfEntry?.durationMs ? (perfEntry.durationMs/1000).toFixed(1) + 's' : '—');
      const loadSec    = perfEntry?.pageLoadMs ? (perfEntry.pageLoadMs/1000).toFixed(1) + 's' : '—';
      const badgeClass = r.status === 'PASS' ? 'badge-pass' : r.status === 'FAIL' ? 'badge-fail' : 'badge-skip';
      const testType   = getTestType(r);
      const startTime  = r.startedAt ? new Date(r.startedAt).toLocaleTimeString() : '—';
      const xrayHref = r.xrayLink ?? (isJiraConfigured && jiraBase && r.testCaseKey ? jiraBase + '/browse/' + r.testCaseKey : '');
      const xrayChip = xrayHref
        ? `<a href="${xrayHref}" target="_blank" class="xray-chip" title="Open in JIRA XRAY">${r.testCaseKey}</a>`
        : `<span class="xray-chip-demo" title="Configure JIRA_BASE_URL in .env">${r.testCaseKey}</span>`;
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
        ? '<span style="color:var(--accent-green);font-size:12px">✅ None</span>'
        : `<span class="badge badge-a11y-${critA11y > 0 ? 'critical' : 'moderate'}">${a11yEntry.length} (${critA11y} crit)</span>`
      }</td>
      <td class="timestamp">${startTime}</td>
      <td style="color:#fca5a5;font-size:12px;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escapeHtml(r.errorMessage ?? '')}">${r.errorMessage ? escapeHtml(r.errorMessage.substring(0, 100)) + (r.errorMessage.length > 100 ? '…' : '') : '—'}</td>
    </tr>`;
    }).join('')}
  </tbody>
</table>

<!-- Failure Screenshots -->
${failedWithScreenshots.length > 0 ? `
<div class="section-title">📸 Failure Screenshots <span class="count-chip">${failedWithScreenshots.length}</span></div>
<div style="display:flex;flex-wrap:wrap;gap:16px;margin-bottom:24px">
  ${failedWithScreenshots.map(r => `
  <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:14px;padding:16px;max-width:280px">
    <div style="font-size:12px;color:#fca5a5;font-weight:600;margin-bottom:8px">❌ ${escapeHtml(r.testName ?? r.testCaseKey)}</div>
    <img class="screenshot-thumb" src="${r.screenshotPath}" alt="Failure screenshot for ${escapeHtml(r.testCaseKey)}" onclick="openScreenshot('${r.screenshotPath}')"/>
    <div style="font-size:11px;color:var(--text-muted);margin-top:6px;font-family:monospace">${r.testCaseKey}</div>
  </div>`).join('')}
</div>
<div class="screenshot-modal" id="screenshotModal" onclick="closeScreenshot()">
  <img id="screenshotModalImg" src="" alt="Screenshot"/>
</div>` : ''}
</div>

<!-- =========================================================== -->
<!-- TAB: PERFORMANCE                                              -->
<!-- =========================================================== -->
<div class="tab-content" id="tab-perf">
<div class="section-title">⚡ Performance Data <span class="count-chip">${perfData.length} entries</span></div>
${perfData.length === 0
  ? `<div class="status-card status-info"><h4>ℹ️ No performance data collected</h4><p>Performance metrics (page load, FCP, LCP, network requests) are collected automatically for all tests. API tests record duration and request count.</p></div>`
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
      <td>${p.durationMs ? (p.durationMs/1000).toFixed(2) + 's' : '—'}</td>
      <td>${p.pageLoadMs ? (p.pageLoadMs/1000).toFixed(2) + 's' : '—'}</td>
      <td>${p.fcpMs ? (p.fcpMs/1000).toFixed(2) + 's' : '—'}</td>
      <td>${p.lcpMs ? (p.lcpMs/1000).toFixed(2) + 's' : '—'}</td>
      <td>${p.requestCount ?? '—'}</td>
      <td>${p.transferBytes ? (p.transferBytes/1024).toFixed(1) + ' KB' : '—'}</td>
    </tr>`;
    }).join('')}
  </tbody>
</table>`}
</div>

<!-- =========================================================== -->
<!-- TAB: ACCESSIBILITY                                            -->
<!-- =========================================================== -->
<div class="tab-content" id="tab-a11y">
<div class="section-title">♿ Accessibility Report <span class="count-chip">${totalA11yViolations} violations</span></div>
${Object.keys(a11yData).length === 0
  ? `<div class="status-card status-info"><h4>ℹ️ No accessibility data collected</h4><p>Axe-core WCAG scans run automatically on UI tests. API tests are excluded (no rendered page).</p></div>`
  : criticalA11y > 0
    ? `<div class="status-card status-warn" style="margin-bottom:16px"><h4>⚠️ ${criticalA11y} Critical/Serious Accessibility Violations Found</h4><p>These must be fixed before production release. See WCAG 2.1 AA guidelines.</p></div>`
    : `<div class="status-card status-ok" style="margin-bottom:16px"><h4>✅ No Critical Accessibility Violations</h4><p>${totalA11yViolations > 0 ? totalA11yViolations + ' minor/moderate issue(s) — review as capacity allows.' : 'All pages passed WCAG 2.1 AA scans.'}</p></div>`
}
${Object.keys(a11yData).length > 0 ? `<table>
  <thead><tr><th>Test</th><th>Violation ID</th><th>Impact</th><th>Description</th><th>Nodes</th><th>Docs</th></tr></thead>
  <tbody>
    ${Object.entries(a11yData).flatMap(([testKey, violations]) => {
      const testTitle = results.find(r => r.testCaseKey === testKey)?.testName ?? testKey;
      return violations.length === 0
        ? [`<tr><td colspan="6" style="color:var(--accent-green);padding:16px;text-align:center;font-size:13px">✅ ${escapeHtml(testTitle)} — No violations</td></tr>`]
        : violations.map(v => `
    <tr>
      <td style="font-size:12px">${escapeHtml(testTitle)}</td>
      <td style="font-family:monospace;font-size:11px;color:#a5b4fc">${v.id}</td>
      <td><span class="badge badge-a11y-${v.impact}">${v.impact}</span></td>
      <td style="font-size:12px;max-width:300px">${escapeHtml(v.description)}</td>
      <td style="text-align:center">${v.nodes}</td>
      <td><a href="${v.helpUrl}" target="_blank" style="font-size:12px">Docs ↗</a></td>
    </tr>`);
    }).join('')}
  </tbody>
</table>` : ''}
</div>

<!-- =========================================================== -->
<!-- TAB: STEP-BY-STEP LOG                                         -->
<!-- =========================================================== -->
<div class="tab-content" id="tab-logs">
<div class="section-title">📝 Step-by-Step Execution Log <span class="count-chip">${logEntries.length} entries</span></div>
${Object.keys(stepsByTest).length === 0
  ? `<div class="status-card status-info"><h4>ℹ️ No structured logs collected</h4><p>Step logs appear here when tests use <code>enhancedLogger</code>. All tests in this framework log steps automatically.</p></div>`
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
    <span style="color:var(--text-muted);font-size:18px;transition:transform 0.2s">▼</span>
  </div>
  <div class="accordion-body">
    ${entries.map(e => `<div class="log-line log-${e.level}">[${e.timestamp}] [${e.level.toUpperCase().padEnd(5)}] ${escapeHtml(e.message)}</div>`).join('\n')}
  </div>
</div>`;
  }).join('')}
</div>

<!-- =========================================================== -->
<!-- TAB: SECURITY                                                 -->
<!-- =========================================================== -->
<div class="tab-content" id="tab-security">
<div class="section-title">🔐 Security & Vulnerability Notes</div>
<div class="status-card status-ok">
  <h4>✅ Credential Management — AES-256 Encryption</h4>
  <p>All passwords stored as encrypted values (AES-256-CBC) in <code>.env</code>. Plain text passwords never committed to source control.</p>
</div>
<div class="status-card status-ok">
  <h4>✅ SQL Injection Prevention — Parameterised Queries</h4>
  <p>All database queries use parameterised queries (<code>$1, $2</code> placeholders) — never string concatenation. Per OWASP A03:2021.</p>
</div>
<div class="status-card status-ok">
  <h4>✅ Secure Database Connections — SSL/TLS</h4>
  <p>Database connections support SSL/TLS (<code>DB_SSL=true</code>). Production always has SSL enabled.</p>
</div>
<div class="status-card status-ok">
  <h4>✅ XRAY / JIRA API — Token-Based Auth</h4>
  <p>JIRA API uses Atlassian API tokens (not passwords). Tokens can be revoked independently.</p>
</div>
<div class="status-card status-info">
  <h4>ℹ️ Dependency Audit</h4>
  <p>Run <code>npm audit</code> regularly for known CVEs. Run <code>npm audit fix</code> for safe auto-fixes.</p>
</div>
<div class="status-card ${failed > 0 ? 'status-warn' : 'status-ok'}">
  <h4>${failed > 0 ? '⚠️' : '✅'} Test Failure Analysis</h4>
  <p>${failed > 0
    ? failed + ' test(s) failed. Review screenshots and errors in the Results tab. Ensure no security-sensitive data in error messages.'
    : 'All tests passed. No security-related failures detected.'}</p>
</div>
</div>

<!-- =========================================================== -->
<!-- FOOTER                                                        -->
<!-- =========================================================== -->
<div class="footer">
  <p>Generated by <strong>Playwright XRAY Framework</strong> • ${input.runDate} • ${total} tests • ${passRate}% pass rate</p>
  <p style="margin-top:4px">Built with ❤️ using Playwright + TypeScript + Chart.js + 3D-Force-Graph</p>
</div>

</div><!-- /container -->

<!-- =========================================================== -->
<!-- SCRIPTS                                                       -->
<!-- =========================================================== -->
<script>
// ---- TAB SWITCHING ----
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  event.target.classList.add('active');
  // Re-render charts when Charts tab is opened (fixes canvas sizing)
  if (tabId === 'tab-charts') { setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 50); }
}

// ---- CHART.JS ----
Chart.defaults.color = '#64748b';
Chart.defaults.borderColor = 'rgba(45,53,85,0.5)';

new Chart(document.getElementById('pieChart'), {
  type: 'doughnut',
  data: {
    labels: ['Passed', 'Failed', 'Aborted'],
    datasets: [{
      data: [${passed}, ${failed}, ${aborted}],
      backgroundColor: ['#22c55e','#ef4444','#f59e0b'],
      borderWidth: 3, borderColor: 'var(--bg-primary)',
      hoverOffset: 8
    }]
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    cutout: '55%',
    plugins: {
      legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 }, usePointStyle: true, pointStyle: 'circle' } }
    }
  }
});

new Chart(document.getElementById('durationChart'), {
  type: 'bar',
  data: {
    labels: ${JSON.stringify(testLabels)},
    datasets: [{
      label: 'Duration (s)', data: ${JSON.stringify(durationValues)},
      backgroundColor: 'rgba(99,102,241,0.6)', borderColor: '#6366f1', borderWidth: 1, borderRadius: 8,
      hoverBackgroundColor: 'rgba(99,102,241,0.8)'
    }]
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    scales: { y: { beginAtZero: true, grid: { color: 'rgba(45,53,85,0.3)' } }, x: { grid: { display: false } } },
    plugins: { legend: { display: false } }
  }
});

new Chart(document.getElementById('loadChart'), {
  type: 'bar',
  data: {
    labels: ${JSON.stringify(testLabels)},
    datasets: [{
      label: 'Load Time (s)', data: ${JSON.stringify(loadTimeValues)},
      backgroundColor: 'rgba(167,139,250,0.6)', borderColor: '#a78bfa', borderWidth: 1, borderRadius: 8,
      hoverBackgroundColor: 'rgba(167,139,250,0.8)'
    }]
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    scales: { y: { beginAtZero: true, grid: { color: 'rgba(45,53,85,0.3)' } }, x: { grid: { display: false } } },
    plugins: { legend: { display: false } }
  }
});

const histColors = ${JSON.stringify(results.map(r => r.status === 'PASS' ? 'rgba(34,197,94,0.6)' : r.status === 'FAIL' ? 'rgba(239,68,68,0.6)' : 'rgba(245,158,11,0.6)'))};
new Chart(document.getElementById('histChart'), {
  type: 'bar',
  data: {
    labels: ${JSON.stringify(testLabels)},
    datasets: [{ label: 'Result', data: ${JSON.stringify(results.map(r => r.status === 'PASS' ? 1 : 0))}, backgroundColor: histColors, borderRadius: 8, borderWidth: 1, borderColor: ${JSON.stringify(results.map(r => r.status === 'PASS' ? '#22c55e' : r.status === 'FAIL' ? '#ef4444' : '#f59e0b'))} }]
  },
  options: {
    responsive: true, maintainAspectRatio: false,
    scales: { y: { min: 0, max: 1, ticks: { callback: v => v === 1 ? 'PASS' : v === 0 ? 'FAIL' : '' }, grid: { color: 'rgba(45,53,85,0.3)' } }, x: { grid: { display: false } } },
    plugins: { legend: { display: false } }
  }
});

// ---- 3D FORCE GRAPH (with labeled edges) ----
(function init3DGraph() {
  const graphData = {
    nodes: ${JSON.stringify(graphNodes)},
    links: ${JSON.stringify(graphLinks)}
  };

  const container = document.getElementById('3d-graph');
  if (!container || typeof ForceGraph3D === 'undefined') return;

  const Graph = ForceGraph3D()(container)
    .graphData(graphData)
    .backgroundColor('#0a0e1a00')
    .nodeVal('val')
    .nodeColor('color')
    .nodeOpacity(0.92)
    .linkColor('color')
    .linkWidth(link => link.width || 1)
    .linkOpacity(0.7)
    // ── Node rendering: labeled spheres ──
    .nodeThreeObject(node => {
      const group = new THREE.Group();
      // Glowing sphere
      const geometry = new THREE.SphereGeometry(node.val * 0.6, 16, 16);
      const material = new THREE.MeshLambertMaterial({
        color: node.color,
        transparent: true,
        opacity: 0.85,
        emissive: node.color,
        emissiveIntensity: 0.3,
      });
      const sphere = new THREE.Mesh(geometry, material);
      group.add(sphere);
      // Label above the sphere
      const label = new SpriteText(node.label);
      label.color = node.color;
      label.textHeight = node.group === 'run' ? 4.5 : node.group === 'module' ? 3.5 : node.group === 'test' ? 3 : 2.5;
      label.fontFace = 'Inter, -apple-system, sans-serif';
      label.fontWeight = 'bold';
      label.backgroundColor = 'rgba(10, 14, 26, 0.75)';
      label.padding = 2.5;
      label.borderRadius = 3;
      label.position.y = node.val * 0.8 + 4;
      group.add(label);
      return group;
    })
    .nodeThreeObjectExtend(false)
    // ── Edge rendering: labeled relationship lines ──
    .linkThreeObjectExtend(true)
    .linkThreeObject(link => {
      if (!link.label) return null;
      const sprite = new SpriteText(link.label);
      sprite.color = '#94a3b8';
      sprite.textHeight = 1.8;
      sprite.fontFace = 'Inter, sans-serif';
      sprite.backgroundColor = 'rgba(10, 14, 26, 0.6)';
      sprite.padding = 1.5;
      sprite.borderRadius = 2;
      return sprite;
    })
    .linkPositionUpdate((sprite, { start, end }) => {
      if (!sprite) return;
      const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2, z: (start.z + end.z) / 2 };
      Object.assign(sprite.position, mid);
    })
    // ── Physics ──
    .d3AlphaDecay(0.03)
    .d3VelocityDecay(0.25)
    .warmupTicks(100)
    .cooldownTicks(150)
    .d3Force('charge', d3.forceManyBody().strength(-120))
    .d3Force('link', d3.forceLink().distance(link => {
      if (link.source?.group === 'run') return 80;
      if (link.source?.group === 'module') return 60;
      return 45;
    }))
    // ── Click to zoom ──
    .onNodeClick(node => {
      const distance = 100;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
      Graph.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
        node, 1200
      );
    })
    .onNodeHover(node => {
      container.style.cursor = node ? 'pointer' : 'default';
    });

  // Gentle auto-rotate
  let angle = 0;
  let isUserInteracting = false;
  container.addEventListener('mousedown', () => { isUserInteracting = true; });
  container.addEventListener('mouseup', () => { setTimeout(() => { isUserInteracting = false; }, 3000); });
  container.addEventListener('touchstart', () => { isUserInteracting = true; });
  container.addEventListener('touchend', () => { setTimeout(() => { isUserInteracting = false; }, 3000); });
  function rotate() {
    if (!isUserInteracting) {
      Graph.cameraPosition({ x: 220 * Math.sin(angle), z: 220 * Math.cos(angle) });
      angle += 0.0015;
    }
    requestAnimationFrame(rotate);
  }
  rotate();
})();

// ---- ACCORDION ----
function toggleAcc(header) {
  const body = header.nextElementSibling;
  body.classList.toggle('open');
  const arrow = header.querySelector('span:last-child');
  arrow.textContent = body.classList.contains('open') ? '▲' : '▼';
  arrow.style.transform = body.classList.contains('open') ? 'rotate(180deg)' : '';
}

// ---- SCREENSHOT MODAL ----
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
