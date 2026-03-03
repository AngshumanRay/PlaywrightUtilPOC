// =============================================================================
// utils/helpers/enhanced-logger.ts — ADVANCED LOGGER WITH FILE OUTPUT
// =============================================================================
// PURPOSE:
//   An enhanced logger that goes beyond the basic console logger.
//   It writes logs to ROTATING FILES in addition to the terminal, and captures
//   structured data (timing, test names, error details) for the final report.
//
// WHAT IS LOG ROTATION?
//   Log rotation means: when a log file gets too large, or a new day starts,
//   the old file is archived and a new file is started.
//
//   Without rotation:
//     logs/app.log → grows forever → eventually fills your disk 😱
//
//   With rotation:
//     logs/2026-03-01.log  (Monday's logs)
//     logs/2026-03-02.log  (Tuesday's logs — auto-created at midnight)
//     logs/2026-03-03.log  (Wednesday's logs)
//     Older files auto-deleted after 14 days
//
// LOG LEVELS (from least important to most):
//   DEBUG  → Detailed info for developers (only shown when LOG_LEVEL=debug)
//   INFO   → Normal operations ("Test started", "Page loaded")
//   WARN   → Something unexpected but not fatal ("Retrying flaky step")
//   ERROR  → Something broke ("Login failed", "API returned 500")
//   STEP   → A test step being performed ("Step 1: Navigate to login page")
//   PASS   → A test or assertion passed ✅
//   FAIL   → A test or assertion failed ❌
//   SECTION→ A visual separator / section header
//
// HOW TO USE:
//   import { enhancedLogger } from '../helpers/enhanced-logger';
//
//   enhancedLogger.info('Test started');
//   enhancedLogger.step('Clicking the login button');
//   enhancedLogger.pass('TC01 passed in 2.3s');
//
//   // Collect performance data
//   enhancedLogger.logPerformance('TC01', { loadTime: 1200, renderTime: 300 });
//
//   // Collect accessibility issues
//   enhancedLogger.logAccessibility('TC01', violations);
//
//   // Get all collected data for the final report
//   const allLogs = enhancedLogger.getCollectedData();
//
// CONFIGURATION IN .env:
//   LOG_LEVEL=info        ← 'debug', 'info', 'warn', 'error' (default: info)
//   LOG_TO_FILE=true      ← Write logs to files in logs/ folder
//   LOG_FILE_MAX_DAYS=14  ← How many days of log files to keep
// =============================================================================

import * as fs   from 'fs';
import * as path from 'path';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * A single structured log entry saved for report generation.
 */
export interface LogEntry {
  timestamp: string;
  level:     'debug' | 'info' | 'warn' | 'error' | 'step' | 'pass' | 'fail' | 'section';
  message:   string;
  testName?: string;
  data?:     unknown;
}

/**
 * Performance metrics for a single test.
 */
export interface PerformanceData {
  testName:       string;
  /** Page load time in milliseconds */
  pageLoadMs?:    number;
  /** Time to first contentful paint in ms */
  fcpMs?:         number;
  /** Time to largest contentful paint in ms */
  lcpMs?:         number;
  /** Total test duration in ms */
  durationMs?:    number;
  /** Number of network requests made */
  requestCount?:  number;
  /** Total data transferred in bytes */
  transferBytes?: number;
  extras?:        Record<string, number | string>;
}

/**
 * One accessibility violation found by axe-core.
 */
export interface AccessibilityViolation {
  id:          string;
  impact:      'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  helpUrl:     string;
  nodes:       number;
}

// =============================================================================
// TERMINAL COLOR CODES
// =============================================================================
const C = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  red:     '\x1b[31m',
  cyan:    '\x1b[36m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
  white:   '\x1b[37m',
  bgGreen: '\x1b[42m',
  bgRed:   '\x1b[41m',
} as const;

// =============================================================================
// LOG LEVELS (numeric priority — higher = more severe)
// =============================================================================
const LOG_LEVEL_PRIORITY: Record<string, number> = {
  debug:   0,
  info:    1,
  warn:    2,
  error:   3,
  step:    1,
  pass:    1,
  fail:    3,
  section: 1,
};

// =============================================================================
// CLASS: EnhancedLogger
// =============================================================================
class EnhancedLogger {
  // Collected structured data (for report generation)
  private logs:         LogEntry[]             = [];
  private perfData:     PerformanceData[]       = [];
  private a11yData:     Map<string, AccessibilityViolation[]> = new Map();
  private testTimings:  Map<string, number>     = new Map(); // testName → start time

  // File writer stream
  private logFileStream: fs.WriteStream | null = null;
  private logFilePath:   string                = '';

  // Configuration
  private minLevel: number;
  private writeToFile: boolean;

  constructor() {
    this.minLevel   = LOG_LEVEL_PRIORITY[process.env['LOG_LEVEL'] ?? 'info'] ?? 1;
    this.writeToFile = (process.env['LOG_TO_FILE'] ?? 'true') === 'true';

    if (this.writeToFile) {
      this.initLogFile();
    }
  }

  // ===========================================================================
  // LOGGING METHODS
  // ===========================================================================

  /** Normal operational message (green ℹ) */
  info(message: string, testName?: string): void {
    this.log('info', message, testName);
  }

  /** Warning — unexpected but not fatal (yellow ⚠) */
  warn(message: string, testName?: string): void {
    this.log('warn', message, testName);
  }

  /** Error — something broke (red ✗) */
  error(message: string, testName?: string): void {
    this.log('error', message, testName);
  }

  /** Debug — detailed developer info (only shown when LOG_LEVEL=debug) */
  debug(message: string, testName?: string): void {
    this.log('debug', message, testName);
  }

  /** A test step being performed (blue ▶) */
  step(message: string, testName?: string): void {
    this.log('step', message, testName);
  }

  /** Test/assertion passed (bright green ✅) */
  pass(message: string, testName?: string): void {
    this.log('pass', message, testName);
  }

  /** Test/assertion failed (bright red ❌) */
  fail(message: string, testName?: string): void {
    this.log('fail', message, testName);
  }

  /** Visual section separator */
  section(title: string): void {
    const line = '─'.repeat(60);
    this.log('section', `\n${line}\n  ${title}\n${line}`);
  }

  // ===========================================================================
  // PERFORMANCE DATA COLLECTION
  // ===========================================================================

  /**
   * Records performance metrics for a test.
   * These are included in the final HTML report as charts.
   *
   * EXAMPLE:
   *   enhancedLogger.logPerformance('TC01 Login', {
   *     testName:    'TC01 Login',
   *     pageLoadMs:  1200,
   *     fcpMs:       800,
   *     durationMs:  3500,
   *     requestCount: 12,
   *   });
   */
  logPerformance(testName: string, data: Omit<PerformanceData, 'testName'>): void {
    this.perfData.push({ testName, ...data });
    this.debug(`Performance recorded for ${testName}: ${JSON.stringify(data)}`, testName);
  }

  /** Mark the start time for a test (used to calculate duration) */
  startTimer(testName: string): void {
    this.testTimings.set(testName, Date.now());
  }

  /** Mark the end time and record duration */
  stopTimer(testName: string): number {
    const start = this.testTimings.get(testName);
    if (!start) return 0;
    const durationMs = Date.now() - start;
    this.logPerformance(testName, { durationMs });
    return durationMs;
  }

  // ===========================================================================
  // ACCESSIBILITY DATA COLLECTION
  // ===========================================================================

  /**
   * Records accessibility violations from an axe-core scan.
   * These are included in the final HTML report.
   *
   * EXAMPLE (in a test):
   *   import AxeBuilder from '@axe-core/playwright';
   *   const results = await new AxeBuilder({ page }).analyze();
   *   enhancedLogger.logAccessibility('TC01', results.violations.map(v => ({
   *     id:          v.id,
   *     impact:      v.impact as any,
   *     description: v.description,
   *     helpUrl:     v.helpUrl,
   *     nodes:       v.nodes.length,
   *   })));
   */
  logAccessibility(testName: string, violations: AccessibilityViolation[]): void {
    this.a11yData.set(testName, violations);
    if (violations.length === 0) {
      this.pass(`♿ Accessibility: No violations found`, testName);
    } else {
      const critical = violations.filter(v => v.impact === 'critical' || v.impact === 'serious').length;
      this.warn(`♿ Accessibility: ${violations.length} violation(s) (${critical} critical/serious)`, testName);
    }
  }

  // ===========================================================================
  // DATA RETRIEVAL (for report generation)
  // ===========================================================================

  /** Returns all collected log entries */
  getLogs(): LogEntry[] { return [...this.logs]; }

  /** Returns all collected performance data */
  getPerformanceData(): PerformanceData[] { return [...this.perfData]; }

  /** Returns accessibility data for a specific test (or all if no name given) */
  getAccessibilityData(testName?: string): Map<string, AccessibilityViolation[]> | AccessibilityViolation[] {
    if (testName) return this.a11yData.get(testName) ?? [];
    return new Map(this.a11yData);
  }

  /** Returns everything collected (for passing to report generator) */
  getCollectedData(): {
    logs:          LogEntry[];
    performance:   PerformanceData[];
    accessibility: Record<string, AccessibilityViolation[]>;
  } {
    return {
      logs:          this.getLogs(),
      performance:   this.getPerformanceData(),
      accessibility: Object.fromEntries(this.a11yData),
    };
  }

  /** Clears all collected data (useful between test runs) */
  clear(): void {
    this.logs       = [];
    this.perfData   = [];
    this.a11yData   = new Map();
    this.testTimings = new Map();
  }

  // ===========================================================================
  // PRIVATE: log()
  // ===========================================================================
  private log(
    level: LogEntry['level'],
    message: string,
    testName?: string,
    data?: unknown
  ): void {
    // Check minimum log level
    const priority = LOG_LEVEL_PRIORITY[level] ?? 1;
    if (priority < this.minLevel) return;

    const timestamp = this.getTimestamp();
    const entry: LogEntry = { timestamp, level, message, testName, data };

    // Save to in-memory collection (for report)
    this.logs.push(entry);

    // Format and print to terminal
    const formatted = this.formatForTerminal(timestamp, level, message);
    if (level === 'error' || level === 'fail' || level === 'warn') {
      console.error(formatted);
    } else {
      console.log(formatted);
    }

    // Write to file if enabled
    if (this.writeToFile && this.logFileStream) {
      const plainLine = `[${timestamp}] [${level.toUpperCase().padEnd(7)}] ${testName ? `[${testName}] ` : ''}${message}\n`;
      this.logFileStream.write(plainLine);
    }
  }

  // ===========================================================================
  // PRIVATE: formatForTerminal()
  // ===========================================================================
  private formatForTerminal(timestamp: string, level: LogEntry['level'], message: string): string {
    const ts = `${C.dim}[${timestamp}]${C.reset}`;

    switch (level) {
      case 'info':    return `${ts} ${C.green}ℹ INFO${C.reset}  ${message}`;
      case 'warn':    return `${ts} ${C.yellow}⚠ WARN${C.reset}  ${message}`;
      case 'error':   return `${ts} ${C.red}✗ ERROR${C.reset} ${message}`;
      case 'debug':   return `${ts} ${C.cyan}◌ DEBUG${C.reset} ${message}`;
      case 'step':    return `${ts} ${C.blue}▶ STEP${C.reset}  ${C.blue}${message}${C.reset}`;
      case 'pass':    return `${ts} ${C.green}${C.bold}✅ PASS${C.reset}  ${C.green}${message}${C.reset}`;
      case 'fail':    return `${ts} ${C.red}${C.bold}❌ FAIL${C.reset}  ${C.red}${message}${C.reset}`;
      case 'section': return `${C.cyan}${C.bold}${message}${C.reset}`;
      default:        return `${ts} ${message}`;
    }
  }

  // ===========================================================================
  // PRIVATE: getTimestamp()
  // ===========================================================================
  private getTimestamp(): string {
    return new Date().toISOString().replace('T', ' ').split('.')[0];
  }

  // ===========================================================================
  // PRIVATE: initLogFile()
  // ===========================================================================
  private initLogFile(): void {
    try {
      const logsDir = path.resolve(process.cwd(), 'logs');
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      const date          = new Date().toISOString().split('T')[0];
      this.logFilePath    = path.join(logsDir, `test-run-${date}.log`);
      this.logFileStream  = fs.createWriteStream(this.logFilePath, { flags: 'a' });

      // Clean old log files
      this.cleanOldLogFiles(logsDir);

      this.log('info', `📋 Log file: ${this.logFilePath}`);
    } catch {
      // Non-fatal — continue without file logging if init fails
    }
  }

  // ===========================================================================
  // PRIVATE: cleanOldLogFiles()
  // ===========================================================================
  private cleanOldLogFiles(logsDir: string): void {
    const maxDays = parseInt(process.env['LOG_FILE_MAX_DAYS'] ?? '14', 10);
    const cutoff  = Date.now() - maxDays * 24 * 60 * 60 * 1000;

    try {
      const files = fs.readdirSync(logsDir);
      for (const file of files) {
        if (!file.startsWith('test-run-') || !file.endsWith('.log')) continue;
        const filePath = path.join(logsDir, file);
        const stat     = fs.statSync(filePath);
        if (stat.mtimeMs < cutoff) {
          fs.unlinkSync(filePath);
        }
      }
    } catch {
      // Non-fatal
    }
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================
// Export a single shared instance. All files import the same logger.
// This means all logs are collected in one place for the final report.
export const enhancedLogger = new EnhancedLogger();
